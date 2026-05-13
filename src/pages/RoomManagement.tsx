import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Row, Col, Tag } from 'antd';
import { ROOM_STATUS_COLORS, ROOM_STATUS_LABELS, ROOM_TYPE_LABELS } from '../types';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([
    { id: '1', roomNumber: '101', floor: 1, type: 'single', status: 'available', price: 180, maxGuests: 1, hasWindow: true, amenities: ['WiFi', '空调', '电视'] },
    { id: '2', roomNumber: '102', floor: 1, type: 'single', status: 'occupied', price: 180, maxGuests: 1, hasWindow: true, amenities: ['WiFi', '空调', '电视'] },
    { id: '3', roomNumber: '201', floor: 2, type: 'double', status: 'occupied', price: 280, maxGuests: 2, hasWindow: true, amenities: ['WiFi', '空调', '电视', '独立卫浴'] },
    { id: '4', roomNumber: '202', floor: 2, type: 'double', status: 'cleaning', price: 280, maxGuests: 2, hasWindow: false, amenities: ['WiFi', '空调', '电视'] },
    { id: '5', roomNumber: '301', floor: 3, type: 'suite', status: 'available', price: 480, maxGuests: 4, hasWindow: true, amenities: ['WiFi', '空调', '电视', '独立卫浴', '阳台'] },
    { id: '6', roomNumber: '302', floor: 3, type: 'family', status: 'occupied', price: 380, maxGuests: 3, hasWindow: true, amenities: ['WiFi', '空调', '电视', '独立卫浴'] },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<typeof rooms[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const filteredRooms = rooms.filter(room => 
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showModal = (room?: typeof rooms[0]) => {
    if (room) {
      setEditingRoom(room);
      form.setFieldsValue(room);
    } else {
      setEditingRoom(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingRoom) {
        setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...values } : r));
      } else {
        setRooms([...rooms, { ...values, id: Date.now().toString() }]);
      }
      setIsModalVisible(false);
    });
  };

  const handleDelete = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const handleStatusChange = (id: string, status: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Col>
          <Input
            placeholder="搜索房间号或类型"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Button type="primary" onClick={() => showModal()}>
            添加房间
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={filteredRooms}
          columns={[
            { title: '房间号', dataIndex: 'roomNumber', key: 'roomNumber' },
            { title: '楼层', dataIndex: 'floor', key: 'floor' },
            { title: '房型', dataIndex: 'type', key: 'type', render: (type: string) => ROOM_TYPE_LABELS[type] },
            { 
              title: '状态', 
              dataIndex: 'status', 
              key: 'status',
              render: (status: string) => (
                <Tag color={ROOM_STATUS_COLORS[status]}>
                  {ROOM_STATUS_LABELS[status]}
                </Tag>
              ),
              filterDropdown: () => (
                <div style={{ padding: 8 }}>
                  {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      onClick={() => setSearchTerm(key)}
                      style={{ display: 'block', width: '100%', marginBottom: 4 }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              ),
            },
            { title: '价格', dataIndex: 'price', key: 'price', render: (price: number) => `${price}元/晚` },
            { title: '最多入住', dataIndex: 'maxGuests', key: 'maxGuests', render: (num: number) => `${num}人` },
            { title: '设施', dataIndex: 'amenities', key: 'amenities', render: (amenities: string[]) => amenities.join(', ') },
            {
              title: '操作',
              key: 'actions',
              render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={() => showModal(record)}>编辑</Button>
                  <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
                  <Select
                    value={record.status}
                    onChange={(value) => handleStatusChange(record.id, value)}
                    style={{ width: 100 }}
                  >
                    {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
                      <Select.Option key={key} value={key}>{label}</Select.Option>
                    ))}
                  </Select>
                </div>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingRoom ? '编辑房间' : '添加房间'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="房间号" name="roomNumber" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="楼层" name="floor" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="房型" name="type" rules={[{ required: true }]}>
            <Select>
              {Object.entries(ROOM_TYPE_LABELS).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="价格" name="price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="最多入住人数" name="maxGuests" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="有窗户" name="hasWindow" valuePropName="checked">
            <Select>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
