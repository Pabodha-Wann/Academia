import { getTriggeredNotifications, markNotificationRead, markAllNotificationsRead, deleteDbNotification } from '@/database/queries/notifications';
import { DbNotification } from '@/types';
import { create } from 'zustand';

interface NotificationStore {
    taskReminders: boolean;
    classReminders: boolean;
    notifications: DbNotification[];
    unreadCount: number;
    setTaskReminders: (val: boolean) => void;
    setClassReminders: (val: boolean) => void;
    loadNotifications: () => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: number) => void;
}

export const useNotficationStore = create<NotificationStore>((set, get) => ({
    taskReminders: true,
    classReminders: true,
    notifications: [],
    unreadCount: 0,

    setTaskReminders: (val) => set({ taskReminders: val }),
    setClassReminders: (val) => set({ classReminders: val }),

    loadNotifications: () => {
        const list = getTriggeredNotifications();
        const unread = list.filter((n) => n.is_read === 0).length;
        set({ notifications: list, unreadCount: unread });
    },

    markAsRead: (id) => {
        markNotificationRead(id);
        get().loadNotifications();
    },

    markAllAsRead: () => {
        markAllNotificationsRead();
        get().loadNotifications();
    },

    deleteNotification: (id) => {
        deleteDbNotification(id);
        get().loadNotifications();
    }
}));