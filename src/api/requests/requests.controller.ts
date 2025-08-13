import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AnyKeyGuard } from '../../infrastructure/auth/api-key.guards';
import { CommandBus } from '@nestjs/cqrs';
import { CreateRequestCommand } from '../../application/requests/commands/create-request.command';
import { AssignRequestCommand } from '../../application/requests/commands/assign-request.command';
import { ResolveRequestCommand } from '../../application/requests/commands/resolve-request.command';

@Controller('requests')
@UseGuards(AnyKeyGuard)
export class RequestsController {
    constructor(private bus: CommandBus) { }

    @Post()
    create(@Body() dto: any) { return this.bus.execute(new CreateRequestCommand(dto)); }

    @Patch(':id/assign')
    assign(@Param('id', ParseIntPipe) id: number, @Body('assigned_to') assignedTo: string) {
        return this.bus.execute(new AssignRequestCommand(id, assignedTo));
    }

    @Patch(':id/resolve')
    resolve(@Param('id', ParseIntPipe) id: number, @Body('resolved_at') resolvedAt: string) {
        return this.bus.execute(new ResolveRequestCommand(id, new Date(resolvedAt)));
    }
}
