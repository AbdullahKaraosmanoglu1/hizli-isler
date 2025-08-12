import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // İstersen graceful shutdown için aşağıyı da bırakabilirsin
    enableShutdownHooks(app: any) {
        (this.$on as any)('beforeExit', async () => {
            await app.close();
        });
    }
}
