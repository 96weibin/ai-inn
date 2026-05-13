import axios from 'axios';

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

export const roomApi = {
  getAllRooms: () => api.get('/rooms'),
  getRoomById: (id: string) => api.get(`/rooms/${id}`),
  createRoom: (data: Omit<Room, 'id'>) => api.post('/rooms', data),
  updateRoom: (id: string, data: Partial<Room>) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id: string) => api.delete(`/rooms/${id}`),
  updateRoomStatus: (id: string, status: string) => api.patch(`/rooms/${id}/status`, { status }),
};

export const guestApi = {
  getAllGuests: () => api.get('/guests'),
  getGuestById: (id: string) => api.get(`/guests/${id}`),
  createGuest: (data: Omit<Guest, 'id' | 'totalStays'>) => api.post('/guests', data),
  updateGuest: (id: string, data: Partial<Guest>) => api.put(`/guests/${id}`, data),
  deleteGuest: (id: string) => api.delete(`/guests/${id}`),
  searchGuests: (query: string) => api.get(`/guests/search?q=${query}`),
};

export const bookingApi = {
  getAllBookings: () => api.get('/bookings'),
  getBookingById: (id: string) => api.get(`/bookings/${id}`),
  createBooking: (data: Omit<Booking, 'id' | 'createdAt'>) => api.post('/bookings', data),
  updateBooking: (id: string, data: Partial<Booking>) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id: string) => api.delete(`/bookings/${id}`),
  checkIn: (id: string) => api.post(`/bookings/${id}/checkin`),
  checkOut: (id: string) => api.post(`/bookings/${id}/checkout`),
};

export const platformApi = {
  getAllPlatforms: () => api.get('/platforms'),
  getPlatformById: (id: string) => api.get(`/platforms/${id}`),
  createPlatform: (data: Omit<Platform, 'id'>) => api.post('/platforms', data),
  updatePlatform: (id: string, data: Partial<Platform>) => api.put(`/platforms/${id}`, data),
  deletePlatform: (id: string) => api.delete(`/platforms/${id}`),
  syncBookings: (id: string) => api.post(`/platforms/${id}/sync`),
};

export const aiApi = {
  chat: (message: string) => api.post('/ai/chat', { message }),
  analyzeRooms: () => api.get('/ai/analyze-rooms'),
  suggestRoom: (guestId: string) => api.get(`/ai/suggest-room/${guestId}`),
};

export default api;
