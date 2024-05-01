import TelegramBot = require("node-telegram-bot-api");

export class NotificationProvider {

    private bot: TelegramBot;
    private chatId: string;

    constructor(token: string, chat: string) {

        this.bot = new TelegramBot(token);
        this.chatId = chat;
    }

    public async sendMessage(text: string) {
        return await this.bot.sendMessage(this.chatId, text, { parse_mode: "Markdown" });
    }

}