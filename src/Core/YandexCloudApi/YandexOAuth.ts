import * as request from "request";
import { ITokensStorage } from "./TokensStorage";

export interface IYandexOAuth {
    getIamToken(): Promise<string>;
}

export class YandexOAuth implements IYandexOAuth {

    private tokensStorage: ITokensStorage;
    private readonly IAM_TOKEN_NAME = "iamToken";
    private readonly iamTokenLiveTime: number = 3600; // 11 hours
    private oAuthToken: string;
    private readonly url: string = "https://iam.api.cloud.yandex.net/iam/v1/tokens";

    constructor(oAuthToken: string, tokensStorage: ITokensStorage) {
        this.oAuthToken = oAuthToken;
        this.tokensStorage = tokensStorage;
    }

    public async getIamToken(): Promise<string> {

        let token = await this.tokensStorage.getToken(this.IAM_TOKEN_NAME);

        if (token != null && token != "undefined") {
            return token;
        }

        let newToken = await this.iamTokenRequest(this.url, this.oAuthToken);
        await this.tokensStorage.setToken(this.IAM_TOKEN_NAME, newToken, this.iamTokenLiveTime);

        return newToken;
    }

    private iamTokenRequest(url: string, oAuthToken: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            request.post({
                url: url,
                headers: { "Content-Type": "application/json" },
                json: { "yandexPassportOauthToken": oAuthToken }
            }, (err: any, response: request.Response, body: any) => {
                if (err != null)
                    return reject(err);

                if (body['code'])
                    return reject(`Error: ${body['code']} - ${body['message']}`);

                resolve(body["iamToken"]);
            });
        });
    }
}