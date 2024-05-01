import { Router, Request, Response, NextFunction } from "express";
import * as csv from "csvtojson";
import * as fs from "fs";
import { Http } from "../Core/HttpHelper";
import { RegistryProviderStorage } from "./RegistryProviderStorage";
import { Logger } from "../Core/Logger";
import * as regions from "./regions";

export function RegistryProvidersRouter(registry: RegistryProviderStorage): Router {

    let router: Router = Router();

    let providerIds: { [x: string]: RegExp } = {
        "beeline": new RegExp(/Вымпел-Коммуникации|ВымпелКом/i),
        "tele2": new RegExp(/теле2|ростелеком|СМАРТС|Т2 Мобайл/i),
        "megafon": new RegExp(/МегаФон/i),
        "mts": new RegExp(/Мобильные ТелеСистемы/i)
    }

    router.use("/registry/*", (req: Request, resp: Response, next: NextFunction) => {

        if (req.query.ckey !== "58bc685d43b529aacff01712") {
            return resp.sendStatus(Http.StatusCode.BAD_REQUEST);
        }

        next();
    });

    router.put("/registry/mnt", (req: Request, resp: Response) => {

        let body: Buffer = req.body;
        fs.writeFile("/var/tmp/mnt_providers.csv", body, async () => {

            let readStream = fs.createReadStream("/var/tmp/mnt_providers.csv");
            let providers = [];

            await registry.cleanMNT();

            csv().fromStream(readStream).subscribe(async provider => {

                for (let i in providerIds) {
                    if (providerIds[i].test(provider["OwnerID"])) {
                        provider["providerId"] = i;
                    }
                }

                providers.push(provider);
                if (providers.length >= 100000) {
                    await registry.appendMNT(providers);
                    providers = [];
                }

            }, (e) => {
                Logger.error("RegistryProviderRouter.MNTUpdate", e.stack);
            }, async () => {

                if (providers.length > 0)
                    await registry.appendMNT(providers);
            });
        });

        resp.sendStatus(Http.StatusCode.OK);
    });

    router.put("/registry/def", (req: Request, resp: Response) => {

        let body: Buffer = req.body;
        fs.writeFile("/var/tmp/def.csv", body, async () => {

            let readStream = fs.createReadStream("/var/tmp/def.csv");
            let providers = [];

            let defReplacedKeys = {
                "АВС/ DEF": "def",
                "От": "from",
                "До": "to",
                "Емкость": "capacity",
                "Оператор": "provider",
                "Регион": "region"
            };

            csv({ delimiter: ";" }).fromStream(readStream).subscribe(async json => {

                let provider = {};

                for (let i in json) {
                    let key = defReplacedKeys[i];
                    provider[key] = json[i];
                }

                for (let i in providerIds) {
                    if (providerIds[i].test(provider["provider"])) {
                        provider["providerId"] = i;
                    }
                }

                let regionsData = regions.regions;
                for (let i in regionsData) {
                    if (regionsData[i].pattern.test(provider["region"])) {
                        provider["timeZone"] = regionsData[i].zone;
                    }
                }

                providers.push(provider);

            }, (e) => {
                Logger.error("RegistryProviderRouter.DEFUpdate", e.stack);
            }, async () => {

                if (providers.length < 1)
                    return;

                await registry.cleanDEF();
                await registry.appendDEF(providers);
                await registry.initialize();

            });
        });

        resp.sendStatus(Http.StatusCode.OK);
    });

    return router;
}