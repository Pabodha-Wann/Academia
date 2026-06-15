import { Task } from "@/types";
import { format } from "date-fns";
import { create } from "zustand";

type FilterStatus = 'all' | 'pending' | 'done';

interface TaskStore {
    tasks: Task[];
    selectedDate: string | null;
    filterStatus: FilterStatus;
    setTasks: (tasks: Task[]) => void;
    setSelectedDateState: (date: string | null) => void;
    setFilterStatusState: (filter: FilterStatus) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    selectedDate: format(new Date(), 'yyyy-MM-dd'),
    filterStatus: 'all',

    setTasks: (tasks) => set({ tasks }),
    setSelectedDateState: (date) => set({ selectedDate: date }),
    setFilterStatusState: (status) => set({ filterStatus: status }),
}));