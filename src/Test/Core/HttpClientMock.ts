import { IHttpClient } from "../../Core/HttpClient";

export class HttpClientMock implements IHttpClient {

    post(url: string, body: Object): Promise<{ body: any; status: number; statusMessage: string; }> {

        return new Promise(r => r({ body: body, status: 200, statusMessage: "OK" }));

    }

}