import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class OfferService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) { }
    public async sendBuildingOffer(id: string, price: number) {

        // this.httpService.get(this.configService.fabricUrl);
    }
    public async sendPvOffer(id: string, price: number) {

        // this.httpService.get(this.configService.fabricUrl);
    }
}
