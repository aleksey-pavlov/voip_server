import * as splitter from "split-sms";
import { TEncodingTypes } from "../../Types/MessageModel";

export type ContentInfo = {
    characterSet: string;
    parts: {
        content: string;
        length: number;
        bytes: number;
    }[];
    bytes: number;
    length: number;
    remainingInPart: number;
}

export class MessageText {

    // amount uses current text
    public numUses: number = 0;
    // content message
    public content: string;
    // encoding
    public encoding: TEncodingTypes;
    // size in bytes
    public bytes: number = 0;
    // parts of messages
    public parts: number = 1;

    constructor(content: string) {

        this.content = content;

        let info = this.getInfo();
        switch (info.characterSet) {
            case "Unicode": this.encoding = "unicode";
                break;
            case "GSM": this.encoding = "gsm-7bit";
                break;
        }
        this.parts = info.parts.length || 1;
        this.bytes = info.bytes;
    }

    private getInfo(): ContentInfo {
        return splitter.split(this.content);
    }

    public getRemainingPart(): number {
        return this.getInfo().remainingInPart;
    }
}