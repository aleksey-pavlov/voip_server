
export class RoutingKeys {
    public static readonly SEND_VOICE = "sendVoice";
    public static readonly SEND_SMS = "sendSms";
    public static readonly CHANGE_SMS_STATUS = "changeSmsStatus";
    public static readonly CHANGE_VOICE_STATUS = "changeVoiceStatus";
}

export class Exchanges {
    public static readonly SMS_EXCHANGE_TYPE = "direct";
    public static readonly SMS_EXCHANGE = "smsExchange";

    public static readonly VOICE_EXCHANGE_TYPE = "direct";
    public static readonly VOICE_EXCHANGE = "voiceExchange";

    public static readonly CMD_EXCHANGE_TYPE = "direct";
    public static readonly CMD_EXCHANGE = "commandsExchange";
}

export class Queues {
    public static readonly STAT_MESSAGES = "statMessages";
    public static readonly STAT_VOICES = "statVoice";
    public static readonly PROVIDER_MESSAGES = "providerMessages";
    public static readonly PROVIDER_TRUNKS = "providerTrunks";

    public static readonly RPC_STATUS_MESSAGES = "statusMessages";
    public static readonly RPC_STATUS_VOICE = "statusVoice";
    public static readonly RPC_PROVIDER_COMMANDS = "rpcProviderCommands";
    public static readonly RPC_TRUNK_PROVIDER_COMMANDS = "rpcTrunkProviderCommands";
    public static readonly RPC_ASTERISK_ASSETS_MANAGER = "rpcAsteriskAssetsManager";

    // admin's rpc
    public static readonly RPC_AGENT_COMMANDS = "defaultAgent";
    public static readonly RPC_STAT_COMMANDS = "rpcStatCommands";

    public static RPC_GATEWAY_COMMANDS(gatewayId: string) {
        return `rpcGatewayCommands_${gatewayId}`;
    }

    public static SMS(gatewayId: string) {
        return `sms_${gatewayId}`;
    }

    public static RPC_TRUNK_COMMANDS(trunkId: string) {
        return `rpcTrunkCommands_${trunkId}`;
    }

    public static VOICES(trunkId: string) {
        return `voices_${trunkId}`;
    }

    public static VOICES_RESERVABLE(trunkId: string) {
        return `voicesReservable_${trunkId}`;
    }
}

export class RpcCommands {
    public static readonly GATEWAY_UP = "gatewayUp";
    public static readonly GATEWAY_DOWN = "gatewayDown";
    public static readonly PROCESS_INFO = "processInfo";
    public static readonly GATEWAY_UPDATE = "updateGateway";
    public static readonly SYNC = "sync";
    public static readonly SYNC_BLACKLIST = "syncBlackList";
    public static readonly STATISTIC_SMS_UPLOAD = "statUpload";
    public static readonly STATISTIC_VOICES_INQUEUE = "statInqueueVoices";
    public static readonly GETMSG_STATUS = "getMsgStatus";
    public static readonly GETVOICE_STATUS = "getVoiceStatus";

    public static readonly GATEWAY_EVACUATION = "gatewayEvacuation";
    public static readonly GATEWAY_STAT_OUTBOX = "gatewayStatOutbox";

    public static readonly GATEWAYS_PROVIDER_MAP = "getGatewaysProviderMap";

    public static readonly TRUNK_UP = "trunkUp";
    public static readonly TRUNK_DOWN = "trunkDown";
    public static readonly TRUNK_UPDATE = "trunkUpdate";
    public static readonly TRUNK_PROCESS_INFO = "trunkProcessInfo";
    public static readonly TRUNK_PROVIDER_MAP = "getTrunkProviderMap";
    public static readonly TRUNK_EVACUATION = "trunkEvacuation";
    public static readonly TRUNK_GET_ACTIVE_VOICES = "trunkGetActiveVoices";
    public static readonly TRUNK_CLEAN_ACTIVE_VOICES = "trunkCleanActiveVoices";
    public static readonly TRUNK_UNREGISTER_PROVIDER = "trunkUnregisterProvider";
    public static readonly TRUNK_REGISTER_PROVIDER = "trunkRegisterProvider";
    public static readonly TRUNK_CLEAN_QUEUE = "trunkCleanQueue";
    public static readonly TRUNK_GET_QUEUE = "trunkGetQueue";

    public static readonly VOICE_INPUT_RECORD_FILE = "voiceInputRecordFile";
    public static readonly VOICE_OUTPUT_RECORD_FILE = "voiceOutputRecordFile";
    public static readonly VOICE_MIXED_RECORD_FILE = "voiceMixedRecordFile";

}

export class Ivr {
    public static readonly DELAY = 30;
    public static readonly REPEATS = 3;
}