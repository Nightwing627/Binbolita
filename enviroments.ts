import dotenv from 'dotenv';

dotenv.config();

export class Environments {
    static port: string = process.env.PORT || '8080';
    static secret_key: string = process.env.SECRET_KEY || '';
}
