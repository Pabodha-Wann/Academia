import { Task } from "@/types";
import db from "../db";

export function getTaskByDate(date: string): Task[] {
    return db.getAllSync<Task>(`
        SELECT 
        t.id,
        t.subject_id,
        sub.name as subject_name,
        sub.color as subject_color,
        t.title,
        t.description,
        t.due_date,
        t.priority,
        t.status,
        t.created_at
        FROM tasks t
        LEFT JOIN subjects sub ON t.subject_id = sub.id
        WHERE t.due_date = ?
        ORDER BY 
        CASE t.priority WHEN 'high' THEN 1 ELSE 2 END,
        t.created_at ASC
    `, [date])
}

export function getAllTasks(): Task[] {
    return db.getAllSync<Task>(`
        SELECT 
        t.id,
        t.subject_id,
        sub.name as subject_name,
        sub.color as subject_color,
        t.title,
        t.description,
        t.due_date,
        t.priority,
        t.status,
        t.created_at
        FROM tasks t
        LEFT JOIN subjects sub ON t.subject_id = sub.id
        ORDER BY 
        CASE t.priority WHEN 'high' THEN 1 ELSE 2 END,
        t.due_date ASC
      `);
}

export function addTask(
    subject_id: number | null,
    title: string,
    description: string,
    due_date: string,
    priority: string
): void {
    db.runSync(
        `INSERT INTO tasks (subject_id, title, description, due_date, priority)
     VALUES (?, ?, ?, ?, ?)`,
        [subject_id, title, description, due_date, priority]
    );
}


export function updateTask(
    id: number,
    subject_id: number | null,
    title: string,
    description: string,
    due_date: string,
    priority: string
): void {
    db.runSync(
        `UPDATE tasks SET 
      subject_id=?, title=?, description=?, 
      due_date=?, priority=?
     WHERE id=?`,
        [subject_id, title, description, due_date, priority, id]
    );
}

export function toggleTaskStatus(id: number, currentStatus: string): void {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    db.runSync(
        "UPDATE tasks SET status=? WHERE id=?",
        [newStatus, id]
    );
}

export function deleteTask(id: number): void {
    db.runSync("DELETE FROM tasks WHERE id=?", [id]);
}
