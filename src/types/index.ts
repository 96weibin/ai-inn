export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: 'single' | 'double' | 'suite' | 'family';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'locked';
  price: number;
  maxGuests: number;
  hasWindow: boolean;
  amenities: string[];
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  email?: string;
  preferences?: string[];
  totalStays: number;
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  platform: string;
  price: number;
  createdAt: string;
}

export interface Platform {
  id: string;
  name: string;
  apiKey?: string;
  active: boolean;
  syncEnabled: boolean;
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
