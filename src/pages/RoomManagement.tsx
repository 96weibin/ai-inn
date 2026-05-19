import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Row, Col, Tag, message, Spin,
  Dropdown, MenuProps, Space, Typography, Divider
} from 'antd';
import {
  MoreOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined,
  SettingOutlined, ReloadOutlined
} from '@ant-design/icons';
import { ROOM_STATUS_COLORS, ROOM_STATUS_LABELS, ROOM_TYPE_LABELS } from '../types';
import { Room } from '../types';
import { roomApi } from '../api';

const { Text } = Typography;

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const [priceForm] = Form.useForm();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomApi.getAllRooms();
      setRooms(data);
    } catch (error) {
        message.error('获取房间列表失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room =>
    (room.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showInfoModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      form.setFieldsValue({ ...room });
    } else {
      setEditingRoom(null);
      form.resetFields();
    }
    setIsInfoModalVisible(true);
  };

  const handleInfoOk = async () => {
    try {
      const values = await form.validateFields();
      const roomData = {
        ...values,
        floor: parseInt(values.floor),
        price: parseFloat(values.price),
        max_guests: parseInt(values.max_guests),
      };

      if (editingRoom) {
        await roomApi.updateRoom(editingRoom.uid, roomData);
        message.success('房间信息更新成功');
      } else {
        await roomApi.createRoom(roomData);
        message.success('房间创建成功');
      }

      setIsInfoModalVisible(false);
      fetchRooms();
    } catch (error) {
      message.error(editingRoom ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  const showPriceStatusModal = (room: Room) => {
    setEditingRoom(room);
    priceForm.setFieldsValue({ name: room.name, price: room.price, status: room.status });
    setIsPriceModalVisible(true);
  };

  const handlePriceOk = async () => {
    try {
      const values = await priceForm.validateFields();
      await roomApi.updateRoom(editingRoom!.uid, {
        name: values.name,
        price: parseFloat(values.price),
        status: values.status,
      });
      message.success(`${editingRoom?.room_number} 更新成功`);
      setIsPriceModalVisible(false);
      fetchRooms();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = (record: Room) => {
    Modal.confirm({
      title: `确定要删除房间 ${record.room_number}?`,
      content: '此操作不可恢复，请谨慎操作',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      maskClosable: false,
      onOk: async () => {
        try {
          await roomApi.deleteRoom(record.uid);
          message.success(`房间 ${record.room_number} 已删除`);
          fetchRooms();
        } catch (error) {
          message.error('删除失败');
        }
      }
    })
  };

  const handleStatusChange = async (uid: string, status: string) => {
    try {
      await roomApi.updateRoomStatus(uid, status);
      message.success('状态更新成功');
      fetchRooms();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const getActionMenuItems = (record: Room): MenuProps['items'] => [
    {
      key: 'price',
      label: '调价/改状态',
      icon: <ReloadOutlined />,
      onClick: () => showPriceStatusModal(record)
    },
    { type: 'divider' },
    {
      key: 'edit',
      label: '编辑基础信息',
      icon: <EditOutlined />,
      onClick: () => showInfoModal(record)
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: <span style={{ color: '#ff4d4f' }}>删除房间</span>,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      onClick: () => handleDelete(record),
      danger: true,
    },
  ];

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <Input.Search
            placeholder="搜索房间名/房间号/房型"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 320 }}
            onSearch={fetchRooms}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={() => showInfoModal()} icon={<SafetyCertificateOutlined />}>
              新建房间
            </Button>
            <Button onClick={fetchRooms} >
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      <Card title={
        <Space>
          <SettingOutlined />
          <span>酒店资源维护</span>
          <Text type="secondary" style={{ fontSize: 13 }}>
            - 房间基础信息稳定后不常变动，点右侧「···」可快速调价/改状态
          </Text>
        </Space>
      }>
        <Spin spinning={loading}>
          <Table
            dataSource={filteredRooms}
            columns={[
              { title: '房间号', dataIndex: 'room_number', key: 'room_number',
                render: (t: string) => <Text strong>{t}</Text>,
                width: 95
              },
              { title: '房间名', dataIndex: 'name', key: 'name',
                render: (t: string) => t ? <Tag color="blue">{t}</Tag> : '-',
                width: 140
              },
              { title: '楼层', dataIndex: 'floor', key: 'floor', width: 70 },
              { title: '房型', dataIndex: 'type', key: 'type',
                render: (type: string) => ROOM_TYPE_LABELS[type] || type,
                width: 100
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 115,
                render: (status: string, record: Room) => (
                  <Select
                    value={status}
                    onChange={(value) => handleStatusChange(record.uid, value)}
                    style={{ width: 110 }}
                    size="small"
                  >
                    {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                      <Select.Option key={key} value={key}>
                        <Tag color={ROOM_STATUS_COLORS[key] || '#d9d9d9'} style={{ border: 'none' }}>
                          {label}
                        </Tag>
                      </Select.Option>
                    ))}
                  </Select>
                ),
              },
              { title: '价格', dataIndex: 'price', key: 'price',
                render: (price: number) => <Text code>{price}元</Text>,
                width: 85
              },
              { title: '可住', dataIndex: 'max_guests', key: 'max_guests',
                render: (num: number) => `${num}人`,
                width: 70
              },
              { title: '有窗', dataIndex: 'has_window', key: 'has_window',
                render: (has: boolean) => has ? '✅' : '-',
                width: 60
              },
              {
                title: '操作',
                key: 'actions',
                width: 60,
                fixed: 'right' as const,
                render: (_, record: Room) => (
                  <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                ),
              },
            ]}
            rowKey="uid"
            scroll={{ x: 900 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRoom && isInfoModalVisible ? '编辑房间【基础信息】' : '新建酒店房间'}
        width={520}
        open={isInfoModalVisible}
        onOk={handleInfoOk}
        onCancel={() => setIsInfoModalVisible(false)}
      >
        <Divider orientation="left" orientationMargin="0">稳定属性，一般不变</Divider>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="房间号" name="room_number" rules={[{ required: true }]}>
                <Input placeholder="如: 101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="房间名/别名" name="name">
                <Input placeholder="如: 山景大床房、豪华套间" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="楼层" name="floor" rules={[{ required: true }]}>
                <Input type="number" placeholder="1-10" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="房型" name="type" rules={[{ required: true }]}>
                <Select>
                  {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
                    <Select.Option key={key} value={key}>{label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="最多入住" name="max_guests" rules={[{ required: true }]}>
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="挂牌价" name="price" rules={[{ required: true }]}>
                <Input type="number" addonAfter="元/晚" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="有窗户" name="has_window">
                <Select defaultValue={true}>
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={`${editingRoom?.room_number || ''} 实时调价/改状态`}
        width={420}
        open={isPriceModalVisible}
        onOk={handlePriceOk}
        onCancel={() => setIsPriceModalVisible(false)}
      >
        <Form form={priceForm} layout="vertical">
          <Form.Item label="房间名/备注" name="name">
            <Input placeholder="如: 今日特惠房" />
          </Form.Item>
          <Form.Item label="房态" name="status" rules={[{ required: true }]}>
            <Select>
              {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="今日房价" name="price" rules={[{ required: true }]}>
            <Input type="number" addonAfter="元/晚" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
