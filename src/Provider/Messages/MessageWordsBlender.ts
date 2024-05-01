import { MessageText } from "./MessagesText";

export class MessageWordsBlender {
    private like: RegExp = new RegExp(/распр|скид|sale|акци|успей|купить|токен|спец|дешево|ликвидация|покупайте|прод|цена/i);
    private chars: string[] = ["-\n", "_"];

    public blend(text: MessageText): string {

        let words: string[] = text.content.split(" ");
        let remaining: number = text.getRemainingPart();
        let appendCount = 0;

        for (let i in words) {

            if (!this.like.test(words[i]))
                continue;

            let char: string = this.getRandomChar();
            appendCount += char.length;
            if (appendCount <= remaining) {
                words[i] = this.appendChar(words[i], char);
            }
        }

        return words.join(" ");
    }

    private appendChar(word: string, char: string): string {
        let sliceIndex = Math.floor(Math.random() * word.length);
        return `${word.slice(0, sliceIndex)}${char}${word.slice(sliceIndex)}`;
    }

    private getRandomChar() {
        let charIndex = Math.floor(Math.random() * this.chars.length);
        return this.chars[charIndex];
    }
}
