import { Logger } from "../Core/Logger";
import { readFile } from "../Core/Utils";
import { ISipChannelsStorage } from "./ISipChannelsStorage";
import { SipChannel } from "./SipChannel";

export class SipChannelsStorageCSV implements ISipChannelsStorage {

    public constructor(private path: string) { }

    public async getAll(): Promise<SipChannel[]> {

        let csv = await readFile(this.path);
        let rows = csv.toString().split("\n");
        let channels = []
        for (let i in rows) {
            if (!rows[i])
                continue;

            let cols = rows[i].split(";");

            let id = cols[0];
            let provider = cols[1];
            let weigth = Number(cols[2]);
            let timeout = Number(cols[3] || 0);

            channels.push(new SipChannel(id, provider, weigth, timeout));
        }

        Logger.info("SipChannelStorageCSV.getAll", `Loaded channels from csv: ${JSON.stringify(channels)}`);

        return channels;

    }
}