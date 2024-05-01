
export type TProviderPortsMap = {
    [provider: string]: TMap
};

export type TMap = {
    resend: number[],
    active: number[]
};

export type TNumPortsByProvider = {
    [provider: string]: number
}

export interface IPortsStorage {
    getPort(provider: string, isResend: boolean): number;
    getNumPortsByProvider(): TNumPortsByProvider;
    putActivePort(provider: string, port: number, isActive: boolean): void;
    putResendPort(provider: string, port: number, isResend: boolean): void;
}

export class PortsStorage implements IPortsStorage {

    private defaultProvider = "undefined";
    private providerPortsMap: TProviderPortsMap = {};

    public getPort(provider: string, isResend: boolean): number {

        let portsMap = this.providerPortsMap[provider];
        if (!portsMap) {
            portsMap = this.providerPortsMap[this.defaultProvider];
        }

        return this.getPortFromMap(portsMap, isResend);
    }

    private getPortFromMap(portsMap: TMap, isResend: boolean): number {

        if (!isResend) {
            return portsMap.active.shift();
        } else {
            return portsMap.resend.shift();
        }
    }

    public getNumPortsByProvider(): TNumPortsByProvider {

        let numPortsByProvider = {};

        for (let provider in this.providerPortsMap) {
            numPortsByProvider[provider] = this.providerPortsMap[provider].active.length;
        }

        return numPortsByProvider;
    }

    public putActivePort(provider: string, port: number, isActive: boolean): void {
        let ports = this.getPortsMap(provider);
        let index = ports.active.indexOf(port);

        if (isActive && index < 0) {
            ports.active.push(port);
        } else if (!isActive && index >= 0) {
            ports.active.slice(index, 1);
        }
    }

    public putResendPort(provider: string, port: number, isResend: boolean): void {
        let ports = this.getPortsMap(provider);
        let index = ports.resend.indexOf(port);

        if (isResend && index < 0) {
            ports.resend.push(port);
        } else if (!isResend && index >= 0) {
            ports.resend.slice(index, 1);
        }
    }

    private getPortsMap(provider: string): TMap {

        if (!this.providerPortsMap[provider]) {
            this.providerPortsMap[provider] = { active: [], resend: [] };
        }

        return this.providerPortsMap[provider];
    }
}
