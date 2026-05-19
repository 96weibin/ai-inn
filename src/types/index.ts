export interface Room {
  uid: string;
  room_number: string;
  name?: string;
  floor: number;
  type: string;
  room_template_uid?: string;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'locked';
  price: number;
  max_guests: number;
  has_window: boolean;
}

export interface Guest {
  uid: string;
  name: string;
  phone: string;
  id_card: string;
  email?: string;
  preferences?: string[];
  total_stays: number;
}

export interface Booking {
  uid: string;
  room_number: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  platform: string;
  price: number;
}

export interface Platform {
  id: number;
  name: string;
  api_key?: string;
  active: boolean;
  sync_enabled: boolean;
}

export interface AIResponse {
  intent: string;
  entities: Record<string, string>;
  action: string;
  response: string;
  requiresConfirmation: boolean;
}

export const ROOM_STATUS_COLORS: Record<string, string> = {
  available: '#52c41a',
  occupied: '#ff4d4f',
  cleaning: '#faad14',
  maintenance: '#d9d9d9',
  locked: '#1f1f1f',
};

export const ROOM_STATUS_LABELS: Record<string, string> = {
  available: '空闲',
  occupied: '入住中',
  cleaning: '打扫中',
  maintenance: '维修中',
  locked: '锁定',
};

export const ROOM_TYPE_LABELS: Record<string, string> = {
  single: '单间',
  double: '双人间',
  suite: '套房',
  family: '家庭房',
};

export const PLATFORMS = ['Booking.com', 'Airbnb', '美团民宿', '携程', '飞猪', '自营'];

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  confirmed: '#1890ff',
  'checked-in': '#52c41a',
  'checked-out': '#722ed1',
  cancelled: '#ff4d4f',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  confirmed: '已确认',
  'checked-in': '已入住',
  'checked-out': '已退房',
  cancelled: '已取消',
};
