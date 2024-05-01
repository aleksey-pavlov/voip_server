import { IRpcSender } from "../../Core/Rpc/RpcSender";
import { RpcCommands } from "../../Config/Constants";

export type TVoiceChannelState = {
    inqueue: number;
}

export interface IVoiceChannelState {
    getState(clientId: number): Promise<TVoiceChannelState>;
}

export class VoiceChannelState implements IVoiceChannelState {

    constructor(private rpcStatCommands: IRpcSender) { }

    public async getState(clientId: number): Promise<TVoiceChannelState> {
        let inqueue = await this.rpcStatCommands.sendAndGetReply(RpcCommands.STATISTIC_VOICES_INQUEUE, { clientId: clientId }, 10);
        return {
            inqueue: Number(inqueue)
        }
    }

}