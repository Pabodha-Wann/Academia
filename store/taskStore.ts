import { addTask, deleteTask, getTaskByDate, toggleTaskStatus, updateTask } from "@/database/queries/tasks";
import { Task } from "@/types";
import { format } from "date-fns";
import { create } from "zustand";


type FilterStatus = 'all' | 'pending' | 'done';

interface TaskStore {
    tasks: Task[],
    selectedDate: string,
    filterStatus: FilterStatus,
    loadTasks: (date: string) => void;
    setSelectedDate: (date: string) => void;
    setFilterStatus: (filter: FilterStatus) => void;
    addTask: (
        subject_id: number | null,
        title: string,
        description: string,
        due_date: string,
        priority: string
    ) => void;
    updateTask: (
        id: number,
        subject_id: number | null,
        title: string,
        description: string,
        due_date: string,
        priority: string
    ) => void;
    toggleTaskStatus: (id: number, currentStatus: string) => void;
    removeTask: (id: number) => void;

}

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],
    selectedDate: format(new Date(), 'yyyy-MM-dd'),
    filterStatus: 'all',

    loadTasks: (date) => {
        const tasks = getTaskByDate(date)
        set({ tasks })
    },

    setSelectedDate: (date) => {
        const tasks = getTaskByDate(date);
        set({ selectedDate: date, tasks })
    },

    setFilterStatus: (status) => {
        set({ filterStatus: status })
    },

    addTask: (subject_id, title, description, due_date, priority) => {
        addTask(subject_id, title, description, due_date, priority);
        const tasks = getTaskByDate(get().selectedDate);
        set({ tasks });
    },

    updateTask: (id, subject_id, title, description, due_date, priority) => {
        updateTask(id, subject_id, title, description, due_date, priority);
        const tasks = getTaskByDate(get().selectedDate);
        set({ tasks });
    },

    toggleTaskStatus: (id, currentStatus) => {
        toggleTaskStatus(id, currentStatus);
        const tasks = getTaskByDate(get().selectedDate)
        set({ tasks })
    },

    removeTask: (id) => {
        deleteTask(id)
        const tasks = getTaskByDate(get().selectedDate)
        set({ tasks })
    },

}))