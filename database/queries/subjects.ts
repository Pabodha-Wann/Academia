import { Subject } from "@/types";
import db from "../db";

export function getAllSubjects(): Subject[] {
    return db.getAllSync<Subject>(
        "SELECT * FROM subjects ORDER BY name ASC"
    )
}

export function addSubject(
    name: string,
    code: string,
    color: string
): void {
    db.runSync(
        "INSERT INTO subjects (name,code,color) VALUES (?,?,?)",
        [name, code, color]
    )
}

export function deleteSubject(id: number): void {
    db.runSync("DELETE FROM subjects WHERE id = ?", [id])
}