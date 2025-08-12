import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRequestCommand } from '../commands/assign-request.command';
import { Inject } from '@nestjs/common';
import { REQUEST_REPOSITORY } from '../../../domain/requests/request.repository';
import type { RequestRepository } from '../../../domain/requests/request.repository';

@CommandHandler(AssignRequestCommand)
export class AssignRequestHandler implements ICommandHandler<AssignRequestCommand> {
    constructor(@Inject(REQUEST_REPOSITORY) private readonly repo: RequestRepository) { }

    execute(c: AssignRequestCommand) {
        return this.repo.assign(c.id, c.assignedTo);
    }
}
