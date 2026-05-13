import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Tag } from 'antd';
import { PLATFORMS } from '../types';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([
    { id: '1', room: '201', guest: '张三', checkIn: '2024-01-15', checkOut: '2024-01-18', guests: 2, status: 'checked-in', platform: '美团民宿', price: 840 },
    { id: '2', room: '302', guest: '李四', checkIn: '2024-01-16', checkOut: '2024-01-20', guests: 2, status: 'confirmed', platform: 'Booking.com', price: 1120 },
    { id: '3', room: '101', guest: '王五', checkIn: '2024-01-17', checkOut: '2024-01-19', guests: 1, status: 'confirmed', platform: '携程', price: 360 },
    { id: '4', room: '401', guest: '赵六', checkIn: '2024-01-18', checkOut: '2024-01-22', guests: 4, status: 'confirmed', platform: 'Airbnb', price: 1920 },
    { id: '5', room: '301', guest: '钱七', checkIn: '2024-01-15', checkOut: '2024-01-17', guests: 2, status: 'checked-out', platform: '飞猪', price: 960 },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<typeof bookings[0] | null>(null);
  const [form] = Form.useForm();

  const showModal = (booking?: typeof bookings[0]) => {
    if (booking) {
      setEditingBooking(booking);
      form.setFieldsValue(booking);
    } else {
      setEditingBooking(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingBooking) {
        setBookings(bookings.map(b => b.id === editingBooking.id ? { ...b, ...values } : b));
      } else {
        setBookings([...bookings, { ...values, id: Date.now().toString() }]);
      }
      setIsModalVisible(false);
    });
  };

  const handleDelete = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const handleCheckIn = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'checked-in' } : b));
  };

  const handleCheckOut = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'checked-out' } : b));
  };

  const statusColors: Record<string, string> = {
    'confirmed': 'blue',
    'checked-in': 'green',
    'checked-out': 'gray',
    'cancelled': 'red',
  };

  const statusLabels: Record<string, string> = {
    'confirmed': '已确认',
    'checked-in': '入住中',
    'checked-out': '已退房',
    'cancelled': '已取消',
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={() => showModal()}>
          添加预订
        </Button>
      </Row>

      <Card>
        <Table
          dataSource={bookings}
          columns={[
            { title: '预订号', dataIndex: 'id', key: 'id' },
            { title: '房间', dataIndex: 'room', key: 'room' },
            { title: '客人', dataIndex: 'guest', key: 'guest' },
            { title: '入住', dataIndex: 'checkIn', key: 'checkIn' },
            { title: '退房', dataIndex: 'checkOut', key: 'checkOut' },
            { title: '人数', dataIndex: 'guests', key: 'guests' },
            { 
              title: '平台', 
              dataIndex: 'platform', 
              key: 'platform',
              render: (platform: string) => <Tag>{platform}</Tag>,
            },
            { title: '金额', dataIndex: 'price', key: 'price', render: (price: number) => `${price}元` },
            { 
              title: '状态', 
              dataIndex: 'status', 
              key: 'status',
              render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
            },
            {
              title: '操作',
              key: 'actions',
              render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={() => showModal(record)}>编辑</Button>
                  <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
                  {record.status === 'confirmed' && (
                    <Button type="primary" onClick={() => handleCheckIn(record.id)}>
                      入住
                    </Button>
                  )}
                  {record.status === 'checked-in' && (
                    <Button onClick={() => handleCheckOut(record.id)}>
                      退房
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingBooking ? '编辑预订' : '添加预订'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="房间" name="room" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="客人" name="guest" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="入住日期" name="checkIn" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="退房日期" name="checkOut" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="人数" name="guests" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="平台" name="platform" rules={[{ required: true }]}>
            <Select>
              {PLATFORMS.map(platform => (
                <Select.Option key={platform} value={platform}>{platform}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="金额" name="price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingManagement;
