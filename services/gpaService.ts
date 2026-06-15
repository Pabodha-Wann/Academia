import * as gpaDb from "@/database/queries/gpa";
import { useGpaStore } from "@/store/gpaStore";

export const GpaService = {

    loadEntries(): void {
        const entries = gpaDb.getAllGpaEntries();
        const calculatedGpa = gpaDb.calculateGPA(entries);
        useGpaStore.getState().setGpaState(entries, calculatedGpa);
    },


    addEntry(
        subject: string,
        grade: string,
        grade_point: number,
        credits: number,
        semester: string
    ): void {
        gpaDb.addGpaEntry(subject, grade, grade_point, credits, semester);
        this.loadEntries();
    },


    removeEntry(id: number): void {
        gpaDb.deleteGpaEntry(id);
        this.loadEntries();
    }
};
