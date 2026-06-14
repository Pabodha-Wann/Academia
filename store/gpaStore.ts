import { addGpaEntry, calculateGPA, deleteGpaEntry, getAllGpaEntries } from "@/database/queries/gpa";
import { GpaEntry } from "@/types";
import { create } from "zustand";

interface GpaStore {
    entries: GpaEntry[];
    calculatedGpa: number;
    loadEntries: () => void;
    addEntry: (
        subject: string,
        grade: string,
        grade_point: number,
        credits: number,
        semester: string
    ) => void;
    removeEntry: (id: number) => void;
}

export const useGpaStore = create<GpaStore>((set) => ({
    entries: [],
    calculatedGpa: 0,

    loadEntries: () => {
        const entries = getAllGpaEntries()
        const calculatedGpa = calculateGPA(entries)
        set({ entries, calculatedGpa })
    },

    addEntry: (subject, grade, grade_point, credits, semester) => {
        addGpaEntry(subject, grade, grade_point, credits, semester);
        const entries = getAllGpaEntries();
        const calculatedGpa = calculateGPA(entries);
        set({ entries, calculatedGpa });
    },

    removeEntry: (id) => {
        deleteGpaEntry(id);
        const entries = getAllGpaEntries();
        const calculatedGpa = calculateGPA(entries);
        set({ entries, calculatedGpa });
    },
}))