import * as sox from "sox-stream";

export function TranscoderWavToGsm() {

    return sox({
        effects: ['-V1'],
        output: {
            rate: 8000,
            channels: 1,
            type: 'gsm'
        },
        input: {
            type: 'wav'
        }
    });
}

export function TranscoderRawToGsm() {

    return sox({
        effects: ['-V1'],
        output: {
            rate: 8000,
            channels: 1,
            type: 'gsm'
        },
        input: {
            rate: 48000,
            bits: 16,
            encoding: 'signed-integer',
            channels: 1,
            type: 'raw'
        }
    });
}

export function TranscoderRawToMp3() {
    return sox({
        effects: ['-V1'],
        input: {
            rate: 16000,
            bits: 16,
            encoding: 'signed-integer',
            channels: 1,
            type: 'raw'
        }, output: {
            type: 'mp3'
        }
    });
}