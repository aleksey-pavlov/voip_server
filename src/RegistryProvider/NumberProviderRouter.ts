import { Router, Request, Response } from "express";
import { NumberProvider, NumberValidationError } from "./NumberProvider";
import { Http } from "../Core/HttpHelper";
import { Logger } from "../Core/Logger";

export function NumberProviderRouter(numberProvider: NumberProvider): Router {

    let router: Router = Router();

    router.get("/registry/:number", async (req: Request, resp: Response) => {

        try {

            let number = req.params.number;

            let provider = await numberProvider.getProvider(number);

            return resp.json(provider);

        } catch (e) {
            if (e instanceof NumberValidationError)
                return resp.status(Http.StatusCode.BAD_REQUEST).json({ error: e.message });

            Logger.error("RegistryProvider.NumberProviderRouter", e.stack);
            return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
        }
    });

    router.get("/registry/:number/:fieldName", async (req: Request, resp: Response) => {

        try {

            let number = req.params.number;
            let fieldName = req.params.fieldName;

            let provider = await numberProvider.getProvider(number);
            return resp.send(`${provider[fieldName]}`);

        } catch (e) {
            if (e instanceof NumberValidationError)
                return resp.status(Http.StatusCode.BAD_REQUEST).json({ error: e.message });

            Logger.error("RegistryProvider.NumberProviderRouter", e.stack);
            return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
        }
    });

    return router;
}