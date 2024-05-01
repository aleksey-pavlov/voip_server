import { IYandexOAuth } from "./YandexOAuth";
import { Stream } from "stream";
import * as request from "request";
import { readFile } from "../Utils";

export type TSynthesisOptions = {
    text: string;
    folderId?: string;
    lang?: "ru-RU" | "en-US" | "tr-TR"; // default ru-RU
    voice?: "alyss" | "jane" | "oksana" | "omazh" | "zahar" | "ermil"; // default oksana
    emotion?: "good" | "evil" | "neutral"; // defailt neutral
    speed?: number; // 1.0 default
    format?: "lpcm" | "oggopus"; // default oggopus
    sampleRateHertz?: 48000 | 16000 | 8000; // defailt 48000
};

export interface IYandexSpeechKit {
    synthesis(options: TSynthesisOptions): Promise<Stream>;
    recognition(): Promise<string>;
}

export class YandexSpeechKit implements IYandexSpeechKit {

    private readonly url: string = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";
    private oauth: IYandexOAuth;
    private folderId: string;

    constructor(oauth: IYandexOAuth, folderId: string) {
        this.oauth = oauth;
        this.folderId = folderId;
    }

    async synthesis(options: TSynthesisOptions): Promise<Stream> {

        let iamToken = await this.oauth.getIamToken();

        if (!options.folderId)
            options.folderId = this.folderId;

        let stream = request.post({
            url: this.url,
            headers: {
                "Authorization": `Bearer ${iamToken}`
            },
            form: options
        });

        return stream;
    }

    public async recognition(): Promise<string> {
       
        let url = `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general&lang=ru-RU&folderId=${this.folderId}`;

        let iamToken = await this.oauth.getIamToken();

        request.post({
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${iamToken}`
            },
            body: await readFile("./1-836901-in.wav")
        }, (err, resp) => {
            console.log(err);
            console.log(resp);
        });

        return null;
    }
}


