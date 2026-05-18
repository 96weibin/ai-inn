import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Row, Col, Tag, message, Spin,
  Dropdown, MenuProps, Space, Typography
} from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { roomApi, roomTemplateApi, RoomTemplate } from '../api';

const { Text } = Typography;
const { Option } = Select;

const RoomConfiguration = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [form] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [roomsData, typesData] = await Promise.all([
        roomApi.getAllRooms(),
        roomTemplateApi.getAll()
      ]);
      setRooms(roomsData);
      setTemplates(typesData);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const showModal = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      form.setFieldsValue({ ...room });
    } else {
      setEditingRoom(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const selectedTemplate = templates.find(t => t.uid === values.room_template_uid);
    
    if (!selectedTemplate) {
      message.warning('请选择房型');
      return;
    }

    const roomData = {
      type: selectedTemplate.type,
      room_template_uid: values.room_template_uid,
      room_number: values.room_number,
      name: values.name || '',
      floor: parseInt(values.floor),
      price: selectedTemplate.default_price,
      max_guests: selectedTemplate.max_guests,
      has_window: values.has_window ?? true,
      status: 'available',
    };

    try {
      if (editingRoom) {
        await roomApi.updateRoom(editingRoom.id, roomData as any);
        message.success('房间更新成功');
      } else {
        await roomApi.createRoom(roomData as any);
        message.success('房间创建成功');
      }
      setModalVisible(false);
      fetchAll();
    } catch (error: any) {
      message.error(error.response?.data?.detail || '操作失败');
    }
  };

  const handleTemplateChange = (templateUid: string) => {
    const t = templates.find(x => x.uid === templateUid);
    if (t) {
      form.setFieldsValue({
        price: t.default_price,
        max_guests: t.max_guests
      });
    }
  };

  const handleDelete = (id: number, num: string) => {
    Modal.confirm({
      title: `确定删除房间 ${num} 吗?`,
      content: '删除后该房间配置将被移除，需要重新添加。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      maskClosable: false,
      onOk: async () => {
        try {
          await roomApi.deleteRoom(id);
          message.success(`房间 ${num} 已删除`);
          fetchAll();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  const getActions = (record: any): MenuProps['items'] => [
    { key: 'e', label: '编辑', icon: <EditOutlined />, onClick: () => showModal(record) },
    { type: 'divider' },
    { key: 'd', label: <span style={{color:'#ff4d4f'}}>删除房间</span>, danger: true, icon: <DeleteOutlined />, onClick: () => handleDelete(record.id, record.room_number) }
  ];

  const renderRoomType = (_: string, record: any) => {
    const template = record.room_template_uid 
      ? templates.find(t => t.uid === record.room_template_uid) 
      : templates.find(t => t.type === record.type);
    return template ? <Tag color={template.color}>{template.label}</Tag> : '-';
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <Text type="secondary">配置酒店有哪些房间，选择房型后指导价/可住人数自动带入</Text>
        </Col>
        <Col>
          <Button type="primary" onClick={() => showModal()} icon={<PlusOutlined />}>添加房间</Button>
        </Col>
      </Row>
      <Card title={<Space><HomeOutlined /><span>酒店房间配置</span></Space>}>
        <Spin spinning={loading}>
          <Table
            dataSource={rooms}
            columns={[
              { title: '房间号', dataIndex: 'room_number', width: 95, render: (t:string) => <Text strong>{t}</Text> },
              { title: '房间名', dataIndex: 'name', render: (t:string) => t ? <Tag color="blue">{t}</Tag> : '-' },
              { title: '楼层', dataIndex: 'floor', width: 70 },
              { title: '房型', dataIndex: 'type', render: renderRoomType },
              { title: '定价', dataIndex: 'price', render: (p:number) => `${p}元` },
              { title: '可住', dataIndex: 'max_guests', render: (n:number) => `${n}人` },
              { title: '操作', width: 60, render: (_:any, rec:any) => (
                <Dropdown menu={{ items: getActions(rec) }}><Button type="text" icon={<MoreOutlined />} /></Dropdown>
              )}
            ]}
            rowKey="id"
          />
        </Spin>
      </Card>

      <Modal title={editingRoom ? '编辑房间' : '添加酒店房间'} open={modalVisible} onOk={handleOk} onCancel={()=>setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="房间号" name="room_number" rules={[{required:true, message:'请输入房间号'}]}><Input placeholder="101, 308..." /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="楼层" name="floor" rules={[{required:true, message:'请输入楼层'}]}><Input type="number" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item label="选择房型" name="room_template_uid" rules={[{required:true, message:'请选择房型'}]}>
                <Select placeholder="请选择房型" onChange={handleTemplateChange}>
                  {templates.map(t => (
                    <Option key={t.uid} value={t.uid}>
                      <Tag color={t.color}>{t.label}</Tag> {t.default_price}元
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="房间别名(可选)" name="name"><Input placeholder="山景房/特惠房" /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="价格" name="price"><Input type="number" addonAfter="元" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大入住" name="max_guests"><Input type="number" addonAfter="人" /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomConfiguration;
