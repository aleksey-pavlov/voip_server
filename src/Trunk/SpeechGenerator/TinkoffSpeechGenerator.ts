import * as fs from "fs";
import { TVoiceMessage } from "../../Types/VoiceModel";
import { gsmDuration } from "../../Core/Sox";
import { ISpeechGenerator, TSpeechGeneratorResponse } from "../ISpeechGenerator";
import { ITinkoffSpeechKit } from "../../Core/TinkoffCloudApi/TinkoffSpeechKit";

export class TinkoffSpeechGenerator implements ISpeechGenerator {

    private readonly speechKit: ITinkoffSpeechKit;
    private readonly transcoderFactory: any;

    constructor(speechKit: ITinkoffSpeechKit, transcoderFactory: () => any) {
        this.transcoderFactory = transcoderFactory;
        this.speechKit = speechKit;
    }

    public async generate(voice: TVoiceMessage, destFilePath: string): Promise<TSpeechGeneratorResponse> {

        let synthesisStream = await this.speechKit.synthesis({
            input: {
                text: voice.text
            },
            voice: {
                name: voice.speechGenerateParamsV2.voice || "alyona",
            },
            audioConfig: {
                audioEncoding: "LINEAR16",
                sampleRateHertz: 48000
            }
        });

        return new Promise<TSpeechGeneratorResponse>((resolve, reject) => {

            synthesisStream
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