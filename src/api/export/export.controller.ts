import { Controller, Post, UseGuards } from '@nestjs/common';
import { ReportKeyGuard } from '../../infrastructure/auth/api-key.guards';
import { CommandBus } from '@nestjs/cqrs';
import { ExportDailyCommand } from '../../application/export/commands/export-daily.command';

@Controller('export')
@UseGuards(ReportKeyGuard)
export class ExportController {
    constructor(private readonly bus: CommandBus) { }

    @Post('daily')
    run() {
        return this.bus.execute(new ExportDailyCommand());
    }
}
