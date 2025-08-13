import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AnyKeyGuard } from '../../infrastructure/auth/api-key.guards';
import { CommandBus } from '@nestjs/cqrs';
import { CreateRequestCommand } from '../../application/requests/commands/create-request.command';
import { AssignRequestCommand } from '../../application/requests/commands/assign-request.command';
import { ResolveRequestCommand } from '../../application/requests/commands/resolve-request.command';
import { CreateRequestDto } from './dto/create-request.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { ResolveRequestDto } from './dto/resolve-request.dto';

@Controller('requests')
@UseGuards(AnyKeyGuard)
export class RequestsController {
    constructor(private bus: CommandBus) { }

    @Post()
    create(@Body() dto: CreateRequestDto) {
        return this.bus.execute(new CreateRequestCommand(dto));
    }

    @Patch(':id/assign')
    assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRequestDto) {
        return this.bus.execute(new AssignRequestCommand(id, dto.assigned_to));
    }

    @Patch(':id/resolve')
    resolve(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolveRequestDto) {
        return this.bus.execute(new ResolveRequestCommand(id, new Date(dto.resolved_at)));
    }
}
