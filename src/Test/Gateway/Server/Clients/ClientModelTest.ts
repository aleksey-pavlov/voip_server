import { Client } from "../../../../Server/Clients/ClientsModel";

let client = new Client({
    ip: '',
    ipVerification: false,
    active: false,
    blocked: false,
    dailyLimit: 5,
    sentTotal: 0,
    authAt: 0,
    statDaily:  { sentMessages: 0, resetAt: 0, resetInterval: 60 } });

console.log(client);
client.logSendMessage();
console.log(client.isOverDailyLimit());

client.logSendMessage();
console.log(client.isOverDailyLimit());

client.logSendMessage();
console.log(client.isOverDailyLimit());

client.logSendMessage();
console.log(client.isOverDailyLimit());

client.logSendMessage();
console.log(client.isOverDailyLimit());

client.logSendMessage();
console.log(client.isOverDailyLimit());

console.log(client);

//process.exit();