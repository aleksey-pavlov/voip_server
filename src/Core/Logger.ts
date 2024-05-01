import { format } from "util";
export type Levels = "INFO" | "DEBUG" | "WARN" | "ERROR";
export type Body = { level: Levels, caller: string, log: any };

export class Logger {

    private static storage: Array<(tag: string, body: Body) => void> = [];

    public static setStorage(storage: (tag: string, body: Body) => void) {
        Logger.storage.push(storage);
    }

    public static info(caller: string, log: string, params?: any[], tag?: string) {
        Logger.printLog("INFO", caller, log, params, tag);
    }

    public static debug(caller: string, log: string, params?: any[], tag?: string) {
        Logger.printLog("DEBUG", caller, log, params, tag);
    }

    public static warn(caller: string, log: string, params?: any[], tag?: string) {
        Logger.printLog("WARN", caller, log, params, tag);
    }

    public static error(caller: string, log: string, params?: any[], tag?: string) {
        Logger.printLog("ERROR", caller, log, params, tag);
    }

    private static printLog(level: Levels, caller: string, log: string, params: any[], tag: string = "log") {

        if (params) {
            params.unshift(log)
            log = format.apply(this, params);
        }

        if (Logger.storage != null) {
            Logger.storage.forEach((cb) => {
                cb(tag, { level: level, caller: caller, log: log });
            });
        }
    }
}