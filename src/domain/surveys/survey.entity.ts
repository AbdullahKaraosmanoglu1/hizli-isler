export interface Survey {
    id: number;
    request_id: number;
    invited_at: Date;
    score?: number | null;
    comment?: string | null;
    answered_at?: Date | null;
}
