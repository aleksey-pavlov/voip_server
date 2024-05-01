import * as pm2 from "pm2";

export type StartupOptions = {
    name: string,
    script: string,
    args: string[],
    max_restarts: number,
    watch?: boolean,
    interpreterArgs?: string[],
    kill_timeout?: number
};

export class Pm2 {
    private async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            pm2.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    public async start(params: StartupOptions): Promise<pm2.Proc> {
        await this.connect();
        return new Promise<pm2.Proc>((resolve, reject) => {
            pm2.start(params, (err, apps) => {
                if (err) {
                    reject(err);
                }
                resolve(apps);
            });
        });
    }

    public async stop(processName: string): Promise<pm2.Proc> {
        await this.connect();
        return new Promise<pm2.Proc>((resolve, reject) => {
            pm2.stop(processName, (err, apps) => {
                if (err) {
                    reject(err);
                }
                resolve(apps);
            });
        });
    }

    public async list(): Promise<pm2.ProcessDescription[]> {
        await this.connect();
        return new Promise<pm2.ProcessDescription[]>((resolve, reject) => {
            pm2.list((err, apps) => {
                if (err) {
                    reject(err);
                }
                resolve(apps);
            });
        });
    }

    public async describe(processName: string): Promise<pm2.ProcessDescription[]> {
        await this.connect();
        return new Promise<pm2.ProcessDescription[]>((resolve, reject) => {
            pm2.describe(processName, (err, description) => {
                if (err) {
                    reject(err);
                }
                resolve(description);
            });
        });
    }

    public async sendSignal(signal: string, processName: string): Promise<void> {
        await this.connect();
        return new Promise<void>((resolve, reject) => {
            pm2.sendSignalToProcessName(signal, processName, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}