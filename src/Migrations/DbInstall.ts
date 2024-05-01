import { DatabaseMongo, MongoClient, ObjectID } from "../Core/DatabaseMongo";
import { Config } from "../Config/Config";
import { DatabaseMysql } from "../Core/DatabaseMysql"; 
import md5 = require("md5");

(async () => {
    try {
        let mongoDb: DatabaseMongo = await MongoClient.connect(Config.MONGO);

        let mongoSchema = {
            "asset.clients": {
                data: {
                    "_id": new ObjectID("591da31110a10c0021da097c"),
                    "uid": 1,
                    "email": "test@test.com",
                    "name": "John Snow",
                    "balance": 3341,
                    "pricing": "Bussines",
                    "password": md5("321"),
                    "ip": "::1",
                    "authKey": "591da31110a10c0021da097c",
                    "active": true,
                    "ipVerification": false,
                    "stat": {
                        "messages": 39145,
                        "lastAuth": 1503861127
                    },
                    "blocked": false,
                    "dailyLimit": 0,
                    "sentTotal": 333,
                    "authAt": 1562009220,
                    "statDaily": {
                        "sentMessages": 0,
                        "resetAt": 1562276741,
                        "resetInterval": 86400
                    },
                    "updated_at": new Date("2019-07-01T18:49:22.442Z"),
                    "bandwidthLimit": false,
                    "voiceBandwidthLimit": 10,
                    "voiceTrunkId": "",
                    "voiceRetryLimit": 3,
                    "voiceRetryDelayLimit": 300,
                    "voiceSentTotal": 54,
                    "voiceDailyLimit": 0,
                    "voiceStatDaily": {
                        "sentMessages": 0,
                        "resetAt": 1562355229,
                        "resetInterval": 86400
                    },
                    "voiceQueue": 0
                }
            },
            "asset.gateways": {
                data: {
                    "_id": new ObjectID("591da31110a10c0021da097c"),
                    "ports": [
                        {
                            "info": {
                                "port": 0,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                0,
                                1,
                                2,
                                3
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 1,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                4,
                                5,
                                6,
                                7
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 2,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                8,
                                9,
                                10,
                                11
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 3,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                12,
                                13,
                                14,
                                15
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 4,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                16,
                                17,
                                18,
                                19
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 5,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                20,
                                21,
                                22,
                                23
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 6,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                24,
                                25,
                                26,
                                27
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 7,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                28,
                                29,
                                30,
                                31
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 8,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                32,
                                33,
                                34,
                                35
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 9,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                36,
                                37,
                                38,
                                39
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 10,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                40,
                                41,
                                42,
                                43
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 11,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                44,
                                45,
                                46,
                                47
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 12,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                48,
                                49,
                                50,
                                51
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 13,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                52,
                                53,
                                54,
                                55
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 14,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                56,
                                57,
                                58,
                                59
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 15,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                60,
                                61,
                                62,
                                63
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 16,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                64,
                                65,
                                66,
                                67
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 17,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                68,
                                69,
                                70,
                                71
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 18,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                72,
                                73,
                                74,
                                75
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 19,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                76,
                                77,
                                78,
                                79
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 20,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                80,
                                81,
                                82,
                                83
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 21,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                84,
                                85,
                                86,
                                87
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 22,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                88,
                                89,
                                90,
                                91
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 23,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                92,
                                93,
                                94,
                                95
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 24,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                96,
                                97,
                                98,
                                99
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 25,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                100,
                                101,
                                102,
                                103
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 26,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                104,
                                105,
                                106,
                                107
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 27,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                108,
                                109,
                                110,
                                111
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 28,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                112,
                                113,
                                114,
                                115
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 29,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "XXXXXXXXXXXXXXX",
                                "iccid": "XXXXXXXXXXXXXXXF",
                                "smsc": "+7XXXXXXXXXX",
                                "number": "",
                                "reg": "REGISTER_OK"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": "+7XXXXXXXXXX"
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                116,
                                117,
                                118,
                                119
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 30,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "",
                                "iccid": "",
                                "smsc": "",
                                "number": "",
                                "reg": "NO_SIM"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": ""
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                120,
                                121,
                                122,
                                123
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        },
                        {
                            "info": {
                                "port": 31,
                                "type": "GSM",
                                "imei": "XXXXXXXXXXXXXXX",
                                "imsi": "",
                                "iccid": "",
                                "smsc": "",
                                "number": "",
                                "reg": "NO_SIM"
                            },
                            "mobileConfig": {
                                "CLIR": 0,
                                "IsRevPola": 1,
                                "IsGsmOpen": 0,
                                "Micphone": 3,
                                "Handset": 7,
                                "APN": "",
                                "APNName": "",
                                "APNPSW": "",
                                "PortBandType": "Default(Auto)",
                                "SimWorkMode": 0,
                                "bandtypedata": 512,
                                "SMSC": ""
                            },
                            "isResend": false,
                            "initialIsResend": false,
                            "active": true,
                            "initialActive": false,
                            "limitDay": 0,
                            "resetDayAt": 1562050951,
                            "limitMonth": 0,
                            "resetMonthAt": 1564642951,
                            "activeSlot": 0,
                            "numSlots": 4,
                            "numSentBySlot": {
                                "day": [
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "month": [
                                    0,
                                    0,
                                    0,
                                    0
                                ]
                            },
                            "slotsIndexes": [
                                124,
                                125,
                                126,
                                127
                            ],
                            "provider": "beeline",
                            "alwaysGiveStatus": null
                        }
                    ],
                    "ip": "127.0.0.1",
                    "port": 80,
                    "user": "admin",
                    "password": "admin",
                    "priority": 0,
                    "maxMsgInQueue": 32,
                    "maxQueryResult": 32,
                    "limitMsgQueryResult": 512,
                    "rutineInterval": 2000,
                    "created_at": "2017-05-18T13:35:13.977Z",
                    "updated_at": new Date("2019-07-01T12:53:55.634Z"),
                    "active": true,
                    "sentboxExpire": 60,
                    "deliverboxExpire": 3600,
                    "portsResend": [
                        0,
                        1,
                        3,
                        5,
                        12,
                        13,
                        8,
                        9,
                        7,
                        11,
                        15,
                        6,
                        2,
                        14,
                        4,
                        10
                    ],
                    "portsActive": [
                        8,
                        9,
                        14,
                        15,
                        26,
                        27,
                        6,
                        16,
                        18,
                        21,
                        0,
                        11,
                        17,
                        12,
                        19,
                        20,
                        23,
                        25,
                        10,
                        28,
                        29,
                        30,
                        1,
                        31,
                        7,
                        13,
                        22,
                        24,
                        2,
                        3,
                        4,
                        5
                    ],
                    "deviceUserId": 3662536,
                    "name": "32(2)",
                    "api": {
                        "_host": "127.0.0.1",
                        "_port": 80,
                        "_user": "admin",
                        "_password": "admin",
                        "_auth": "Basic YWRtaW46YWRtaW4="
                    },
                    "statusCode": 200,
                    "statusNote": "Success",
                    "location": "default",
                    "sentBoxExpire": 1800,
                    "deliverBoxExpire": 3600,
                    "messagesType": "undefined",
                    "boxesState": {
                        "outbox": 0,
                        "sentbox": 0
                    },
                    "adminUrl": "127.0.0.1:8153",
                    "methodGetStatus": "query",
                    "mobileConfigManual": false
                }
            },
            "asset.trunks": {
                data: {
                    "_id": new ObjectID("5cd0a7744377b3001b79b99c"),
                    "id": "t1",
                    "provider": "undefined",
                    "weight": 1,
                    "bandwidth": 30,
                    "host": "127.0.0.1",
                    "port": 9039,
                    "user": "user",
                    "pass": "pass",
                    "created_at": new Date("2019-05-06T21:30:28.581Z"),
                    "updated_at": new Date("2019-07-01T06:33:18.417Z"),
                    "location": "default",
                    "statistic": {
                        "active": 0,
                        "queue": 0,
                        "retry": 0
                    },
                    "debugMode": true,
                    "devMode": true,
                    "sipChannelTemplate": "${provider}_${id}/02${recipient}",
                    "cronInterval": 5,
                    "comment": "32(2)",
                    "activeExpired": 100,
                    "batchSize": 25
                }
            },
            "admin.users": {
                data: {
                    "_id" : new ObjectID("58a0cb5a226af6f943fef3f1"),
                    "email" : "admin@test.com",
                    "password" : md5("admin"),
                    "name" : "Admin",
                    "groups" : {
                        "admin" : 1
                    },
                    "updated_at" : new Date("2017-04-24T06:40:17.226Z"),
                    "finished_at" : new Date("1970-01-01T00:00:00.000Z"),
                    "started_at" : new Date("1970-01-01T00:00:00.000Z"),
                    "authed_at" : new Date("2019-07-05T03:29:13.873Z"),
                    "created_at" : "2016-05-17 19:22:22"
                }
            },
            "asset.sip_balancer": {
                data: {
                    "_id" : new ObjectID("6569aabbeb18e3fd8b61e9e9"),
                    "channels" : [ 
                        {
                            "id" : "SIP/undefined_t12/01+",
                            "provider" : "undefined",
                            "weight" : 2,
                            "timeout" : 30
                        }, 
                        {
                            "id" : "SIP/undefined_t1/01+",
                            "provider" : "beeline",
                            "weight" : 2,
                            "timeout" : 0
                        }, 
                        {
                            "id" : "SIP/undefined_t2/01+",
                            "provider" : "megafon",
                            "weight" : 2,
                            "timeout" : 0
                        }, 
                        {
                            "id" : "SIP/undefined_t2/01+",
                            "provider" : "tele2",
                            "weight" : 2,
                            "timeout" : 0
                        }
                    ],
                    "updated_at" : new Date("2023-12-14T15:36:48.849Z"),
                    "url" : "http://localhost:8088"
                }
            }
        }

        for (let c in mongoSchema) {
            try {
                let collection = await mongoDb.createCollection(c);
                await collection.insert(mongoSchema[c].data);
            } catch (err) {

            }
        }

        mongoDb.close();

        let mysqlDb = new DatabaseMysql(Config.MYSQL);

        let dbname = mysqlDb.getConfigDBName();

        await mysqlDb.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`, []);
        await mysqlDb.query(`USE ${dbname}`, []);
        await mysqlDb.query("CREATE TABLE IF NOT EXISTS `messages` (\
            `systemId` VARCHAR(32) NOT NULL COLLATE 'utf8mb4_unicode_ci',\
            `messageId` BIGINT(20) UNSIGNED NOT NULL,\
            `clientId` INT(11) UNSIGNED NOT NULL,\
            `text` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',\
            `textOrigin` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',\
            `recipient` VARCHAR(95) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',\
            `status` VARCHAR(10) NOT NULL COLLATE 'utf8mb4_unicode_ci',\
            `acceptedAt` INT(11) UNSIGNED NOT NULL,\
            `sentAt` INT(11) UNSIGNED NOT NULL DEFAULT '0',\
            `error` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',\
            `deviceUserId` BIGINT(20) NOT NULL DEFAULT '0',\
            `deviceRefId` INT(11) UNSIGNED NOT NULL DEFAULT '0',\
            `gatewayIdSent` VARCHAR(24) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',\
            `portGatewaySent` INT(3) UNSIGNED NULL DEFAULT NULL,\
            `changeAt` INT(11) UNSIGNED NOT NULL DEFAULT '0',\
            `isResend` VARCHAR(15) NOT NULL COLLATE 'utf8mb4_unicode_ci',\
            `parts` TINYINT(4) NOT NULL DEFAULT '0',\
            `portGatewayResend` INT(3) NULL DEFAULT NULL,\
            `provider` VARCHAR(95) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',\
            `providerId` VARCHAR(45) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',\
            `def` INT(11) NOT NULL DEFAULT '0',\
            `region` VARCHAR(155) NOT NULL DEFAULT '' COLLATE 'utf8mb4_unicode_ci',\
            PRIMARY KEY (`systemId`),\
            INDEX `deviceUserId` (`deviceUserId`),\
            INDEX `status` (`status`),\
            INDEX `acceptedAt` (`acceptedAt`),\
            INDEX `sentAt` (`sentAt`),\
            INDEX `changeAt` (`changeAt`),\
            INDEX `providerId` (`providerId`),\
            INDEX `messageId` (`messageId`),\
            INDEX `clientId` (`clientId`)\
        )\
        COLLATE='utf8mb4_unicode_ci'\
        ENGINE=InnoDB\
        /*!50100 PARTITION BY KEY ()\
        PARTITIONS 20  */;", []);

        await mysqlDb.query("CREATE TABLE IF NOT EXISTS `voices` (\
            `systemId` VARCHAR(32) NOT NULL COLLATE 'utf8mb4_unicode_ci',\
            `messageId` VARCHAR(50) NOT NULL,\
            `clientId` BIGINT(20) NOT NULL,\
            `acceptedAt` DOUBLE NULL DEFAULT NULL,\
            `recipient` VARCHAR(55) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `status` VARCHAR(25) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `text` TEXT NULL COLLATE 'utf8mb4_unicode_ci',\
            `priority` BIGINT(20) NULL DEFAULT NULL,\
            `provider` VARCHAR(105) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `providerId` VARCHAR(25) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `def` INT(11) NULL DEFAULT NULL,\
            `region` VARCHAR(155) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `enqueueAt` DOUBLE NULL DEFAULT NULL,\
            `voiceFile` VARCHAR(36) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `duration` INT(11) NULL DEFAULT NULL,\
            `error` VARCHAR(155) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `context` VARCHAR(25) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `actualDuration` INT(11) NULL DEFAULT NULL,\
            `trunkId` VARCHAR(45) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `sipChannel` VARCHAR(105) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `cdrUniqueId` VARCHAR(45) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',\
            `cdrDestination` INT(3) NULL DEFAULT NULL,\
            `dialuptime` INT(11) NULL DEFAULT NULL, \
            `synthesCharsCount` INT(11) NULL DEFAULT NULL, \
            PRIMARY KEY (`systemId`),\
            INDEX `status` (`status`),\
            INDEX `acceptedAt` (`acceptedAt`),\
            INDEX `messageId` (`messageId`),\
            INDEX `clientId` (`clientId`),\
            INDEX `cdrUniqueId` (`cdrUniqueId`)\
        )\
        COLLATE='utf8mb4_unicode_ci'\
        ENGINE=InnoDB\
        /*!50100 PARTITION BY KEY ()\
        PARTITIONS 20  */\
        ", []);

        await mysqlDb.close();

    } catch (err) {
        console.error(err.stack);
    }
})();