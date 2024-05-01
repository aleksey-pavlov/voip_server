import { NumberProvider } from "../../../RegistryProvider/NumberProvider";
import { RegistryProviderStorage } from "../../../RegistryProvider/RegistryProviderStorage";
import { MongoClient } from "../../../Core/DatabaseMongo";
import { Config } from "../../../Config/Config";

(async () => {
    
    try {
    let mongoDb = await MongoClient.connect(Config.MONGO);
    let providersRegistry = new RegistryProviderStorage(mongoDb);
    await providersRegistry.initialize();
    let messagesRecipientProvider = new NumberProvider(providersRegistry, ["+7", "+9"]);  


    console.log(await messagesRecipientProvider.getProvider("+39XXXXXXXXXX"));
    } catch(err) {
        console.log(err.message);
    }
})();