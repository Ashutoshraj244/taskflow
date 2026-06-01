import { create } from 'zustand';
import { workspaceApi } from '../api';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  loading: false,

  fetchWorkspaces: async () => {
    set({ loading: true });
    try {
      const res = await workspaceApi.getAll();
      set({ workspaces: res.data.workspaces });
    } finally {
      set({ loading: false });
    }
  },

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [workspace, ...state.workspaces] })),

  updateWorkspace: (updated) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w._id === updated._id ? updated : w)),
      activeWorkspace:
        state.activeWorkspace?._id === updated._id ? updated : state.activeWorkspace,
    })),
}));

export default useWorkspaceStore;
