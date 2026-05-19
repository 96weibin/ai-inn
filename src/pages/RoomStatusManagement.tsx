import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tag, Row, Col, DatePicker, Select, message, Spin, Space, Typography
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ROOM_STATUS_COLORS, ROOM_STATUS_LABELS } from '../types';
import { roomApi, roomTemplateApi, RoomTemplate } from '../api';

const { Text } = Typography;
const { Option } = Select;

const RoomStatusManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [rooms, setRooms] = useState<any[]>([]);
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const [roomsData, typesData] = await Promise.all([
        roomApi.getAllRooms(),
        roomTemplateApi.getAll()
      ]);
      setRooms(roomsData);
      setTemplates(typesData);
    } catch (error) {
      message.error('加载房态失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, [selectedDate]);

  const getTemplateInfo = (record: any): RoomTemplate | undefined => {
    if (record.room_template_uid) {
      return templates.find(t => t.uid === record.room_template_uid);
    }
    return templates.find(t => t.type === record.type);
  };

  const handleStatusChange = async (uid: string, status: string) => {
    try {
      await roomApi.updateRoomStatus(uid, status);
      message.success('房态更新成功');
      fetchRooms();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning' || r.status === 'maintenance').length,
  };

  const filteredRooms = filterStatus === 'all' 
    ? rooms 
    : rooms.filter(r => r.status === filterStatus);

  return (
    <div>
      {/* 顶部统计条 */}
      <Row style={{ marginBottom: 16 }} gutter={16}>
        <Col span={5}>
          <Card size="small">
            <Space>
              <CalendarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>总房间数</Text>
                <div style={{ fontSize: 22, fontWeight: 'bold' }}>{stats.total}</div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Space>
              <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>可卖房</Text>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#52c41a' }}>{stats.available}</div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Space>
              <ClockCircleOutlined style={{ fontSize: 20, color: '#faad14' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>已入住</Text>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#faad14' }}>{stats.occupied}</div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={9} style={{ textAlign: 'right', paddingTop: 8 }}>
          <Space>
            <DatePicker 
              value={selectedDate} 
              onChange={setSelectedDate as any} 
              style={{ width: 180 }}
              size="large"
            />
            <Select 
              value={filterStatus} 
              onChange={setFilterStatus} 
              style={{ width: 140 }}
              size="large"
            >
              <Option value="all">全部状态</Option>
              {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
            <Button onClick={fetchRooms}>刷新房态</Button>
          </Space>
        </Col>
      </Row>

      <Card title="房态列表">
        <Spin spinning={loading}>
          <Table
            dataSource={filteredRooms}
            columns={[
              { 
                title: '房间号', 
                dataIndex: 'room_number', 
                width: 90,
                render: (t:string) => <Text strong style={{ fontSize: 16 }}>{t}</Text>,
              },
              { 
                title: '房间名', 
                dataIndex: 'name', 
                width: 130,
                render: (t:string) => t ? <Tag color="blue">{t}</Tag> : '-',
              },
              { 
                title: '房型', 
                dataIndex: 'type', 
                width: 120,
                render: (_:string, record: any) => {
                  const ti = getTemplateInfo(record);
                  return ti ? <Tag color={ti.color}>{ti.label}</Tag> : '-';
                }
              },
              { title: '楼层', dataIndex: 'floor', width: 70 },
              { 
                title: '当前状态',
                dataIndex: 'status',
                key: 'status',
                width: 140,
                render: (status: string, record: any) => (
                  <Select
                    value={status}
                    onChange={(value) => handleStatusChange(record.id, value)}
                    style={{ width: 130 }}
                    size="small"
                  >
                    {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                      <Option key={key} value={key}>
                        <Tag color={ROOM_STATUS_COLORS[key] || '#d9d9d9'} style={{ border: 'none', minWidth: 60, textAlign: 'center' }}>
                          {label}
                        </Tag>
                      </Option>
                    ))}
                  </Select>
                ),
              },
              { title: '今日房价', dataIndex: 'price', width: 100, render: (p:number) => <Text code style={{ fontSize: 14 }}>{p} 元</Text> },
              { title: '可住', dataIndex: 'max_guests', width: 80, render: (n:number) => `${n}人` },
            ]}
            rowKey="id"
            pagination={{ pageSize: 50 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default RoomStatusManagement;
