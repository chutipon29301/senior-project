import { Injectable } from '@nestjs/common';

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
}
