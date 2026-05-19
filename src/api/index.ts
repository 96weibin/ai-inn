import axios from 'axios';
import { Room, Guest, Booking, Platform } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export type RoomTemplate = {
  uid: string;
  type: string;
  label: string;
  description?: string;
  color: string;
  default_price: number;
  max_guests: number;
};

export const roomApi = {
  getAllRooms: (): Promise<Room[]> => api.get('/rooms'),
  getRoom: (uid: string): Promise<Room> => api.get(`/rooms/${uid}`),
  createRoom: (data: Omit<Room, 'uid'>) => api.post('/rooms', data),
  updateRoom: (uid: string, data: Partial<Room>) => api.put(`/rooms/${uid}`, data),
  deleteRoom: (uid: string) => api.delete(`/rooms/${uid}`),
  updateRoomStatus: (uid: string, status: string) => api.patch(`/rooms/${uid}/status`, { status }),
};

export const roomTemplateApi = {
  getAll: (): Promise<RoomTemplate[]> => api.get('/room_templates'),
  create: (data: Partial<RoomTemplate> & { label: string }) => api.post('/room_templates', data),
  update: (uid: string, data: Partial<RoomTemplate>) => api.put(`/room_templates/${uid}`, data),
  delete: (uid: string) => api.delete(`/room_templates/${uid}`),
};

export const guestApi = {
  getAllGuests: (): Promise<Guest[]> => api.get('/guests'),
  getGuest: (uid: string): Promise<Guest> => api.get(`/guests/${uid}`),
  createGuest: (data: Omit<Guest, 'uid' | 'total_stays'>) => api.post('/guests', data),
  updateGuest: (uid: string, data: Partial<Guest>) => api.put(`/guests/${uid}`, data),
  deleteGuest: (uid: string) => api.delete(`/guests/${uid}`),
  searchGuests: (query: string): Promise<Guest[]> => api.get(`/guests/search?q=${query}`),
};

export const bookingApi = {
  getAllBookings: (): Promise<Booking[]> => api.get('/bookings'),
  getBooking: (uid: string): Promise<Booking> => api.get(`/bookings/${uid}`),
  createBooking: (data: { room_uid: string; guest_uid: string; check_in: string; check_out: string; guests?: number; platform?: string; price?: number }) => api.post('/bookings', data),
  updateBooking: (uid: string, data: Partial<Booking>) => api.put(`/bookings/${uid}`, data),
  deleteBooking: (uid: string) => api.delete(`/bookings/${uid}`),
  checkIn: (uid: string) => api.post(`/bookings/${uid}/checkin`),
  checkOut: (uid: string) => api.post(`/bookings/${uid}/checkout`),
};

export const platformApi = {
  getAllPlatforms: (): Promise<Platform[]> => api.get('/platforms'),
  getPlatformById: (id: number): Promise<Platform> => api.get(`/platforms/${id}`),
  createPlatform: (data: Omit<Platform, 'id'>) => api.post('/platforms', data),
  updatePlatform: (id: number, data: Partial<Platform>) => api.put(`/platforms/${id}`, data),
  deletePlatform: (id: number) => api.delete(`/platforms/${id}`),
  syncBookings: (id: number) => api.post(`/platforms/${id}/sync`),
};

export const aiApi = {
  chat: (message: string) => api.post('/ai/chat', { message }),
  analyzeRooms: () => api.get('/ai/analyze-rooms'),
  suggestRoom: (guestId: number) => api.get(`/ai/suggest-room/${guestId}`),
};

export default api;
