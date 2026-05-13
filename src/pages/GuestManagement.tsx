import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Row, Col, Tag } from 'antd';

const GuestManagement = () => {
  const [guests, setGuests] = useState([
    { id: '1', name: '张三', phone: '138****1234', idCard: '3201****1990', email: 'zhangsan@example.com', preferences: ['安静', '高层'], totalStays: 5 },
    { id: '2', name: '李四', phone: '139****5678', idCard: '3202****1992', email: 'lisi@example.com', preferences: ['有窗', 'WiFi'], totalStays: 3 },
    { id: '3', name: '王五', phone: '137****9012', idCard: '3203****1988', preferences: ['家庭房'], totalStays: 8 },
    { id: '4', name: '赵六', phone: '136****3456', idCard: '3204****1995', email: 'zhaoliu@example.com', totalStays: 2 },
    { id: '5', name: '钱七', phone: '135****7890', idCard: '3205****1991', preferences: ['套房'], totalStays: 10 },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGuest, setEditingGuest] = useState<typeof guests[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm) ||
    guest.idCard.includes(searchTerm)
  );

  const showModal = (guest?: typeof guests[0]) => {
    if (guest) {
      setEditingGuest(guest);
      form.setFieldsValue(guest);
    } else {
      setEditingGuest(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingGuest) {
        setGuests(guests.map(g => g.id === editingGuest.id ? { ...g, ...values } : g));
      } else {
        setGuests([...guests, { ...values, id: Date.now().toString(), totalStays: 0 }]);
      }
      setIsModalVisible(false);
    });
  };

  const handleDelete = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Col>
          <Input
            placeholder="搜索客人姓名、电话或身份证"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Button type="primary" onClick={() => showModal()}>
            添加客人
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={filteredGuests}
          columns={[
            { 
              title: '头像', 
              key: 'avatar', 
              render: () => (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  客
                </div>
              ),
            },
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '电话', dataIndex: 'phone', key: 'phone' },
            { title: '身份证', dataIndex: 'idCard', key: 'idCard' },
            { title: '邮箱', dataIndex: 'email', key: 'email' },
            { 
              title: '入住次数', 
              dataIndex: 'totalStays', 
              key: 'totalStays',
              render: (stays: number) => (
                <Tag color={stays >= 5 ? 'gold' : stays >= 3 ? 'blue' : 'default'}>
                  {stays}次
                </Tag>
              ),
            },
            { title: '偏好', dataIndex: 'preferences', key: 'preferences', render: (pref: string[]) => pref?.join(', ') || '-' },
            {
              title: '操作',
              key: 'actions',
              render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={() => showModal(record)}>编辑</Button>
                  <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
                </div>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingGuest ? '编辑客人' : '添加客人'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="电话" name="phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="身份证" name="idCard" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="偏好（逗号分隔）" name="preferences">
            <Input placeholder="例如：安静, 高层" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuestManagement;
