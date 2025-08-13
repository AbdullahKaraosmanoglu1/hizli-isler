import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { ExportDailyCommand } from '../../application/export/commands/export-daily.command';

@Injectable()
export class DailyExportJob {
    private readonly log = new Logger(DailyExportJob.name);

    constructor(private readonly bus: CommandBus) { }

    // Her gün 23:59
    @Cron('59 23 * * *')
    async handle() {
        const res = await this.runOnce();
        this.log.log(`Daily export: ${res.count} rows -> ${res.path}`);
    }

    // Elle tetikleme için public metod
    async runOnce() {
        const res = await this.bus.execute(new ExportDailyCommand());
        return res;
    }
}
