import { Http } from "../../Core/HttpHelper";
import { Response, Request } from "express";
import { IClientService } from "./ClientsService";
import { Client } from "./ClientsModel";
import { ClientsErrors } from "./ClientsErrors";

export namespace ClientsMiddleware {

    export const AUTH_KEY_PARAM = "ckey";

    export function checkAuth(clientService: IClientService): (req: Request, resp: Response, next: any) => Response {

        return (req: Request, resp: Response, next: any): Response => {
            let authKey: string = req.query.ckey;
            let ip: string | string[] = req.headers["x-real-ip"];

            // authed client
            let client: Client = clientService.getClient(authKey);

            if (client === undefined) {
                return resp.status(Http.StatusCode.UNAUTHORIZED).json({ error: ClientsErrors.INCORRECT_CKEY });
            }

            client.logAuth();

            if (client.isBlock()) {
                return resp.status(Http.StatusCode.FORBIDDEN).json({ error: ClientsErrors.CLIENT_IS_BLOCKED });
            }

            if (client.ipNotAllow(ip)) {
                return resp.status(Http.StatusCode.UNAUTHORIZED).json({ error: ClientsErrors.VALIDATION_IP_ERROR });
            }

            next();
        }
    }

    export function checkSmsLimits(clientService: IClientService): (req: Request, resp: Response, next: any) => Response {
        return (req: Request, resp: Response, next: any): Response => {

            let client = clientService.getClient(req.query.ckey);

            if (client.isOverDailyLimit()) {
                return resp.status(Http.StatusCode.FORBIDDEN).json({ error: ClientsErrors.DAILY_OVER_LIMIT });
            }

            next();
        }
    }

    export function checkVoiceLimits(clientService: IClientService): (req: Request, resp: Response, next: any) => Response {
        return (req: Request, resp: Response, next: any): Response => {

            let client = clientService.getClient(req.query.ckey);

            if (client.isOverVoiceDailyLimit()) {
                return resp.status(Http.StatusCode.FORBIDDEN).json({ error: ClientsErrors.DAILY_OVER_LIMIT });
            }

            next();
        }
    }

}