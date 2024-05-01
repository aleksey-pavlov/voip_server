import { TinfoffAuth } from "./TinkoffAuth";
import { Stream } from "stream";
import * as request from "request";
import { removeFile, writeFile } from "../Utils";
import * as fs from 'fs';
import { ObjectID } from "mongodb";

export type TVoiceSelectionParams = {
    name: string;
}

export type TSynthesizeSpeechRequest = {
    input: { text: string, ssml?: string },
    voice: TVoiceSelectionParams,
    audioConfig: { audioEncoding: string, sampleRateHertz?: number }
}

export interface ITinkoffSpeechKit {
    synthesis(options: TSynthesizeSpeechRequest): Promise<Stream>;
}

export class TinkoffSpeechKit implements ITinkoffSpeechKit {

    constructor(private oauth: TinfoffAuth) {
    }

    async synthesis(options: TSynthesizeSpeechRequest): Promise<Stream> {

        let jwtToken = await this.oauth.getJwtToken();

        let body = await this.requestPost(
            `https://api.tinkoff.ai:443/v1/tts:synthesize`,
            {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`
            },
            options
        );

        let data = Buffer.from(body['audio_content'], 'base64');

        let tmpFilePath = `/tmp/${new ObjectID()}`;
        await writeFile(tmpFilePath, data, "w+");

        let stream = fs.createReadStream(tmpFilePath);
        stream.on("close", async() => {
            await removeFile(tmpFilePath);
        });

        return stream;
    }

    private requestPost(url, headers, json): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            request.post({
                url: url,
                headers: headers,
                json: json
            }, (error, resp, body) => {

                if (error)
                    return reject(error);

                resolve(body);
            });
        });
    }
}


