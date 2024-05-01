import { assert } from "chai";
import { SipChannelsProvider } from "../SipBalancer/SipChannelsProvider";
import { SipChannelsStorageDB } from "../SipBalancer/SipChannelsStorageDB";
import { ObjectRepositoryMock } from "./Core/DatabaseMongoMock";
import { ObjectID } from "mongodb";

describe("sip channels provider", () => {

    it("test load, take, give", async () => {

        let objectRepository = new ObjectRepositoryMock();

        let data = {
            "_id": new ObjectID(),
            "channels": [
                {
                    "id": "SIP/undefined_t3/01+",
                    "provider": "undefined",
                    "weight": 2,
                    "timeout": 0
                }
            ]
        };

        await objectRepository.create(data);


        let sipChannels = new SipChannelsProvider(new SipChannelsStorageDB(objectRepository));
        await sipChannels.initialize();        

        let channel = sipChannels.takeChannel("+7XXXXXXXXXX", "undefined", "1");
        assert.equal(channel, "SIP/undefined_t3/01+");

        let busy = sipChannels.getBusyChannels();
        assert.deepEqual(busy, { "1": { "id": "SIP/undefined_t3/01+", "number": "+7XXXXXXXXXX", "provider":"undefined" } });

        let idle = sipChannels.getIdleChannels();
        assert.deepEqual(idle, { "undefined": [ "SIP/undefined_t3/01+" ] });

        sipChannels.givenChannel("1");

        let busy_1 = sipChannels.getBusyChannels();
        assert.deepEqual(busy_1, {});

        let idle_1 = sipChannels.getIdleChannels();
        assert.deepEqual(idle_1, { "undefined": [ "SIP/undefined_t3/01+", "SIP/undefined_t3/01+" ] });
    });
});