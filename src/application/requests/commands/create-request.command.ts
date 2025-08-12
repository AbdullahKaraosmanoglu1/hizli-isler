export class CreateRequestCommand {
    constructor(public readonly dto: {
        citizen_name: string; phone: string; address: string;
        category: string; description: string;
    }) { }
}
