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