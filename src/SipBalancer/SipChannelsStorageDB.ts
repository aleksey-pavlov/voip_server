import { IObjectRepository, ObjectID } from "../Core/DatabaseMongo";
import { Logger } from "../Core/Logger";
import { ISipChannelsStorage } from "./ISipChannelsStorage";
import { SipChannel } from "./SipChannel";

export type SipChannelSetting = {
    _id: ObjectID,
    channels: Array<{
        id: string,
        provider: string,
        weight: number,
        timeout: number
    }>
}

export class SipChannelsStorageDB implements ISipChannelsStorage {

    public constructor(private repository: IObjectRepository) { }

    public async getAll(): Promise<SipChannel[]> {

        let setting = await this.repository.findOne<SipChannelSetting>({});
        
        let rows = setting.channels;

        let channels = [];

        for (let i in rows) {
            let channel = rows[i];
            channels.push(new SipChannel(channel.id, channel.provider, channel.weight, channel.timeout));
        }

        Logger.info("SipChannelStorageDB.getAll", `Loaded channels from csv: ${JSON.stringify(channels)}`);

        return channels;

    }
}