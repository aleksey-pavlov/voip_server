export type StatusResponse = {
    message_id: number,
    status: string,
    error: string,
}


export type VoiceStatusResponse = {
    message_id: number,
    status: string,
    error: string,
    duration: number,
    actual_duration: number;
    ivr_answer: number;
    dialuptime: number;
    synthes_chars_count: number;
}