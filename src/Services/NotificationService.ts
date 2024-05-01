import { NotificationProvider } from "./NotificationProvider";
export class NotificationService {

    public constructor(private provider: NotificationProvider) { }

    public warning(sender: string, text: string) {
        this.provider.sendMessage(`*${sender}* - ${text}`).then(() => { });
    }
}

export class NotificationTexts {
    public static readonly OVERLIMIT_DAY = "OVER LIMIT DAY!";
    public static readonly OVERLIMIT_MONTH = "OVER LIMIT MONTH!";
    public static readonly OVERLIMIT_FAILED = "A LOT OF FAIL"
}