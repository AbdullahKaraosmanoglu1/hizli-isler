import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { RequestRepository } from '../../../domain/requests/request.repository';
import type { Request } from '../../../domain/requests/request.entity';

@Injectable()
export class RequestPrismaRepository implements RequestRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: Omit<Request, 'id' | 'status' | 'created_at' | 'resolved_at'>) {
        return this.prisma.request.create({ data: { ...dto } as any }) as any;
    }

    async assign(id: number, assignedTo: string) {
        return this.prisma.request.update({
            where: { id },
            data: { assigned_to: assignedTo, status: 'Atandı' },
        }) as any;
    }

    async resolve(id: number, resolvedAt: Date) {
        return this.prisma.request.update({
            where: { id },
            data: { status: 'Çözüldü', resolved_at: resolvedAt },
        }) as any;
    }

    findById(id: number) {
        return this.prisma.request.findUnique({ where: { id } }) as any;
    }
}
