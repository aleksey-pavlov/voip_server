import * as request from 'request';

export interface IHttpClient {

    post(url: string, body: Object): Promise<{ body: any, status: number, statusMessage: string }>;

}


export class HttpClient implements IHttpClient {

    post(url: string, body: Object): Promise<{ body: any, status: number, statusMessage: string }> {

        return new Promise(r => {

            request.post(url,
                {
                    json: body
                }, (error, resp, body) => {

                    if (error) {
                        throw new Error(error);
                    }

                    return r({ body: body, status: resp.statusCode, statusMessage: resp.statusMessage });
                });
        });
    }


}