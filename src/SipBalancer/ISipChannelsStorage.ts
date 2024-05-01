import { SipChannel } from "./SipChannel";

export interface ISipChannelsStorage {
    getAll(): Promise<SipChannel[]>;
}