import { ScheduleEntry } from "@/types";
import db from "../db";

export function getScheduleByDate(date: string): ScheduleEntry[] {
    return db.getAllSync<ScheduleEntry>(`
        SELECT 
        s.id,
        s.subject_id,
        sub.name as subject_name,
        sub.code as subject_code,
        sub.color as subject_color,
        s.lecturer,
        s.type,
        s.day as date,
        s.start_time,
        s.end_time,
        s.location
        FROM schedule s
        JOIN subjects sub ON s.subject_id = sub.id
        WHERE s.day = ?
        ORDER BY s.start_time ASC
    `, [date])
}

export function addScheduleEntry(
    subject_id: number,
    lecturer: string,
    type: string,
    date: string,
    start_time: string,
    end_time: string,
    location: string
): void {
    db.runSync(
        `INSERT INTO schedule (subject_id, lecturer, type, day, start_time, end_time, location)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [subject_id, lecturer, type, date, start_time, end_time, location]
    )
}

export function deleteSchedule(id: number): void {
    db.runSync(`DELETE FROM schedule WHERE id = ?`, [id]);
}

export function calculateDuration(start: string, end: string): string {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const totalMins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (totalMins <= 0) return "0min";

    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}hr ${mins}min`;
}

export function updateScheduleEntry(
    id: number,
    subject_id: number,
    lecturer: string,
    type: string,
    date: string,
    start_time: string,
    end_time: string,
    location: string
): void {
    db.runSync(
        `UPDATE schedule SET subject_id = ?,
        lecturer = ?,
        type = ?,
        day = ?,
        start_time = ?,
        end_time = ?,
        location = ?
        WHERE id = ?`,
        [subject_id, lecturer, type, date, start_time, end_time, location, id]
    )
}