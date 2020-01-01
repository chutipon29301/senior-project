import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('client')
export class ClientController {

    constructor(private readonly clientService: ClientService) {}

    @Get('org/:userOrg')
    public async getClientForOrg(@Param('userOrg') userOrg: string, @Query('username') username?: string) {
        return (await this.clientService.getClientForOrg(userOrg, username)).getMspid();
    }
}
