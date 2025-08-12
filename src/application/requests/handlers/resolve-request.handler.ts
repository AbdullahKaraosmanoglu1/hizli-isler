import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ResolveRequestCommand } from '../commands/resolve-request.command';
import { Inject } from '@nestjs/common';
import { REQUEST_REPOSITORY } from '../../../domain/requests/request.repository';
import type { RequestRepository } from '../../../domain/requests/request.repository';
import { RequestResolvedEvent } from '../events/request-resolved.event';

@CommandHandler(ResolveRequestCommand)
export class ResolveRequestHandler implements ICommandHandler<ResolveRequestCommand> {
    constructor(
        @Inject(REQUEST_REPOSITORY) private readonly repo: RequestRepository,
        private readonly bus: EventBus,
    ) { }

    async execute(c: ResolveRequestCommand) {
        const r = await this.repo.resolve(c.id, c.resolvedAt);
        this.bus.publish(new RequestResolvedEvent(c.id, c.resolvedAt));
        return r;
    }
}
