import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Tag, message, Spin } from 'antd';
import dayjs from 'dayjs';
import { PLATFORMS, BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, Booking } from '../types';
import { bookingApi } from '../api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [form] = Form.useForm();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getAllBookings();
      setBookings(data);
    } catch (error) {
      message.error('获取预订列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const showModal = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      form.setFieldsValue({
        ...booking,
        check_in: dayjs(booking.check_in),
        check_out: dayjs(booking.check_out),
      });
    } else {
      setEditingBooking(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const bookingData = {
        ...values,
        check_in: values.check_in.format('YYYY-MM-DD'),
        check_out: values.check_out.format('YYYY-MM-DD'),
      };

      if (editingBooking) {
        await bookingApi.updateBooking(editingBooking.id, bookingData);
        message.success('预订更新成功');
      } else {
        await bookingApi.createBooking(bookingData);
        message.success('预订创建成功');
      }

      setIsModalVisible(false);
      fetchBookings();
    } catch (error) {
      message.error(editingBooking ? '更新失败' : '创建失败（请先确认房间状态是空闲）');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bookingApi.deleteBooking(id);
      message.success('删除成功');
      fetchBookings();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCheckIn = async (id: number) => {
    try {
      await bookingApi.checkIn(id);
      message.success('办理入住成功');
      fetchBookings();
    } catch (error) {
      message.error('入住失败');
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await bookingApi.checkOut(id);
      message.success('办理退房成功，房间已转为打扫中');
      fetchBookings();
    } catch (error) {
      message.error('退房失败');
    }
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Col></Col>
        <Col>
          <Button type="primary" onClick={() => showModal()}>
            添加预订
          </Button>
          <Button onClick={fetchBookings} style={{ marginLeft: 8 }}>
            刷新
          </Button>
        </Col>
      </Row>

      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={bookings}
            columns={[
              { title: '预订号', dataIndex: 'id', key: 'id' },
              { title: '房间ID', dataIndex: 'room_id', key: 'room_id' },
              { title: '客人ID', dataIndex: 'guest_id', key: 'guest_id' },
              { title: '入住', dataIndex: 'check_in', key: 'check_in' },
              { title: '退房', dataIndex: 'check_out', key: 'check_out' },
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
                render: (status: string) => (
                  <Tag color={BOOKING_STATUS_COLORS[status]}>
                    {BOOKING_STATUS_LABELS[status] || status}
                  </Tag>
                ),
              },
              {
                title: '操作',
                key: 'actions',
                render: (_, record: Booking) => (
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
        </Spin>
      </Card>

      <Modal
        title={editingBooking ? '编辑预订' : '添加预订'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="房间ID" name="room_id" rules={[{ required: true }]}>
            <Input type="number" placeholder="例如: 1" />
          </Form.Item>
          <Form.Item label="客人ID" name="guest_id" rules={[{ required: true }]}>
            <Input type="number" placeholder="例如: 1" />
          </Form.Item>
          <Form.Item label="入住日期" name="check_in" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="退房日期" name="check_out" rules={[{ required: true }]}>
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
