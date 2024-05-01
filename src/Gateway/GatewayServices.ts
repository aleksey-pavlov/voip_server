import { MessagesStatus } from "../Services/MessagesStatus";
import { NotificationService } from "../Services/NotificationService";
import { ICacheMessages } from "./GatewayCacheMessages";
import { SimService } from "./Sim/SimService";

export class GatewayServices {

    private simService: SimService;
    private messagesStatus: MessagesStatus;
    private notificationService: NotificationService;
    private messageCache: ICacheMessages;

    public constructor(simService: SimService,
        messagesService: MessagesStatus,
        notificationService: NotificationService,
        messageCache: ICacheMessages) {

        this.simService = simService;
        this.messagesStatus = messagesService;
        this.notificationService = notificationService;
        this.messageCache = messageCache;
    }

    public getSimService(): SimService {
        return this.simService;
    }

    public getMessagesStatus(): MessagesStatus {
        return this.messagesStatus;
    }

    public getNotificationService(): NotificationService {
        return this.notificationService;
    }

    public getMessageCacheService(): ICacheMessages {
        return this.messageCache;
    }
}