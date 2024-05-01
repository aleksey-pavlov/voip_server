import { Logger } from "../Core/Logger";
import { ISipChannelsStorage } from "./ISipChannelsStorage";
import { SipChannel } from "./SipChannel";

export interface ISipChannelsProvider {
    takeChannel(number: string, provider: string, seq: string): string
    givenChannel(seq: string): void
    getIdleChannels(): {}
    getBusyChannels(): {}
    initialize(): void
}

export class SipChannelsProvider implements ISipChannelsProvider {

    private channelsById: { [x: string]: SipChannel }
    private providersChannels: { [x: string]: string[] }
    private idleChannels: { [x: string]: string[] }
    private busyChannels: { [x: string]: { id: string, provider: string, number: string } } = {}

    constructor(public storage: ISipChannelsStorage) { }

    public async initialize(): Promise<void> {
        this.update(await this.storage.getAll());
    }

    public takeChannel(number: string, provider: string, seq: string): string {

        if (this.busyChannels[seq])
            return this.busyChannels[seq].id;

        if (!this.idleChannels[provider])
            return '';

        let id = this.idleChannels[provider].shift();

        if (!id)
            return '';


        let providers = this.providersChannels[id];
        for (let p in providers) {
            let pid = providers[p];

            if (!pid)
                continue;
            
            if (pid == provider)
                continue;

            let index = this.idleChannels[pid].indexOf(id)
            if (index >= 0)
                this.idleChannels[pid].splice(index, 1);
        }

        this.busyChannels[seq] = { id: id, provider: provider, number: number }

        return id;
    }

    public givenChannel(seq: string): void {

        if (!this.busyChannels[seq])
            return;

        let busyChannel = this.busyChannels[seq];
        let id = busyChannel.id;

        delete this.busyChannels[seq];

        let channel = this.channelsById[id];
        if (!channel)
            return;

        let providers = this.providersChannels[id];
        if (!providers)
            return;

        for (let p in providers) {
            let pid = providers[p];

            if (!pid)
                continue;

            if (!this.idleChannels[pid])
                continue;

            let currWeight = this.idleChannels[pid].filter(x => x == channel.id).length;
            if (currWeight >= channel.weigth)
                continue;

            if (channel.giveTimeout > 0) {
                setTimeout ( () => this.idleChannels[pid].push(id), channel.giveTimeout * 1000);
            } else {
                this.idleChannels[pid].push(id)
            }
           
        }
    }

    public getIdleChannels() {
        return this.idleChannels;
    }

    public getBusyChannels() {
        return this.busyChannels;
    }

    private update(channels: SipChannel[]): void {

        let channelsById = {};
        let channelsQueue: { [x: string]: string[] } = {};
        let providersChannels: { [x: string]: string[] } = {};

        for (let i in channels) {

            let channel = channels[i];

            channelsById[channel.id] = channel;

            if (!channelsQueue[channel.provider])
                channelsQueue[channel.provider] = []

            channelsQueue[channel.provider].push(...Array(channel.weigth).fill(channel.id));

            if (!providersChannels[channel.id])
                providersChannels[channel.id] = []

            providersChannels[channel.id].push(channel.provider);
        }

        this.channelsById = channelsById;
        this.idleChannels = channelsQueue;
        this.providersChannels = providersChannels;

        Logger.info("SipChannelQueue.update", `Updated channels. Current queue map: ${JSON.stringify(this.idleChannels)}`);
    }

}