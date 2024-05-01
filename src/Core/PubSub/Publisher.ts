import { ExchangeType } from "./ExchangeType";
import { MqChannel } from "../DatabaseRabbit";

export interface IPublisher {
    publish(routingKey: string, data: Object): boolean;
}

export class Publisher implements IPublisher {

    public constructor(private exchangeName: string,
        private exchangeType: ExchangeType,
        private persistence: boolean,
        private mqChannel: MqChannel) {

        this.assertExchange(this.exchangeName, this.exchangeType);
    }

    private async assertExchange(exchangeName: string, exchangeType: ExchangeType) {
        await this.mqChannel.assertExchange(exchangeName, exchangeType, { durable: this.persistence });
    }

    public publish(routingKey: string, data: Object): boolean {
        let mqItem = new Buffer(JSON.stringify(data));
        return this.mqChannel.publish(this.exchangeName, routingKey, mqItem, { deliveryMode: 2, persistent: this.persistence });
    }
}