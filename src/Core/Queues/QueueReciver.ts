import { MqChannel, MqMessage } from "../DatabaseRabbit";

export interface IQueueReciver {
    consume(cb: (data: Object) => Promise<boolean>): Promise<void>
}

export class QueueReciver implements IQueueReciver {

    constructor(private queueName: string, private persistence: boolean, private mqChannel: MqChannel) {
    }

    public async consume(cb: (data: Object) => Promise<boolean>): Promise<void> {
        let assertion = await this.mqChannel.assertQueue(this.queueName, { durable: this.persistence, autoDelete: !this.persistence });
        await this.mqChannel.consume(assertion.queue, async (mqItem) => {
            let data = JSON.parse(mqItem.content.toString());
            let isSuccess = await cb(data);
            this.checkAsk(isSuccess, mqItem);
        }, { noAck: false });
    }

    private checkAsk(isSuccess: boolean, mqItem: MqMessage): void {
        if (isSuccess) {
            this.mqChannel.ack(mqItem);
        }
    }
}