import { DatabaseMysql } from "../Core/DatabaseMysql";
import { Config } from "../Config/Config";
import * as splitter from "split-sms";
import { isUndefined } from "util";

(async () => {

    let chunks: { [x: number]: Object[] } = {};
    let chunksIndex = 0;
    let mysqlDb = new DatabaseMysql(Config.MYSQL);
    
    let messages = await mysqlDb.query("SELECT messageId, clientId, text, textOrigin, status, acceptedAt, parts FROM `messages` WHERE parts=0", []);

    for (let i in messages) {
        let split = splitter.split(messages[i].text);
        messages[i].parts = split.parts.length || 1;

        if (isUndefined(chunks[chunksIndex]))
            chunks[chunksIndex] = [];

        chunks[chunksIndex].push([
            messages[i].messageId,
            messages[i].clientId,
            messages[i].text,
            messages[i].textOrigin,
            messages[i].status,
            messages[i].acceptedAt,
            messages[i].parts]);

        if (chunks[chunksIndex].length >= 1024) {
            chunksIndex++;
        }
    }

    for (let i in chunks) {
        await mysqlDb.query("INSERT INTO `messages` (`messageId`, `clientId`, `text`, `textOrigin`, `status`, `acceptedAt`, `parts`) VALUES ? ON DUPLICATE KEY UPDATE `parts`=VALUES(parts)", [chunks[i]]);
    }

    process.exit();

})();