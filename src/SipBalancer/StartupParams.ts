export class StartupParams {

    public port: number = 8088;
    public sipchannelsCsv: string = "./sipchannels.csv"

    constructor() {
        this.port = Number(process.argv[2] || this.port);
        this.sipchannelsCsv = process.argv[3] || this.sipchannelsCsv
    }

}