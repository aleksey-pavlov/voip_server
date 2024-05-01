import * as fs from "fs";
import { IYandexSpeechKit } from "../../Core/YandexCloudApi/YandexSpeechKit";
import { TVoiceMessage } from "../../Types/VoiceModel";
import { gsmDuration } from "../../Core/Sox";
import { ISpeechGenerator, TSpeechGeneratorResponse } from "../ISpeechGenerator";

export class YandexSpeechGenerator implements ISpeechGenerator {

    private readonly speechKit: IYandexSpeechKit;
    private readonly transcoderFactory: any;

    constructor(speechKit: IYandexSpeechKit, transcoderFactory: () => any) {
        this.transcoderFactory = transcoderFactory;
        this.speechKit = speechKit;
    }

    public async generate(voice: TVoiceMessage, destFilePath: string): Promise<TSpeechGeneratorResponse> {

        let synthesisStream = await this.speechKit.synthesis({
            text: voice.text,
            emotion: voice.speechGenerateParams.emotion || "neutral",
            lang: voice.speechGenerateParams.lang || "ru-RU",
            speed: voice.speechGenerateParams.speed || 1.0,
            voice: voice.speechGenerateParams.voice || "alyss",
            format: "lpcm"
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