import { create } from 'zustand';

const useStore = create((set) => ({
  isLoggedInLoading: true,
  isLoggedIn: false,

  setIsLoggedInLoading: (value) => set(() => ({ isLoggedInLoading: value })),

  setIsLoggedIn: (value) => set(() => ({ isLoggedIn: value })),
}));

export default useStore;
