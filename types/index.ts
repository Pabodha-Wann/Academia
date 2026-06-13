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
    day: string;
    start_time: string;
    end_time: string;
    location: string | null;
}