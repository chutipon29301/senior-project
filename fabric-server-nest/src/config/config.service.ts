import { Injectable, RequestTimeoutException } from '@nestjs/common';

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

    public getFabricAdminContextForOrg(organizationName: string): { username: string, password: string } {
        switch (organizationName.toLowerCase()) {
            case 'org1':
                return {
                    username: this.fabricAdminOrg1Username,
                    password: this.fabricAdminOrg1Password,
                };
            case 'org2':
                return {
                    username: this.fabricAdminOrg2Username,
                    password: this.fabricAdminOrg2Password,
                };
        }
    }

    private get fabricAdminOrg1Username(): string {
        return 'admin';
    }

    private get fabricAdminOrg1Password(): string {
        return 'adminpw';
    }

    private get fabricAdminOrg2Username(): string {
        return 'admin';
    }

    private get fabricAdminOrg2Password(): string {
        return 'adminpw';
    }

}
