import { MongoClient } from "../Core/DatabaseMongo";
import { Config } from "../Config/Config";
import * as Fs from "fs";

(async () => {

    let providerIds = {
        "beeline": [/Вымпел-Коммуникации/i],
        "tele2": [/теле2/i, /ростелеком/i, /СМАРТС/i, /Т2 Мобайл/i],
        "megafon": [/МегаФон/i],
        "mts": [/Мобильные ТелеСистемы/i]
    };

    let mongo = await MongoClient.connect(Config.MONGO);
    let collection = await mongo.collection("asset.providers");

    let removed = await collection.deleteMany({});
    console.log(removed);

    Fs.readFile("./assets/defRegistry.json", async (err, data) => {
        let providers = JSON.parse(data.toString());

        let inserted = await collection.insert(providers);
        console.log(inserted);

        for(let i in providerIds) {
            let updated = await collection.updateMany({"provider": {'$in': providerIds[i]}}, { $set: { providerId: i } });
            console.log(updated);
        }

        process.exit();
    });
})();