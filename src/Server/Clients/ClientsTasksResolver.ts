import { IHttpClient } from "../../Core/HttpClient";
import { IClientService } from "./ClientsService";
import { Http } from "../../Core/HttpHelper";

export interface IClientsTasksResolver {
    resolve(id: string, ckey: string): Promise<boolean>;
}

export class ClientsTasksResolver implements IClientsTasksResolver {

    constructor(private clientService: IClientService, private request: IHttpClient) {

    }

    async resolve(id: string, ckey: string): Promise<boolean> {

        let client = this.clientService.getClient(ckey);

        if (!client)
            throw Error("Client not found");

        let resolveUrl = client.resolveTaskUrl;

        let resp = await this.request.post(resolveUrl, { id: id });

        if (resp.status != Http.StatusCode.OK) {
            throw new Error(`Resolve server response: ${resp.statusMessage}`);
        }

        return true;
    }

}