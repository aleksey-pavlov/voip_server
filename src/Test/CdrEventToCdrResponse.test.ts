import { expect } from "chai";
import { cdrEventToCdrResponse, TEventCdrDisposition } from "../Trunk/AsteriskManager/IAsteriskManager";

describe("cdr event to cdr response", () => {

    it("if empty destination", () => {

        let response = cdrEventToCdrResponse({
            accountcode: `2-1123`,
            amaflags: "DOCUMENTATION",
            amdstatus: "HUMAN",
            answertime: "",
            billableseconds: "11",
            callerid: `"test" <test>`,
            calleridname: "test",
            calleridnum: `test`,
            channel: "SIP/undefined_t2-00000170",
            destination: "",
            destinationchannel: "",
            destinationcontext: "public",
            disposition: TEventCdrDisposition.ANSWERED,
            duration: "11",
            endtime: "2019-10-15 11:56:45",
            event: "Cdr",
            lastapplication: "AppDial2",
            lastdata: "(Outgoing Line)",
            privilege: "cdr,all",
            source: "undefined",
            starttime: "2019-10-15 11:56:25",
            uniqueid: "11",
            userfield: "",
            dialstart: "2019-10-15 11:56:35"
        });

        expect(-1).equal(response.cdrDestination);
    });

    it("if string destination", () => {

        let response = cdrEventToCdrResponse({
            accountcode: `2-1123`,
            amaflags: "DOCUMENTATION",
            amdstatus: "HUMAN",
            answertime: "",
            billableseconds: "11",
            callerid: `"test" <test>`,
            calleridname: "test",
            calleridnum: `test`,
            channel: "SIP/undefined_t2-00000170",
            destination: "s",
            destinationchannel: "",
            destinationcontext: "public",
            disposition: TEventCdrDisposition.ANSWERED,
            duration: "11",
            endtime: "2019-10-15 11:56:45",
            event: "Cdr",
            lastapplication: "AppDial2",
            lastdata: "(Outgoing Line)",
            privilege: "cdr,all",
            source: "undefined",
            starttime: "2019-10-15 11:56:25",
            uniqueid: "11",
            userfield: "",
            dialstart: "2019-10-15 11:56:35"
        });

        expect(-1).equal(response.cdrDestination);
    });

    it("if number destination", () => {

        let response = cdrEventToCdrResponse({
            accountcode: `2-1123`,
            amaflags: "DOCUMENTATION",
            amdstatus: "HUMAN",
            answertime: "",
            billableseconds: "11",
            callerid: `"test" <test>`,
            calleridname: "test",
            calleridnum: `test`,
            channel: "SIP/undefined_t2-00000170",
            destination: "2",
            destinationchannel: "",
            destinationcontext: "public",
            disposition: TEventCdrDisposition.ANSWERED,
            duration: "11",
            endtime: "2019-10-15 11:56:45",
            event: "Cdr",
            lastapplication: "AppDial2",
            lastdata: "(Outgoing Line)",
            privilege: "cdr,all",
            source: "undefined",
            starttime: "2019-10-15 11:56:25",
            uniqueid: "11",
            userfield: "",
            dialstart: "2019-10-15 11:56:35"
        });

        expect(2).equal(response.cdrDestination);
    });
});