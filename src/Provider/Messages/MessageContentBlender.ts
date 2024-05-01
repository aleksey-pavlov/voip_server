import { MessageText } from "./MessagesText";

export class MessageContentBlender {

    private chars: string[] = ["  ", "\n", "_"];
    private blendStrategy: Array<(text: string, char: string) => string> = [
        (text: string, char: string): string => {
            return text.replace(" ", char);
        },(text: string, char: string): string => {
            return text.replace(" ", char);
        },(text: string, char: string): string => {
            return text.replace(" ", char);
        }, (text: string, char: string) => {
            return `${text}${char}`;
        }, (text: string, char: string) => {
            return `${char}${text}`;
        }
    ];

    public blend(text: MessageText): string {

        let remaining: number = this.getRemainingChars(text);
        let appendCount: number = 0;

        for (let i = 0; i < remaining; i++) {
            let char: string = this.getRandomChar();
            appendCount += char.length;
            if (appendCount <= remaining) {
                let strategyIndex = Math.floor(Math.random() * this.blendStrategy.length);
                text.content = this.blendStrategy[strategyIndex](text.content, char);
            }
        }

        return text.content;
    }

    private getRemainingChars(text: MessageText): number {
        let remaining: number = text.getRemainingPart();
        if (remaining > 10)
            remaining = 10;

        return remaining;
    }

    private getRandomChar() {
        let charIndex = Math.floor(Math.random() * this.chars.length);
        return this.chars[charIndex];
    }
}