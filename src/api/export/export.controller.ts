// src/api/export/export.controller.ts
import { Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ExportDailyCommand } from '../../application/export/commands/export-daily.command';

@Controller('export')
export class ExportController {
    constructor(private readonly bus: CommandBus) { }

    @Post('daily')
    run() {
        return this.bus.execute(new ExportDailyCommand());
    }
}
