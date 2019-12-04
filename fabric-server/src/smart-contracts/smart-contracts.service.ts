import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class SmartContractsService {
    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

    public async ping(): Promise<string> {
        const { data } = await this.httpService.get<string>(`http://${this.configService.smartContractAPIUrl}`).toPromise();
        return data;
    }
}
