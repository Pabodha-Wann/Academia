import { Profile } from "@/types";
import db from "../db";


//Get Profile
export function getProfile(): Profile | null {
    const result = db.getFirstSync<Profile>(
        "SELECT * FROM profile WHERE id = 1"
    )
    return result ?? null
}

export function createProfile(
    name: string,
    reg_number: string
): void {
    db.runSync(
        "INSERT OR IGNORE INTO profile (id, name, reg_number) VALUES (1, ?, ?)", [name, reg_number]
    )
}

export function updateProfile(
    name: string,
    reg_number: string,
    gpa: number,
    credits: number,
    avatar_uri: string | null
): void {
    db.runSync(
        "UPDATE profile SET name = ?, reg_number = ?, gpa = ?, credits = ?,avatar_uri=? WHERE id = 1",
        [name, reg_number, gpa, credits, avatar_uri]
    )
}; 