import { create } from 'zustand';

interface UIState {
    // Navigation
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;

    // Modals
    modals: Record<string, boolean>;
    openModal: (modalId: string) => void;
    closeModal: (modalId: string) => void;
    isModalOpen: (modalId: string) => boolean;

    // Notifications
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        duration?: number;
    }>;
    addNotification: (notification: Omit<any, 'id'>) => void;
    removeNotification: (id: string) => void;

    // Loading
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    // Sidebar
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    closeSidebar: () => set({ isSidebarOpen: false }),

    // Modals
    modals: {},
    openModal: (modalId: string) =>
        set((state) => ({
            modals: { ...state.modals, [modalId]: true },
        })),
    closeModal: (modalId: string) =>
        set((state) => ({
            modals: { ...state.modals, [modalId]: false },
        })),
    isModalOpen: (modalId: string) => get().modals[modalId] ?? false,

    // Notifications
    notifications: [],
    addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => {
        const id = Date.now().toString();
        set((state: UIState) => ({
            notifications: [
                ...state.notifications,
                {
                    ...notification,
                    id,
                } as UIState['notifications'][0],
            ],
        }));

        if (notification.duration !== 0) {
            setTimeout(() => {
                get().removeNotification(id);
            }, notification.duration || 3000);
        }
    },
    removeNotification: (id: string) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    // Loading
    isLoading: false,
    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
