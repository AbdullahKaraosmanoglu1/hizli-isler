import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRequestCommand } from '../commands/create-request.command';
import { Inject } from '@nestjs/common';
import { REQUEST_REPOSITORY } from '../../../domain/requests/request.repository';
import type { RequestRepository } from '../../../domain/requests/request.repository';

@CommandHandler(CreateRequestCommand)
export class CreateRequestHandler implements ICommandHandler<CreateRequestCommand> {
    constructor(@Inject(REQUEST_REPOSITORY) private readonly repo: RequestRepository) { }

    execute({ dto }: CreateRequestCommand) {
        return this.repo.create(dto as any);
    }
}
