import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Row, Col, message,
  Dropdown, MenuProps, Space, Typography, ColorPicker, Spin
} from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { roomTemplateApi, RoomTemplate } from '../api';

const { Text } = Typography;

const RoomTemplateManagement = () => {
  const [items, setItems] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editItem, setEditItem] = useState<RoomTemplate | null>(null);
  const [form] = Form.useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await roomTemplateApi.getAll();
      setItems(data);
    } catch (e: any) {
      message.error(e.response?.data?.error || '加载房型配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const showModal = (it?: RoomTemplate) => {
    if (it) { setEditItem(it); form.setFieldsValue({ ...it }); }
    else { setEditItem(null); form.resetFields(); }
    setVisible(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const colorHex = values.color && typeof values.color === 'object' ? values.color.hexString : values.color;
    const payload = { label: values.label, color: colorHex ?? '#1890ff', default_price: values.default_price, max_guests: values.max_guests, description: values.description || '' };
    try {
      if (editItem) {
        await roomTemplateApi.update(editItem.uid, payload);
        message.success('更新成功');
      } else {
        await roomTemplateApi.create(payload);
        message.success('房型添加成功');
      }
      setVisible(false);
      fetch();
    } catch (e: any) {
      message.error(e.response?.data?.error || '操作失败');
    }
  };

  const getActions = (record: RoomTemplate): MenuProps['items'] => [
    { key: 'e', label: '编辑', icon: <EditOutlined />, onClick: () => showModal(record) },
    { type: 'divider' },
    { 
      key: 'd', danger: true, 
      icon: <DeleteOutlined />,
      label: <span style={{ color: '#ff4d4f' }}>删除</span>,
      onClick: () => {
        Modal.confirm({
          title: '确定删除此房型吗?',
          content: '删除后已配置该类型的房间识别会受到影响',
          okText: '删除',
          okType: 'danger',
          cancelText: '取消',
          maskClosable: false,
          onOk: async () => {
            try {
              await roomTemplateApi.delete(record.uid);
              message.success('已删除');
              fetch();
            } catch (e: any) {
              message.error(e.response?.data?.error || '删除失败');
            }
          }
        });
      }
    },
  ];

  return (
    <div>
      <Row style={{ marginBottom: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <Text type="secondary">酒店房型配置表，所有房间的房型统一管理</Text>
        </Col>
        <Col>
          <Space>
            <Button onClick={fetch} icon={<SyncOutlined spin={loading} />}>刷新</Button>
            <Button type="primary" onClick={() => showModal()} icon={<PlusOutlined />}>新建房型</Button>
          </Space>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Table
          dataSource={items}
          columns={[
            { title: '房型名', dataIndex: 'label', key: 'label',
              render: (l: string, r: RoomTemplate) => <span style={{ color: r.color, fontWeight: 600 }}>{l}</span>
            },
            { title: '颜色', key: 'color',
              render: (_: any, r: RoomTemplate) => <ColorPicker value={r.color} disabled showText />
            },
            { title: '默认指导价', dataIndex: 'default_price',
              render: (p: number) => `${p} 元`
            },
            { title: '可住', dataIndex: 'max_guests',
              render: (n: number) => `${n} 人`
            },
            { title: '说明', dataIndex: 'description', key: 'desc' },
            { title: '操作', key: 'act',
              render: (_, rec) => <Dropdown menu={{ items: getActions(rec) }} placement="bottomRight"><Button type="text" icon={<MoreOutlined />} /></Dropdown>
            }
          ]}
          rowKey="uid"
        />
      </Spin>

      <Modal title={editItem ? '编辑房型' : '新建房型'} open={visible} onOk={handleOk} onCancel={() => setVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="房型名" name="label" rules={[{ required: true }]}>
            <Input placeholder="如：豪华大床房、行政双人间" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="默认价格" name="default_price">
                <InputNumber addonAfter="元" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="可住人数" name="max_guests">
                <InputNumber addonAfter="人" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="颜色标记" name="color" initialValue="#1890ff">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item label="描述说明" name="description">
            <Input.TextArea rows={2} placeholder="备注说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomTemplateManagement;
