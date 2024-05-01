import { GatewayApi } from "../../Gateway/GatewayApi";

(async () => {

    let api = new GatewayApi();
    api.setConnectionParams({
        port: 8053,
        ip: "127.0.0.1",
        password: "admin",
        user: "admin"
    });

    let portInfo = await api.get_port_info({ port: [0], info_type: [ "iccid", "imei", "imsi", "number", "reg", "smsc", "type" ] });
    console.log(portInfo);
})();