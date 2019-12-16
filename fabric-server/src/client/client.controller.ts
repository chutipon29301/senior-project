import { Controller, Post, Get, Param } from '@nestjs/common';
import { ClientService } from './client.service';
import * as Client from 'fabric-client';

@Controller('client')
export class ClientController {

    constructor(private readonly service: ClientService) {}

    @Get('org/:orgName')
    public async getClientForOrg(@Param('orgName') orgName: string): Promise<string> {
        const client = await this.service.getClientForOrg(orgName);
        return client.getMspid();
    }
}
