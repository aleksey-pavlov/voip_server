import { TVoiceMessage, EVoiceStatus } from "../../Types/VoiceModel";

export interface IAsteriskManager {
	originateAction(voice: TVoiceMessage): Promise<TOriginateResponse>;
	cdrEvent(cb: (event: TEventCdrResponse) => Promise<void>): void;
	events(cb: (event: any) => void): void;
}

export type TOriginateQuery = {
	action?: string,
	timeout?: number,
	channel: string,
	context: string,
	exten: string,
	priority: number,
	callerid: string,
	async: string,
	account: string,
	variable: { [x: string]: string }
}

export type TOriginateResponse = {
	actionid: string
	message: string
	response: "Success" | "Error"
}

export type TEventCdrResponse = {
	accountcode: string;
	amaflags: string;
	answertime: string;
	billableseconds: string;
	callerid: string;
	calleridname: string;
	calleridnum: string;
	channel: string;
	destination: string;
	destinationchannel: string;
	destinationcontext: string;
	disposition: TEventCdrDisposition;
	duration: string;
	endtime: string;
	event: string;
	lastapplication: string;
	lastdata: string;
	privilege: string;
	source: string;
	starttime: string;
	uniqueid: string;
	userfield: string;
	amdstatus: string;
	dialstart: string;
}

export type TCdrResponse = {
	systemId: string;
	status: EVoiceStatus;
	duration: number;
	cdrDestination: number;
	cdrUniqueId: string;
	cdrAmdStatus: string;
	startAt: number;
	finishAt: number;
	dialuptime: number;
}

export function cdrEventToCdrResponse(event: TEventCdrResponse): TCdrResponse {

	let startAt = Date.parse(event.starttime) / 1000;
	let finishAt = Date.parse(event.endtime) / 1000;
	let dialstart = Date.parse(event.dialstart) / 1000;

	let duration = Number(event.billableseconds);
	if (dialstart > 0)
		duration = duration + (finishAt - dialstart);

	let dialuptime = Number(event.duration);

	let isValidDestination = (event.destination &&
		event.destination.length > 0 &&
		!Number.isNaN(Number(event.destination)));
	let cdrDestination = isValidDestination ? Number(event.destination) : -1;
	let status = cdrDispositionToStatus(event.disposition);

	return {
		systemId: event.calleridname,
		status: status,
		cdrAmdStatus: event.amdstatus,
		cdrDestination: cdrDestination,
		cdrUniqueId: event.uniqueid,
		duration: duration,
		finishAt: finishAt,
		startAt: startAt,
		dialuptime: dialuptime
	}
}


export enum TEventCdrDisposition {

	NOANSWER = "NO ANSWER", // The channel was not answered. This is the default disposition.
	FAILED = "FAILED", // The channel attempted to dial but the call failed.
	BUSY = "BUSY", // The channel attempted to dial but the remote party was busy.
	ANSWERED = "ANSWERED", //The channel was answered. The hang up cause will no longer impact the disposition of the CDR.
	CONGESTION = "CONGESTION" // The channel attempted to dial but the remote party was congested.	
}

export type TAsteriskManagerParams = {
	host: string,
	port: number,
	user: string,
	password: string
}

export function cdrDispositionToStatus(disposition: TEventCdrDisposition): EVoiceStatus {
	switch (disposition) {
		case TEventCdrDisposition.ANSWERED:
			return EVoiceStatus.NORMAL;
		case TEventCdrDisposition.BUSY:
			return EVoiceStatus.BUSY;
		case TEventCdrDisposition.FAILED:
			return EVoiceStatus.FAILED;
		case TEventCdrDisposition.NOANSWER:
			return EVoiceStatus.NOANSWER;
		default:
			return EVoiceStatus.CANCELED;
	}
}