import { Router, Request, Response } from "express";
import { Logger } from "../Core/Logger";
import { NumberProvider } from "../RegistryProvider/NumberProvider";
import { ISipChannelsProvider } from "./SipChannelsProvider";

export function SipBalancerRouter(numberProvider: NumberProvider, sipChannels: ISipChannelsProvider): Router {


    let router: Router = Router();

    router.get("/channel/take/:number/:seq", async (req: Request, resp: Response) => {

        let number = req.params.number;
        let seq = req.params.seq;
        let provider = await numberProvider.getProvider(number);

        let id = sipChannels.takeChannel(number, provider.providerId, seq);

        Logger.info("SipBalancer.take", "Number=%s Provider=%s UniqId=%s TakenCh=%s", [number, provider.providerId, seq, id]);

        return resp.send(id);
    });


    router.get("/channel/give/:seq", (req: Request, resp: Response) => {

        let seq = req.params.seq;
        sipChannels.givenChannel(seq);

        Logger.info("SipBalancer.give", "UniqId=%s", [seq]);

        return resp.sendStatus(200);
    });


    router.get("/channels/reload", async (req: Request, resp: Response) => {

        await sipChannels.initialize();

        return resp.sendStatus(200);
    });

    router.get("/channels/idle", (req: Request, resp: Response) => {

        let ch = sipChannels.getIdleChannels();

        return resp.json(ch);
    });
    

    router.get("/channels/busy", (req: Request, resp: Response) => {

        let ch = sipChannels.getBusyChannels();

        return resp.json(ch);
    });

    return router
}