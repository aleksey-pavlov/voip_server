import * as smpp from "smpp";
try {
	var session = smpp.connect('0.0.0.0', '2775');
	session.bind_transceiver({
		system_id: '',
		password: ''
	}, function (pdu) {
		console.log(pdu);
		if (pdu.command_status == 0) {
			// Successfully bound
			session.submit_sm({
				//source_addr: "0",
				source_addr_ton: 1,
				source_addr_npi: 1,
				destination_addr: "+7XXXXXXXXXX",
				dest_addr_ton: 1,
				dest_addr_npi: 1,
				short_message: "Hello world!",
				sm_lenght: 16,
				esm_class: 0,
				data_coding: 0,
				registered_delivery: 1
			}, function (pdu) {
				console.log(pdu);
			});

			session.on("deliver_sm", function(resp) {
				console.log(resp);
				console.log(resp.short_message.message.toString())
			});
		}
	});

} catch (err) {
	console.log(err.stack);
}
