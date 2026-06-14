import { GpaEntry } from "@/types";
import db from "../db";


export function getAllGpaEntries(): GpaEntry[] {
    return db.getAllSync<GpaEntry>(
        "SELECT * FROM gpa_entries ORDER BY created_at DESC"
    );
}

export function addGpaEntry(
    subject: string,
    grade: string,
    grade_point: number,
    credits: number,
    semester: string
): void {
    db.runSync(
        `INSERT INTO gpa_entries (subject, grade, grade_point, credits, semester) 
     VALUES (?, ?, ?, ?, ?)`,
        [subject, grade, grade_point, credits, semester]
    );
}

export function deleteGpaEntry(id: number): void {
    db.runSync("DELETE FROM gpa_entries WHERE id = ?", [id]);
}

export function calculateGPA(entries: GpaEntry[]): number {
    if (entries.length === 0) return 0;
    const totalPoints = entries.reduce(
        (sum, e) => sum + e.grade_point * e.credits, 0
    );
    const totalCredits = entries.reduce((sum, e) => sum + e.credits, 0);
    if (totalCredits === 0) return 0;
    return parseFloat((totalPoints / totalCredits).toFixed(2));
}