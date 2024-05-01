import * as request from "request";
import * as fs from "fs";
import { TVoiceMessage } from "../../Types/VoiceModel";
import { gsmDuration } from "../../Core/Sox";
import { ISpeechGenerator, TSpeechGeneratorResponse } from "../ISpeechGenerator";


export class B2sSpeechGenerator implements ISpeechGenerator {

    private readonly url: string;
    private readonly transcoderFactory: any;

    constructor(url: string, transcoderFactory: () => any) {
        this.transcoderFactory = transcoderFactory;
        this.url = url;
    }

    public async generate(voice: TVoiceMessage, destFilePath: string): Promise<TSpeechGeneratorResponse> {

        return new Promise<TSpeechGeneratorResponse>((resolve, reject) => {
            request.get(`${this.url}/${voice.voiceFile}`)
                .on("error", (e) => reject(e))
                .pipe(this.transcoderFactory())
                .on("error", (e) => reject(e))
                .pipe(fs.createWriteStream(destFilePath))
                .on("error", (e) => reject(e))
                .on("finish", async () => {
                    let duration = await gsmDuration(destFilePath);
                    resolve({ duration: duration });
                });
        });
    }
}