import { Controller, Post } from '@nestjs/common';
import { DailyExportJob } from '../../infrastructure/sched/daily-export.job';

@Controller('export')
export class ExportController {
    constructor(private readonly job: DailyExportJob) { }

    @Post('daily')
    async runDaily() {
        const res = await this.job.runOnce();
        return { ok: true, ...res };
    }
}
