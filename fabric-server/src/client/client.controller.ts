import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { ClientService } from './client.service';
import * as Client from 'fabric-client';

@Controller('client')
export class ClientController {

    constructor(private readonly clientService: ClientService) {}

    @Get('org/:orgName')
    public async getClientForOrg(@Param('orgName') orgName: string, @Query('username') username?: string): Promise<string> {
        const client = await this.clientService.getClientForOrg(orgName, username);
        return client.getMspid();
    }
}
