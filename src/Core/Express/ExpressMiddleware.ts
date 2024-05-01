import { Http } from "../HttpHelper";
import { Request, Response } from "express";

export class ServerErrors {
    static readonly EMPTY_REQUEST_BODY = "EmptyRequestBody";
}

export namespace ExpressMiddleware {

    export function checkArrayBody(): (req: Request, resp: Response, next: any) => Response {

        return (req: Request, resp: Response, next: any): Response => {
            let body: any = req.body;
            if (!Array.isArray(body) || body.length <= 0) {
                return resp.status(Http.StatusCode.BAD_REQUEST).json({ error: ServerErrors.EMPTY_REQUEST_BODY });
            }

            next();
        };
    };

    export function checkEmptyBody(): (req: Request, resp: Response, next: any) => Response {

        return (req: Request, resp: Response, next: any): Response => {
            let body: any = req.body;
            if (body.length <= 0) {
                return resp.status(Http.StatusCode.BAD_REQUEST).json({ error: ServerErrors.EMPTY_REQUEST_BODY });
            }

            next();
        };
    };

    export function checkEmptyBodyFields(fields?: string[]): (req: Request, resp: Response, next: any) => Response {

        return (req: Request, resp: Response, next: any): Response => {

            let body: any = req.body;
            for (let i in fields) {
                let field: string = fields[i];

                if (!body[field] || (body[field] && body[field].length <= 0)) {
                    return resp.status(Http.StatusCode.BAD_REQUEST).json({ error: ServerErrors.EMPTY_REQUEST_BODY });
                }
            }


            next();
        };
    }
}