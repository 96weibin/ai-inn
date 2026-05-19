import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Tag, message, Spin, Space, Typography
} from 'antd';
import { Dayjs } from 'dayjs';
import { PLATFORMS, BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, Room, Guest, Booking } from '../types';
import { bookingApi, roomApi, guestApi, roomTemplateApi, RoomTemplate } from '../api';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stayDates, setStayDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [form] = Form.useForm();

  const fetchBookings = useCallback(async () => {
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
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [r, g, t] = await Promise.all([
        roomApi.getAllRooms(),
        guestApi.getAllGuests(),
        roomTemplateApi.getAll(),
      ]);
      setRooms(r);
      setGuests(g);
      setTemplates(t);
    } catch (e) {
      console.error('下拉选单数据加载失败');
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchAll();
  }, [fetchBookings, fetchAll]);

  const getRoomLabel = (room: Room) => {
    const t = room.room_template_uid ? templates.find(x => x.uid === room.room_template_uid) : null;
    return (
      <Space>
        <Text strong>{room.room_number}</Text>
        {t ? <Tag color={t.color}>{t.label}</Tag> : <Tag>{room.type}</Tag>}
        <Text type="secondary">{room.price}元/晚</Text>
        {room.status === 'maintenance' && <Tag color="volcano">维护中</Tag>}
        {room.status === 'cleaning' && <Tag color="gold">清洁中</Tag>}
      </Space>
    );
  };

  const nightCount = useMemo(() => {
    if (!stayDates || stayDates.length < 2) return 0;
    return stayDates[1].diff(stayDates[0], 'day');
  }, [stayDates]);

  const availableRoomsForDates = useMemo(() => {
    if (!stayDates || stayDates.length < 2) return rooms;

    const start = stayDates[0].format('YYYY-MM-DD');
    const end = stayDates[1].format('YYYY-MM-DD');

    const conflictRoomNumbers: string[] = [];

    for (const bkg of bookings) {
      if (bkg.status === 'cancelled' || bkg.status === 'checked-out') continue;
      if (bkg.check_in < end && bkg.check_out > start) {
        conflictRoomNumbers.push(bkg.room_number);
      }
    }

    return rooms.filter(r =>
      !conflictRoomNumbers.includes(r.room_number) &&
      r.status !== 'maintenance' &&
      r.status !== 'locked'
    );
  }, [rooms, bookings, stayDates]);

  const showModal = () => {
    form.resetFields();
    setStayDates(null);
    setIsModalVisible(true);
  };

  const onDatesChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setStayDates(dates);
      form.setFieldsValue({ check_in: dates[0], check_out: dates[1] });
    } else {
      setStayDates(null);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const roomUid = values.room_uid;
      const selectedRoom = rooms.find(r => r.uid === roomUid);

      const bookingData = {
        room_uid: roomUid,
        guest_uid: values.guest_uid,
        check_in: values.stay_dates ? values.stay_dates[0].format('YYYY-MM-DD') : values.check_in.format('YYYY-MM-DD'),
        check_out: values.stay_dates ? values.stay_dates[1].format('YYYY-MM-DD') : values.check_out.format('YYYY-MM-DD'),
        guests: values.guests || 1,
        platform: values.platform || '自营',
        price: values.price || selectedRoom?.price || 188,
      };

      await bookingApi.createBooking(bookingData);
      message.success('预订创建成功，房间已锁定');
      setIsModalVisible(false);
      fetchBookings();
      fetchAll();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || '创建失败，请重试');
      console.error(error);
    }
  };

  const handleDelete = (record: Booking) => {
    Modal.confirm({
      title: '确定要删除该预订吗?',
      content: `${record.guest_name || '客人'} 的 ${record.room_number || ''} 房间预订`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      maskClosable: false,
      onOk: async () => {
        try {
          await bookingApi.deleteBooking(record.uid);
          message.success('删除成功');
          fetchBookings();
        } catch (error) {
          message.error('删除失败');
        }
      }
    })
  };

  const handleCheckIn = async (uid: string) => {
    try {
      await bookingApi.checkIn(uid);
      message.success('办理入住成功');
      fetchBookings();
    } catch (error) {
      message.error('入住失败');
    }
  };

  const handleCheckOut = async (uid: string) => {
    try {
      await bookingApi.checkOut(uid);
      message.success('办理退房成功，房间已转为打扫中');
      fetchBookings();
      fetchAll();
    } catch (error) {
      message.error('退房失败');
    }
  };

  const onRoomSelect = (roomUid: string) => {
    const r = rooms.find(x => x.uid === roomUid);
    if (r) {
      form.setFieldsValue({ price: r.price });
    }
  };

  const searchGuests = async (query: string) => {
    if (!query || query.length < 1) return;
    try {
      const results = await guestApi.searchGuests(query);
      if (results.length > 0) {
        setGuests(results);
      }
    } catch { }
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Col>
          <Text type="secondary">
            已确认/在住: <Tag color="green">{bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length}</Tag>
            &nbsp;可售房间: <Tag color="blue">{availableRoomsForDates.length}</Tag>
          </Text>
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={showModal}>
              录入预订
            </Button>
            <Button onClick={() => { fetchBookings(); fetchAll(); }}>
              刷新
            </Button>
          </Space>
        </Col>
      </Row>

      <Card title="预订列表 / 今日抵达">
        <Spin spinning={loading}>
          <Table
            dataSource={bookings}
            columns={[
              { title: '房间', dataIndex: 'room_number',
                render: (t: string) => <Tag color="blue">{t}</Tag>,
                width: 90
              },
              { title: '客人姓名', dataIndex: 'guest_name', width: 110 },
              { title: '入住', dataIndex: 'check_in', width: 110 },
              { title: '退房', dataIndex: 'check_out', width: 110 },
              { title: '人数', dataIndex: 'guests', width: 70 },
              { title: '平台', dataIndex: 'platform',
                render: (p: string) => <Tag>{p}</Tag>,
                width: 90
              },
              { title: '金额', dataIndex: 'price', render: (p: number) => `${p}元`, width: 90 },
              { title: '状态', dataIndex: 'status',
                render: (s: string) => (
                  <Tag color={BOOKING_STATUS_COLORS[s]}>
                    {BOOKING_STATUS_LABELS[s] || s}
                  </Tag>
                ),
                width: 100
              },
              {
                title: '操作',
                width: 240,
                render: (_, record: any) => (
                  <Space size="small">
                    <Button size="small" danger onClick={() => handleDelete(record)}>删除</Button>
                    {record.status === 'confirmed' && (
                      <Button size="small" type="primary" onClick={() => handleCheckIn(record.uid)}>
                        入住
                      </Button>
                    )}
                    {record.status === 'checked-in' && (
                      <Button size="small" onClick={() => handleCheckOut(record.uid)}>
                        退房
                      </Button>
                    )}
                  </Space>
                ),
              },
            ]}
            rowKey="uid"
          />
        </Spin>
      </Card>

      <Modal
        title="录入新预订"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="确认预订"
        cancelText="取消"
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16} align="bottom">
            <Col span={18}>
              <Form.Item label="入离日期" name="stay_dates" rules={[{ required: true, message: '请先选择入住和退房日期' }]}>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={onDatesChange}
                  placeholder={['选择入住日', '选择退房日']}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label=" ">
                {nightCount > 0 ? (
                  <Space>
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      共 {nightCount + 1} 天
                    </Tag>
                    <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {nightCount} 晚
                    </Tag>
                  </Space>
                ) : <Text type="secondary">选完日期自动计算</Text>}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={stayDates && availableRoomsForDates.length < 6 ? 24 : 14}>
              <Form.Item label="可售房间" name="room_uid" rules={[{ required: true, message: '请选择房间，日期变更后会重新计算可售库存' }]}>
                <Select
                  placeholder={stayDates ? `当前 ${availableRoomsForDates.length} 间可售` : '选完日期后加载可售房间'}
                  disabled={!stayDates}
                  showSearch
                  onSelect={onRoomSelect}
                >
                  {availableRoomsForDates.map(room => (
                    <Select.Option key={room.uid} value={room.uid}>
                      {getRoomLabel(room)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="房价" name="price">
                <Input type="number" addonAfter="元" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="选择客人" name="guest_uid" rules={[{ required: true, message: '请从档案选择或先新登记客人' }]}>
            <Select
              placeholder="输入姓名/手机号搜索，从客史匹配"
              showSearch
              allowClear
              filterOption={false}
              onSearch={searchGuests}
              notFoundContent="输入关键字搜索客史档案"
            >
              {guests.map(g => (
                <Select.Option key={g.uid} value={g.uid}>
                  <Space>
                    <span style={{fontWeight: 500}}>{g.name}</span>
                    <span style={{color: '#888'}}>{g.phone}</span>
                    {g.total_stays > 0 && <Tag color="green">回头客{g.total_stays}次</Tag>}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="人数" name="guests" rules={[{ required: true }]} initialValue={1}>
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="预订来源" name="platform" rules={[{ required: true }]} initialValue="自营">
                <Select>
                  {PLATFORMS.map(platform => (
                    <Select.Option key={platform} value={platform}>{platform}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingManagement;
