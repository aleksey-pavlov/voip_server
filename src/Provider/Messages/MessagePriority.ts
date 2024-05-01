import * as md5 from "md5";

export class MessagesPriority {

    private texts: { [x: string]: number } = {};

    public constructor() {
        setInterval(() => {
            this.texts = {};
        }, 12 * 60 * 60 * 1000);
    }

    public getPriority(text: string): number {
        let cleanText:string = text.replace(/\s+/gi, "").trim().toLowerCase();
        let key:string = md5(cleanText);
        return this.couter(key);
    }

    private couter(key: string): number {
        if (this.texts[key] === undefined) {
            this.texts[key] = 0;
        }
        
        return this.texts[key]++;
    }
}