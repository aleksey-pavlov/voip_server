import { IBox } from "./GatewayBox";

export interface IBoxes {
    getOutbox(): IBox;
    getSentbox(): IBox;
}


export class GatewayBoxes implements IBoxes {

    private outBox: IBox;
    private sentBox: IBox;

    public constructor(
        outBox: IBox,
        sentBox: IBox,
    ) {
        this.outBox = outBox;
        this.sentBox = sentBox;
    }

    public getOutbox(): IBox {
        return this.outBox;
    }

    public getSentbox(): IBox {
        return this.sentBox;
    }
}