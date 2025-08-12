import type { Request } from './request.entity';

export interface RequestRepository {
    create(data: Omit<Request, 'id' | 'status' | 'created_at' | 'resolved_at'>): Promise<Request>;
    assign(id: number, assignedTo: string): Promise<Request>;
    resolve(id: number, resolvedAt: Date): Promise<Request>;
    findById(id: number): Promise<Request | null>;
}

export const REQUEST_REPOSITORY = Symbol('REQUEST_REPOSITORY');
