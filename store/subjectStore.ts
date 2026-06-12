import {
    addSubject,
    deleteSubject,
    getAllSubjects,
} from "@/database/queries/subjects";
import { Subject } from "@/types";
import { create } from "zustand";

interface SubjectStore {
    subjects: Subject[];
    loadSubjects: () => void;
    addSubject: (name: string, code: string, color: string) => void;
    removeSubject: (id: number) => void;
}

export const useSubjectStore = create<SubjectStore>((set) => ({
    subjects: [],

    loadSubjects: () => {
        const subjects = getAllSubjects();
        set({ subjects });
    },

    addSubject: (name, code, color) => {
        addSubject(name, code, color);
        const subjects = getAllSubjects();
        set({ subjects });
    },

    removeSubject: (id) => {
        deleteSubject(id);
        const subjects = getAllSubjects();
        set({ subjects });
    },
}));