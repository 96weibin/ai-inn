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
  getRoomById: (id: number): Promise<Room> => api.get(`/rooms/${id}`),
  createRoom: (data: Omit<Room, 'id'>) => api.post('/rooms', data),
  updateRoom: (id: number, data: Partial<Room>) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id: number) => api.delete(`/rooms/${id}`),
  updateRoomStatus: (id: number, status: string) => api.patch(`/rooms/${id}/status`, { status }),
};

export const roomTemplateApi = {
  getAll: (): Promise<RoomTemplate[]> => api.get('/room_templates'),
  create: (data: Partial<RoomTemplate> & { label: string }) => api.post('/room_templates', data),
  update: (uid: string, data: Partial<RoomTemplate>) => api.put(`/room_templates/${uid}`, data),
  delete: (uid: string) => api.delete(`/room_templates/${uid}`),
};

export const guestApi = {
  getAllGuests: (): Promise<Guest[]> => api.get('/guests'),
  getGuestById: (id: number): Promise<Guest> => api.get(`/guests/${id}`),
  createGuest: (data: Omit<Guest, 'id' | 'total_stays'>) => api.post('/guests', data),
  updateGuest: (id: number, data: Partial<Guest>) => api.put(`/guests/${id}`, data),
  deleteGuest: (id: number) => api.delete(`/guests/${id}`),
  searchGuests: (query: string): Promise<Guest[]> => api.get(`/guests/search?q=${query}`),
};

export const bookingApi = {
  getAllBookings: (): Promise<Booking[]> => api.get('/bookings'),
  getBookingById: (id: number): Promise<Booking> => api.get(`/bookings/${id}`),
  createBooking: (data: Omit<Booking, 'id' | 'created_at'>) => api.post('/bookings', data),
  updateBooking: (id: number, data: Partial<Booking>) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id: number) => api.delete(`/bookings/${id}`),
  checkIn: (id: number) => api.post(`/bookings/${id}/checkin`),
  checkOut: (id: number) => api.post(`/bookings/${id}/checkout`),
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
