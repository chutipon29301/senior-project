import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    get smartContractAPIUrl(): string {
        return process.env.SMART_CONTRACT_API_URL;
    }
}
