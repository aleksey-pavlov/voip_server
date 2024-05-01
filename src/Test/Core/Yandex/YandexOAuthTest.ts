import { TokensStorage } from "../../../Core/YandexCloudApi/TokensStorage";
import { DatabaseRedis } from "../../../Core/DatabaseRedis";
import { YandexOAuth } from "../../../Core/YandexCloudApi/YandexOAuth";
import { ConfigBase } from "../../../Config/Config";

(async () => {

    try {
        var tokensStorage = new TokensStorage(new DatabaseRedis());
        var oauth = new YandexOAuth(ConfigBase.YANDEX_SPEECHKIT_OAUTH_TOKEN, tokensStorage);
        console.log(await oauth.getIamToken());
    } catch (err) {
        console.log("MainCatch: ");
        console.log(err);
    }
})();