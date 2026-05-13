import { useState } from 'react';
import { Card, Row, Col, Button, Tooltip } from 'antd';
import { ROOM_STATUS_COLORS, ROOM_STATUS_LABELS } from '../types';

const FLOORS = [
  { floor: 1, rooms: ['101', '102', '103', '104', '105'] },
  { floor: 2, rooms: ['201', '202', '203', '204', '205'] },
  { floor: 3, rooms: ['301', '302', '303', '304', '305'] },
  { floor: 4, rooms: ['401', '402', '403', '404', '405'] },
];

const ROOM_DATA: Record<string, { status: string; guests?: string }> = {
  '101': { status: 'available' },
  '102': { status: 'occupied', guests: '张三' },
  '103': { status: 'cleaning' },
  '104': { status: 'available' },
  '105': { status: 'occupied', guests: '李四' },
  '201': { status: 'occupied', guests: '王五' },
  '202': { status: 'available' },
  '203': { status: 'maintenance' },
  '204': { status: 'occupied', guests: '赵六' },
  '205': { status: 'locked' },
  '301': { status: 'available' },
  '302': { status: 'occupied', guests: '钱七' },
  '303': { status: 'cleaning' },
  '304': { status: 'available' },
  '305': { status: 'occupied', guests: '孙八' },
  '401': { status: 'available' },
  '402': { status: 'available' },
  '403': { status: 'maintenance' },
  '404': { status: 'occupied', guests: '周九' },
  '405': { status: 'cleaning' },
};

const FloorView = () => {
  const [currentFloor, setCurrentFloor] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const goUp = () => {
    if (currentFloor < FLOORS.length) {
      setCurrentFloor(currentFloor + 1);
    }
  };

  const goDown = () => {
    if (currentFloor > 1) {
      setCurrentFloor(currentFloor - 1);
    }
  };

  const currentFloorRooms = FLOORS.find(f => f.floor === currentFloor)?.rooms || [];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              onClick={goDown}
              disabled={currentFloor === 1}
              size="large"
            >
              上一层
            </Button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold' }}>{currentFloor}F</div>
              <div style={{ fontSize: 14, color: '#666' }}>第{currentFloor}层</div>
            </div>
            <Button
              onClick={goUp}
              disabled={currentFloor === FLOORS.length}
              size="large"
            >
              下一层
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
            {currentFloorRooms.map(roomNumber => {
              const roomData = ROOM_DATA[roomNumber];
              return (
                <Tooltip key={roomNumber} title={`${ROOM_STATUS_LABELS[roomData.status]}${roomData.guests ? ` - ${roomData.guests}` : ''}`}>
                  <div
                    onClick={() => setSelectedRoom(selectedRoom === roomNumber ? null : roomNumber)}
                    style={{
                      width: 120,
                      height: 100,
                      background: ROOM_STATUS_COLORS[roomData.status],
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      transform: selectedRoom === roomNumber ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: selectedRoom === roomNumber ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{roomNumber}</div>
                    {roomData.guests && (
                      <div style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>{roomData.guests}</div>
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            {Object.entries(ROOM_STATUS_LABELS).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, background: ROOM_STATUS_COLORS[key], borderRadius: 4 }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {selectedRoom && (
        <Card style={{ marginTop: 16 }} title={`房间 ${selectedRoom} 详情`}>
          <Row gutter={16}>
            <Col span={8}>
              <div><strong>状态:</strong> {ROOM_STATUS_LABELS[ROOM_DATA[selectedRoom].status]}</div>
              <div><strong>客人:</strong> {ROOM_DATA[selectedRoom].guests || '暂无'}</div>
            </Col>
            <Col span={16}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button>办理入住</Button>
                <Button>办理退房</Button>
                <Button>设置打扫</Button>
                <Button>设置维修</Button>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default FloorView;
