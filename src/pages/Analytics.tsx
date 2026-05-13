import { Card, Row, Col, Statistic, Table } from 'antd';

const Analytics = () => {
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
              prefix="¥"
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

export default Analytics;
