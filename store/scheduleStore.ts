import { ScheduleEntry } from "@/types";
import { format } from "date-fns";
import { create } from "zustand";

interface ScheduleStore {
    entries: ScheduleEntry[];
    selectedDate: string;
    setEntries: (entries: ScheduleEntry[]) => void;
    setSelectedDateState: (date: string) => void;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
    entries: [],
    selectedDate: format(new Date(), 'yyyy-MM-dd'),

    setEntries: (entries) => set({ entries }),
    setSelectedDateState: (date) => set({ selectedDate: date }),
}));