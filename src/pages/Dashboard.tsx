import { Card, Row, Col, Statistic, Progress, Table } from 'antd';

const Dashboard = () => {
  const recentBookings = [
    { key: '1', guest: '张三', room: '201', checkIn: '2024-01-15', checkOut: '2024-01-18', status: '入住中' },
    { key: '2', guest: '李四', room: '302', checkIn: '2024-01-16', checkOut: '2024-01-20', status: '已确认' },
    { key: '3', guest: '王五', room: '101', checkIn: '2024-01-17', checkOut: '2024-01-19', status: '已确认' },
    { key: '4', guest: '赵六', room: '401', checkIn: '2024-01-18', checkOut: '2024-01-22', status: '已确认' },
  ];

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="房间总数"
              value={50}
              suffix="间"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日入住"
              value={8}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日营收"
              value={12800}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="入住率"
              value={76}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="房间状态分布">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>空闲房间</span>
                  <span>12间 (24%)</span>
                </div>
                <Progress percent={24} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>入住中</span>
                  <span>28间 (56%)</span>
                </div>
                <Progress percent={56} strokeColor="#ff4d4f" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>打扫中</span>
                  <span>6间 (12%)</span>
                </div>
                <Progress percent={12} strokeColor="#faad14" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>维修中</span>
                  <span>4间 (8%)</span>
                </div>
                <Progress percent={8} strokeColor="#d9d9d9" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="今日待办">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#fff3cd', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>10:30 退房提醒</div>
                  <div style={{ color: '#666', fontSize: 12 }}>302房间 李四</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#d4edda', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>14:00 新客入住</div>
                  <div style={{ color: '#666', fontSize: 12 }}>205房间 预订确认</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f8d7da', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>房间维修</div>
                  <div style={{ color: '#666', fontSize: 12 }}>408房间空调故障</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="近期预订">
            <Table
              dataSource={recentBookings}
              columns={[
                { title: '客人', dataIndex: 'guest', key: 'guest' },
                { title: '房间', dataIndex: 'room', key: 'room' },
                { title: '入住', dataIndex: 'checkIn', key: 'checkIn' },
                { title: '退房', dataIndex: 'checkOut', key: 'checkOut' },
                { title: '状态', dataIndex: 'status', key: 'status' },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
