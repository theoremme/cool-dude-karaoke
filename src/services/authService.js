import axios from 'axios';

let baseURL = null;
let authToken = null;

const api = axios.create();

// Inject auth header on every request
api.interceptors.request.use((config) => {
  config.baseURL = baseURL;
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export function setBaseURL(url) {
  baseURL = url;
}

export function setToken(token) {
  authToken = token;
}

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data; // { token, user }
}

export async function register(email, password, name) {
  const { data } = await api.post('/api/auth/register', { email, password, name });
  return data; // { token, user }
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me');
  return data; // { user }
}

// Room operations
export async function createRoom(name) {
  const { data } = await api.post('/api/rooms', { name });
  return data;
}

export async function getMyRooms() {
  const { data } = await api.get('/api/rooms/mine');
  return data;
}

export async function getRoomByInviteCode(inviteCode) {
  const { data } = await api.get(`/api/rooms/${inviteCode}`);
  return data;
}
