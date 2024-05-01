import { TokensStorage } from "../../../Core/YandexCloudApi/TokensStorage";
import { DatabaseRedis } from "../../../Core/DatabaseRedis";
import { TinfoffAuth } from "../../../Core/TinkoffCloudApi/TinkoffAuth";
import { Config } from "../../../Config/Config";
import { TinkoffSpeechKit } from "../../../Core/TinkoffCloudApi/TinkoffSpeechKit";
import { TinkoffSpeechGenerator } from "../../../Trunk/SpeechGenerator/TinkoffSpeechGenerator";
import { TranscoderRawToGsm } from "../../../Core/TrasncoderFactory";
import { EVoiceMessageTypes, EVoiceStatus } from "../../../Types/VoiceModel";

(async () => {

  try {
    var tokensStorage = new TokensStorage(new DatabaseRedis());
    var oauth = new TinfoffAuth(Config.TINKOFF_API_KEY, Config.TINKOFF_API_SECRET, tokensStorage);
    var speechKit = new TinkoffSpeechKit(oauth);

    var generator = new TinkoffSpeechGenerator(speechKit, TranscoderRawToGsm)

    await generator.generate({
      acceptedAt: 1,
      attempRetries: 1,
      caller: "",
      clientId: 1,
      messageId: 1,
      recipient: "",
      retries: 1,
      retryDelay: 4,
      status: EVoiceStatus.ACCEPTED,
      systemId: "",
      type: EVoiceMessageTypes.TEXT,
      text: "Тест",
      speechGenerateParams: {}
    }, "speech.gsm");

  } catch (err) {
    console.log("MainCatch: ");
    console.log(err);
  }

})();