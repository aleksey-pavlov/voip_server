import { DatabaseMongo } from "../Core/DatabaseMongo";
import { TVoiceMessage } from "../Types/VoiceModel";
import request = require("request");
import { Client } from "../Server/Clients/ClientsModel";
import { Logger } from "../Core/Logger";
import { VoiceStatusResponse } from "./StatusResponse";

export class ClientsCallbacks {
    private mongoDb: DatabaseMongo

    private urlByClientIds: { [x: number]: string } = {};

    constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
    }

    public async initialize(): Promise<void> {
        try {
            let clients = await this.mongoDb.collection("asset.clients").find<Client>().toArray();
            let temp: { [x: number]: string } = {};
            for (let i in clients) {
                let client = clients[i];
                if (client.sendStatusUrl) {
                    temp[client.uid] = client.sendStatusUrl;
                }
            }

            this.urlByClientIds = temp;

            Logger.info("ClientsCallbacks", `Loaded ${Object.keys(this.urlByClientIds).length} client callbacks`);
        } catch (err) {
            Logger.error("ClientsCallbacks", err.stack);
        }
    }

    public async send(voice: TVoiceMessage): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            let url = this.urlByClientIds[voice.clientId];
            if (url) {

                let data: VoiceStatusResponse = {
                    message_id: voice.messageId,
                    status: voice.status,
                    error: voice.error,
                    duration: voice.duration,
                    actual_duration: voice.actualDuration,
                    ivr_answer: voice.cdrDestination,
                    dialuptime: voice.dialuptime,
                    synthes_chars_count: voice.synthesCharsCount
                };

                request.post(url, {
                    headers: ["Content-type: application/json"], json: data
                }, (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                });
            }
        });
    }
}