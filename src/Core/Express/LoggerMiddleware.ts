import { Response, Request, NextFunction } from "express";

export function LoggerMiddleware(handler: (data: {}) => void) {

    return (req: Request, resp: Response, next: NextFunction) => {

        handler({
            status: resp.statusCode,
            path: req.path,
            params: req.params,
            query: req.query,
            body: JSON.stringify(req.body),
            method: req.method
        });

        next();
    };
}