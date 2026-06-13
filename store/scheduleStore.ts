import { addScheduleEntry, deleteSchedule, getScheduleByDate, updateScheduleEntry } from "@/database/queries/schedule";
import { ScheduleEntry } from "@/types";
import { format } from "date-fns";
import { create } from "zustand";

interface ScheduleStore {
    entries: ScheduleEntry[];
    selectedDate: string;
    loadSchedule: (date: string) => void;
    setSelectedDate: (date: string) => void;
    addEntry: (
        subject_id: number,
        lecturer: string,
        type: string,
        date: string,
        start_time: string,
        end_time: string,
        location: string
    ) => void;
    removeEntry: (id: number, date: string) => void;
    updateEntry: (
        id: number,
        subject_id: number,
        lecturer: string,
        type: string,
        date: string,
        start_time: string,
        end_time: string,
        location: string
    ) => void
}



export const useScheduleStore = create<ScheduleStore>((set, get) => ({
    entries: [],
    selectedDate: format(new Date(), 'yyyy-MM-dd'),

    loadSchedule: (date) => {
        const entries = getScheduleByDate(date)
        set({ entries })
    },

    setSelectedDate: (date) => {
        const entries = getScheduleByDate(date);
        set({ selectedDate: date, entries })
    },

    addEntry: (subject_id, lecturer, type, date, start_time, end_time, location) => {
        addScheduleEntry(subject_id, lecturer, type, date, start_time, end_time, location);
        const entries = getScheduleByDate(get().selectedDate)
        set({ entries })
    },

    removeEntry: (id, date) => {
        deleteSchedule(id);
        const entries = getScheduleByDate(date)
        set({ entries })
    },
    updateEntry: (id, subject_id, lecturer, type, date, start_time, end_time, location) => {
        updateScheduleEntry(id, subject_id, lecturer, type, date, start_time, end_time, location);
        const entries = getScheduleByDate(get().selectedDate);
        set({ entries });
    }
}))