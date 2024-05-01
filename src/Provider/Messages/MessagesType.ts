import * as md5 from "md5";

export type MessageType = "service" | "advertising";

export class MessagesType {

    private texts: { [x: string]: number } = {};

    public constructor() {
        setInterval(() => {
            this.texts = {};
        }, 12 * 60 * 60 * 1000);
    }

    public getType(text: string): MessageType {
        let type: MessageType = "service";
        if (this.exists(text)) {
            type = "advertising";
        }

        return type;
    }

    private exists(text: string): boolean {
        let cleanText:string = text.replace(/\s+/gi, "").trim().toLowerCase();
        let key:string = md5(cleanText);
        if (this.texts[key] === undefined) {
            this.texts[key] = 1;
            return false;
        }

        return true;
    }
}