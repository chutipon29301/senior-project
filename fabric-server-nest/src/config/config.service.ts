import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { Organization } from '../entity/User.entity';

@Injectable()
export class ConfigService {
    private getEnv(name: string) {
        const env = process.env[name];
        if (env) {
            return env;
        }
        throw new Error(`"${name}" is not defined`);
    }
    get mySQLUrl(): string {
        return this.getEnv('MYSQL_URL');
    }

    get mySQLUser(): string {
        return this.getEnv('MYSQL_USER');
    }

    get mySQLPassword(): string {
        return this.getEnv('MYSQL_PASSWORD');
    }

    get mySQLDatabaseName(): string {
        return this.getEnv('MYSQL_DATABASE');
    }

    get mySQLPort(): string {
        return this.getEnv('MYSQL_PORT');
    }

    get smartContractUrl(): string {
        return this.getEnv('SMARTCONTRACT_URL');
    }

    get smartMeterUrl(): string {
        return this.getEnv('SMARTMETER_URL');
    }

    get jwtSecret(): string {
        return 'Hello';
    }

    get useFabric(): boolean {
        return process.env.USE_FABRIC !== 'false';
    }

    public getFabricAdminContextForOrg(organization: Organization): { username: string, password: string } {
        switch (organization) {
            case Organization.Building:
                return {
                    username: this.buildingAdminUsername,
                    password: this.buildingAdminPassword,
                };
            case Organization.PV:
                return {
                    username: this.pvAdminUsername,
                    password: this.pvAdminPassword,
                };
            case Organization.Utility:
                return {
                    username: this.utilityAdminUsername,
                    password: this.utilityAdminPassword,
                };
        }
    }

    private get buildingAdminUsername(): string {
        return this.getEnv('BUILDING_ADMIN_USERNAME');
    }
    private get buildingAdminPassword(): string {
        return this.getEnv('BUILDING_ADMIN_PASSWORD');
    }
    private get pvAdminUsername(): string {
        return this.getEnv('PV_ADMIN_USERNAME');
    }
    private get pvAdminPassword(): string {
        return this.getEnv('PV_ADMIN_PASSWORD');
    }
    private get utilityAdminUsername(): string {
        return this.getEnv('UTILITY_ADMIN_USERNAME');
    }
    private get utilityAdminPassword(): string {
        return this.getEnv('UTILITY_ADMIN_PASSWORD');
    }

}
