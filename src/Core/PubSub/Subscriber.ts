import { ExchangeType } from "./ExchangeType";
import { MqChannel, MqMessage } from "../DatabaseRabbit";

export interface ISubscriber {
    subscribe(queueName: string, routingKeys: string[], cb: (data: Object) => boolean): Promise<void>;
    subscribeAsync(queueName: string, routingKeys: string[], cb: (data: Object) => Promise<boolean>): Promise<void>;
    unsubscribe(queueName: string, routingKeys: string[]): Promise<void>;
}

export class Subscriber implements ISubscriber {

    public constructor(private exchangeName: string,
        private exchangeType: ExchangeType, 
        private persistence: boolean,
        private mqChannel: MqChannel) {
        
        this.assertExchange(this.exchangeName, this.exchangeType);
    }

    public async subscribe(queueName: string, routingKeys: string[], cb: (data: Object) => boolean): Promise<void> {
        let assertion = await this.mqChannel.assertQueue(queueName, { durable: this.persistence, autoDelete: !this.persistence });
        this.bindQueue(queueName, this.exchangeName, routingKeys);
        this.mqChannel.consume(assertion.queue, mqItem => {
            let data = JSON.parse(mqItem.content.toString());
            let isSuccess = cb(data);
            this.checkAck(isSuccess, mqItem);
        }, { noAck: false });
    }

    public async subscribeAsync(queueName: string, routingKeys: string[], cb: (data: Object) => Promise<boolean>): Promise<void> {
        let assertion = await this.mqChannel.assertQueue(queueName, { durable: this.persistence, autoDelete: !this.persistence });
        this.bindQueue(queueName, this.exchangeName, routingKeys);
        this.mqChannel.consume(assertion.queue, async mqItem => {
            let data = JSON.parse(mqItem.content.toString());
            let isSuccess = await cb(data);
            this.checkAck(isSuccess, mqItem);
        }, { noAck: false });
    }

    public async unsubscribe(queueName: string, routingKeys: string[]) {
        this.unbindQueue(queueName, this.exchangeName, routingKeys);
    }

    private async assertExchange(exchangeName: string, exchangeType: ExchangeType) {
        await this.mqChannel.assertExchange(exchangeName, exchangeType, { durable: this.persistence });
    }

    private checkAck(isSuccess: boolean, mqItem: MqMessage) {
        if (isSuccess) {
            this.mqChannel.ack(mqItem);
        }
    }

    private async bindQueue(queueName: string, exchangeName: string, routingKeys: string[]) {
        routingKeys.forEach(async key => {
            await this.mqChannel.bindQueue(queueName, exchangeName, key);
        });
    }

    private async unbindQueue(queueName, exchangeName: string, routingKeys: string[]) {
        routingKeys.forEach(async key => {
            await this.mqChannel.unbindQueue(queueName, exchangeName, key);
        });
    }

} 