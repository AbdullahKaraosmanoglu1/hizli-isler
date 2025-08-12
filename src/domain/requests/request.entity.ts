// Basit domain entity tipi
export type RequestStatus = 'Açık' | 'Atandı' | 'Çözüldü';

export interface Request {
    id: number;
    citizen_name: string;
    phone: string;
    address: string;
    category: string;
    description: string;
    status: RequestStatus;
    created_at: Date;
    assigned_to?: string | null;
    resolved_at?: Date | null;
}
