import { getProcessVar } from "../Core/ProcessHelper";
import { Environments } from "./Environments";

export class ConfigBase {

    public static DEBUG: boolean = false;

    public static SERVER_PORT: number = 8080;
    public static ADMIN_PORT: number = 8081;
    public static GATEWAY_EVENT_LISTENER: number = 8171;

    public static RABBITMQ: string = getProcessVar("RABBITMQ");
    public static MONGO: string = getProcessVar("MONGO");
    public static MYSQL: string = getProcessVar("MYSQL");
    public static REDIS: string = getProcessVar("REDIS") || "redis://redis:6379";
    public static FLUENTD: string = getProcessVar("FLUENTD") || "fluentd:24228/diserver";

    public static readonly VOICE_FILES_DIR: string = getProcessVar("VOICE_FILES_DIR") || "/var/lib/asterisk/sounds/en/tmp/";
    public static readonly VOICE_RECORDS_DIR: string = getProcessVar("VOICE_RECORDS_DIR") || "/var/spool/asterisk/monitor";

    public static GMAIL_USER: string = getProcessVar("GMAIL_USER");
    public static GMAIL_PASS: string = getProcessVar("GMAIL_PASS");

    public static TG_API_TOKEN: string = getProcessVar("TG_API_TOKEN");
    public static TG_CHAT_ID: string = getProcessVar("TG_CHAT_ID");

    public static YANDEX_SPEECHKIT_OAUTH_TOKEN: string = getProcessVar("YANDEX_SPEECHKIT_OAUTH_TOKEN");
    public static YANDEX_SPEECHKIT_FOLDERID: string = getProcessVar("YANDEX_SPEECHKIT_FOLDERID");

    public static B2S_VOICE_FILES_URL: string = getProcessVar("B2S_VOICE_FILES_URL");

    public static readonly TINKOFF_API_SECRET = getProcessVar("TINKOFF_API_SECRET");
    public static readonly TINKOFF_API_KEY = getProcessVar("TINKOFF_API_KEY");
}

export class ConfigTest extends ConfigBase {
    public static B2S_VOICE_FILES_URL: string = "http://host.docker.internal:8080/api/voice/files";
}

export class ConfigDev extends ConfigBase {

    public static RABBITMQ: string = "amqp://localhost:5672";
    public static MONGO: string = "mongodb://localhost:27017/diadmin";
    public static REDIS: string = "redis://localhost:6379";
    public static FLUENTD: string = "localhost:24224/diserver";
    public static MYSQL: string = "mysql://root:root@localhost:3306/distat";

    public static B2S_VOICE_FILES_URL: string = "http://127.0.0.1:8080/api/voice/files";

    public static readonly VOICE_FILES_DIR: string = ".";
    public static readonly VOICE_RECORDS_DIR: string = ".";
}

export class ConfigDevDocker extends ConfigDev {

    public static RABBITMQ: string = "amqp://rabbitmq:5672";
    public static MONGO: string = "mongodb://mongo:27017/diadmin";
    public static REDIS: string = "redis://redis:6379";
    public static FLUENTD: string = "fluentd:24224/diserver";
    public static MYSQL: string = "mysql://root:root@mysql:3306/distat";
}

let Config = ConfigDev;

switch (process.env.SERVER_ENV) {
    case Environments[Environments.test]: Config = ConfigTest; break;
    case Environments[Environments.production]: Config = ConfigBase; break;
    case Environments[Environments.development]: Config = ConfigDev; break;
    case Environments[Environments.devcontainer]: Config = ConfigDevDocker; break;
}

export { Config };