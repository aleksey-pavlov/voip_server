import { MqChannel } from "../DatabaseRabbit";

export interface IQueueSender {
    sendToQueue(data: Object): boolean;
}

export class QueueSender implements IQueueSender {

    public constructor(private queueName: string, private persistence: boolean, private mqChannel: MqChannel) {
        this.assertQueue(queueName);
    }

    private async assertQueue(queueName: string): Promise<void> {
        await this.mqChannel.assertQueue(queueName, { durable: this.persistence });
    }

    public sendToQueue(data: Object): boolean {
        let mqItem = new Buffer(JSON.stringify(data));
        return this.mqChannel.sendToQueue(this.queueName, mqItem, { deliveryMode: 2, persistent: this.persistence });
    }
}