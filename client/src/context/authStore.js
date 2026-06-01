import { create } from 'zustand';
import { authApi } from '../api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('tf_token') || null,
  loading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('tf_token', token);
    set({ token, user });
    return user;
  },

  register: async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('tf_token', token);
    set({ token, user });
    return user;
  },

  logout: () => {
    localStorage.removeItem('tf_token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const token = localStorage.getItem('tf_token');
      if (!token) return set({ loading: false });
      const res = await authApi.getMe();
      set({ user: res.data.user, token, loading: false });
    } catch {
      localStorage.removeItem('tf_token');
      set({ user: null, token: null, loading: false });
    }
  },

  updateProfile: async (data) => {
    const res = await authApi.updateProfile(data);
    set({ user: res.data.user });
    return res.data.user;
  },
}));

export default useAuthStore;
