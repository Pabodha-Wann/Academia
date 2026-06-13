import { addScheduleEntry, deleteSchedule, getScheduleByDay } from "@/database/queries/schedule";
import { ScheduleEntry } from "@/types";
import { create } from "zustand";

interface ScheduleStore {
    entries: ScheduleEntry[];
    selectedDay: string;
    loadSchedule: (day: string) => void;
    setSelectedDay: (day: string) => void;
    addEntry: (
        subject_id: number,
        lecturer: string,
        type: string,
        day: string,
        start_time: string,
        end_time: string,
        location: string
    ) => void;
    removeEntry: (id: number, day: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
    entries: [],
    selectedDay: DAYS[new Date().getDay()],

    loadSchedule: (day) => {
        const entries = getScheduleByDay(day)
        set({ entries })
    },

    setSelectedDay: (day) => {
        const entries = getScheduleByDay(day);
        set({ selectedDay: day, entries })
    },

    addEntry: (subject_id, lecturer, type, day, start_time, end_time, location) => {
        addScheduleEntry(subject_id, lecturer, type, day, start_time, end_time, location);
        const entries = getScheduleByDay(get().selectedDay)
        set({ entries })
    },

    removeEntry: (id, day) => {
        deleteSchedule(id);
        const entries = getScheduleByDay(day)
        set({ entries })
    }
}))