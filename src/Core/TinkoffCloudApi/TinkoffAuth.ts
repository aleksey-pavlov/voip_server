import * as crypto from 'crypto';
import { ITokensStorage } from '../YandexCloudApi/TokensStorage';

export class TinfoffAuth {

    private JWT_KEY_EXPIRED = 24 * 60 * 60;
    private TOKEN_NAME = "tinkoff_jwt";

    constructor(private apiKey: string, private secretKey: string, private tokenStorage: ITokensStorage) { }

    public async getJwtToken(): Promise<string> {

        let token = await this.tokenStorage.getToken(this.TOKEN_NAME);

        if (token)
            return token;

        let tokenExpired = Math.ceil(Date.now() / 1000) + this.JWT_KEY_EXPIRED;
        let tokenLivetime = tokenExpired - Math.ceil(Date.now() / 1000);
        token = this.generateJWT(
            {
                alg: "HS256",
                kid: this.apiKey,
                typ: 'JWT'
            },
            {
                aud: 'tinkoff.cloud.tts',
                exp: tokenExpired,
                iss: 'b2s',
                sub: 'b2s'
            });

        await this.tokenStorage.setToken(this.TOKEN_NAME, token, tokenLivetime);

        return token;
    }

    private generateJWT(header: {
        "alg": "HS256",
        "typ": "JWT",
        "kid": string
    }, payload: {
        "iss": string,
        "sub": string,
        "aud": "tinkoff.cloud.tts",
        "exp": number
    }) {

        let payload_bytes = JSON.stringify(payload);
        let header_bytes = JSON.stringify(header);

        let data = (this.strip(Buffer.from(header_bytes).toString('base64')) + "." +
            this.strip(Buffer.from(payload_bytes).toString('base64')));

        let signature = crypto.createHmac('sha256', Buffer.from(this.secretKey, 'base64'));
        let jwt = data + "." + this.strip(signature.update(data).digest('base64'));

        return jwt;
    }

    private strip(s: string) {
        return s.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
}