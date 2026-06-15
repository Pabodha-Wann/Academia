import { create } from 'zustand';

interface NotificationStore {
    taskReminders: boolean;
    classReminders: boolean;
    setTaskReminders: (val: boolean) => void;
    setClassReminders: (val: boolean) => void;
}

export const useNotficationStore = create<NotificationStore>((set, get) => ({
    taskReminders: true,
    classReminders: true,

    setTaskReminders: (val) => set({ taskReminders: val }),
    setClassReminders: (val) => set({ classReminders: val }),

}))