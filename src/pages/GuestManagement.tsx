import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Row, Col, Tag, message, Spin,
  Dropdown, MenuProps, Popconfirm, Space, Typography
} from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Guest } from '../types';
import { guestApi } from '../api';

const { Text } = Typography;

const GuestManagement = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await guestApi.getAllGuests();
      setGuests(data);
    } catch (error) {
      message.error('获取客人列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm) ||
    guest.id_card.includes(searchTerm)
  );

  const showModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      form.setFieldsValue({
        ...guest,
        note: Array.isArray(guest.preferences) ? guest.preferences.join(', ') : (guest.preferences || '')
      });
    } else {
      setEditingGuest(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const guestData = {
        name: values.name,
        phone: values.phone,
        id_card: values.id_card,
        email: values.email || '',
        preferences: values.note || ''
      };

      if (editingGuest) {
        await guestApi.updateGuest(editingGuest.id, guestData);
        message.success('客人信息更新成功');
      } else {
        await guestApi.createGuest(guestData);
        message.success('客人创建成功');
      }

      setIsModalVisible(false);
      fetchGuests();
    } catch (error: any) {
      message.error(editingGuest ? '更新失败' : (error.response?.data?.error || '创建失败'));
      console.error(error);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await guestApi.deleteGuest(id);
      message.success(`客人 ${name} 已删除`);
      fetchGuests();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getActionMenuItems = (record: Guest): MenuProps['items'] => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => showModal(record)
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: <Popconfirm
                title={`确定要删除客人「${record.name}」?`}
                description="删除后客人历史入住记录将丢失"
                okText="确认删除"
                cancelText="取消"
                onConfirm={() => handleDelete(record.id, record.name)}
              >
                <span style={{ color: '#ff4d4f' }}>删除</span>
              </Popconfirm>,
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      danger: true
    }
  ];

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col>
          <Input.Search
            placeholder="搜索客人姓名、电话、身份证"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 320 }}
            onSearch={fetchGuests}
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={() => showModal()} icon={<UserOutlined />}>
              登记客人
            </Button>
            <Button onClick={fetchGuests}>
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      <Card title="客人档案列表">
        <Spin spinning={loading}>
          <Table
            dataSource={filteredGuests}
            columns={[
              { title: '姓名', dataIndex: 'name', key: 'name',
                render: (t: string) => <Text strong>{t}</Text>,
                width: 100
              },
              { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
              { title: '身份证', dataIndex: 'id_card', key: 'id_card', 
                render: (t: string) => <Text type="secondary" code>{t?.slice(0,6)}****{t?.slice(-4)}</Text>,
                width: 150
              },
              {
                title: '历史入住',
                dataIndex: 'total_stays',
                key: 'total_stays',
                render: (stays: number) => stays > 0 ? (
                  <Tag color={stays >= 5 ? 'gold' : 'green'}>{stays} 次</Tag>
                ) : <Text type="secondary">首次</Text>,
                width: 100
              },
              { title: '备注', dataIndex: 'preferences', key: 'preferences',
                render: (arr: any) => Array.isArray(arr) ? arr.join(', ') : (arr || '-')
              },
              {
                title: '操作',
                key: 'actions',
                width: 60,
                render: (_, record: Guest) => (
                  <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                ),
              },
            ]}
            rowKey="id"
          />
        </Spin>
      </Card>

      <Modal
        title={editingGuest ? '编辑客人' : '登记客人信息'}
        width={460}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="入住人真实姓名" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="手机号码" name="phone" rules={[{ required: true, message: '必填' }]}>
                <Input placeholder="138xxxxxxxx" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="身份证号" name="id_card" rules={[{ required: true, message: '必填' }]}>
                <Input placeholder="3201xxxxxxxxxxxxxx" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注信息" name="note">
            <Input.TextArea placeholder="如：高楼层、不要靠马路、VIP、其他特殊要求等..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuestManagement;
