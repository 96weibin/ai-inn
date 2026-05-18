import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Spin, message } from 'antd';
import { Room, Booking, BOOKING_STATUS_LABELS } from '../types';
import { roomApi, bookingApi } from '../api';

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [roomsData, bookingsData] = await Promise.all([
        roomApi.getAllRooms(),
        bookingApi.getAllBookings(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (error) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalRooms = rooms.length;
  const statusCount: Record<string, number> = {};
  rooms.forEach(r => {
    statusCount[r.status] = (statusCount[r.status] || 0) + 1;
  });

  const available = statusCount['available'] || 0;
  const occupied = statusCount['occupied'] || 0;
  const cleaning = statusCount['cleaning'] || 0;
  const maintenance = statusCount['maintenance'] || 0;

  const percent = (count: number) => totalRooms ? Math.round((count / totalRooms) * 100) : 0;

  return (
    <div>
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="房间总数"
                value={totalRooms}
                suffix="间"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="空闲房间"
                value={available}
                suffix="间"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已入住"
                value={occupied}
                suffix="间"
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="入住率"
                value={percent(occupied + cleaning)}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="房间状态分布" extra={<a onClick={fetchStats}>刷新</a>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>空闲房间</span>
                    <span>{available}间 ({percent(available)}%)</span>
                  </div>
                  <Progress percent={percent(available)} strokeColor="#52c41a" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>入住中</span>
                    <span>{occupied}间 ({percent(occupied)}%)</span>
                  </div>
                  <Progress percent={percent(occupied)} strokeColor="#ff4d4f" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>打扫中</span>
                    <span>{cleaning}间 ({percent(cleaning)}%)</span>
                  </div>
                  <Progress percent={percent(cleaning)} strokeColor="#faad14" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>维修中</span>
                    <span>{maintenance}间 ({percent(maintenance)}%)</span>
                  </div>
                  <Progress percent={percent(maintenance)} strokeColor="#d9d9d9" />
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="数据库初始化统计">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: 12, background: '#e6f7ff', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600 }}>房间数据</div>
                  <div style={{ color: '#666', fontSize: 12 }}>从数据库读取 {rooms.length} 条房间记录</div>
                </div>
                <div style={{ padding: 12, background: '#f6ffed', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600 }}>预订数据</div>
                  <div style={{ color: '#666', fontSize: 12 }}>当前 {bookings.length} 条预订记录</div>
                </div>
                <div style={{ padding: 12, background: '#fff7e6', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600 }}>下一步</div>
                  <div style={{ color: '#666', fontSize: 12 }}>去「房间管理」选个空闲房 → 「预订管理」里新增预订</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="预订列表（实时）">
              <Table
                dataSource={bookings}
                columns={[
                  { title: '预订ID', dataIndex: 'id', key: 'id' },
                  { title: '房间ID', dataIndex: 'room_id', key: 'room_id' },
                  { title: '客人ID', dataIndex: 'guest_id', key: 'guest_id' },
                  { title: '入住', dataIndex: 'check_in', key: 'check_in' },
                  { title: '退房', dataIndex: 'check_out', key: 'check_out' },
                  { title: '平台', dataIndex: 'platform', key: 'platform' },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (s: string) => BOOKING_STATUS_LABELS[s] || s
                  },
                ]}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
