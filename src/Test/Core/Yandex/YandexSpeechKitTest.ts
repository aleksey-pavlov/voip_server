import { TokensStorage } from "../../../Core/YandexCloudApi/TokensStorage";
import { DatabaseRedis } from "../../../Core/DatabaseRedis";
import { YandexOAuth } from "../../../Core/YandexCloudApi/YandexOAuth";
import { YandexSpeechKit } from "../../../Core/YandexCloudApi/YandexSpeechKit";
import * as fs from "fs";
import * as sox from "sox-stream";
import { Config } from "../../../Config/Config";

(async () => {

    try {
        var tokensStorage = new TokensStorage(new DatabaseRedis());
        var oauth = new YandexOAuth(Config.YANDEX_SPEECHKIT_OAUTH_TOKEN, tokensStorage);
        var speechKit = new YandexSpeechKit(oauth, Config.YANDEX_SPEECHKIT_FOLDERID);
        var systhesysStream = await speechKit.synthesis({
            text: "Тест",
            format: "lpcm",
            sampleRateHertz: 48000,
            speed: 1.0,
            emotion: "neutral",
            voice:"alyss"
        });

        var transcoder = sox({
            output: { 
                rate: 8000,
                channels: 1,
                type: 'gsm'
            },
            input: {
                rate: 48000,
                bits: 16,
                encoding: 'signed-integer',
                channels: 1,
                type: 'raw'
            }
        });

        systhesysStream.pipe(transcoder).pipe(fs.createWriteStream("speech.gsm"));

    } catch (err) {
        console.log("MainCatch: ");
        console.log(err);
    }

})();