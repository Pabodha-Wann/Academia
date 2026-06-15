import { DbNotification } from "@/types";
import db from "../db";


export function insertDbNotification(
    title: string,
    body: string,
    type: 'task' | 'class',
    reference_id: number,
    triggered_at: string
): void {
    db.runSync(
        `INSERT INTO notifications (title, body, type, reference_id, triggered_at)
         VALUES (?, ?, ?, ?, ?)`,
        [title, body, type, reference_id, triggered_at]
    );
}


export function getTriggeredNotifications(): DbNotification[] {
    const nowIso = new Date().toISOString();
    return db.getAllSync<DbNotification>(
        `SELECT * FROM notifications 
         WHERE datetime(triggered_at) <= datetime(?) 
         ORDER BY datetime(triggered_at) DESC`,
        [nowIso]
    );
}


export function markNotificationRead(id: number): void {
    db.runSync("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
}


export function markAllNotificationsRead(): void {
    const nowIso = new Date().toISOString();
    db.runSync(
        `UPDATE notifications SET is_read = 1 
         WHERE datetime(triggered_at) <= datetime(?)`,
        [nowIso]
    );
}


export function deleteDbNotification(id: number): void {
    db.runSync("DELETE FROM notifications WHERE id = ?", [id]);
}


export function clearDbNotificationsByReference(reference_id: number, type: 'task' | 'class'): void {
    const nowIso = new Date().toISOString();
    db.runSync(
        `DELETE FROM notifications 
         WHERE reference_id = ? AND type = ? 
         AND datetime(triggered_at) > datetime(?)`,
        [reference_id, type, nowIso]
    );
}


export function clearAllDbNotificationsForReference(reference_id: number, type: 'task' | 'class'): void {
    db.runSync(
        "DELETE FROM notifications WHERE reference_id = ? AND type = ?",
        [reference_id, type]
    );
}
