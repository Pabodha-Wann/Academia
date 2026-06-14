export interface Profile {
    id: number;
    name: string;
    reg_number: string;
    gpa: number;
    credits: number;
    avatar_uri: string | null;
}

export interface Subject {
    id: number;
    name: string;
    code: string | null;
    color: string;
}

export interface ScheduleEntry {
    id: number;
    subject_id: number;
    subject_name: string;
    subject_code: string | null;
    subject_color: string;
    lecturer: string;
    type: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string | null;
}

export interface Task {
    id: number;
    subject_id: number | null;
    subject_name: string | null;
    subject_color: string | null;
    title: string;
    description: string | null;
    due_date: string;
    priority: string;
    status: string;
    created_at: string;
}

export interface GpaEntry {
    id: number;
    subject: string;
    grade: string;
    grade_point: number;
    credits: number;
    semester: string | null;
    created_at: string;
}