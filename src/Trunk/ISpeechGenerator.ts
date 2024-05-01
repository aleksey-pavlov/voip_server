import { TVoiceMessage } from "../Types/VoiceModel";

export type TSpeechGeneratorResponse = {
    duration: number;
};

export interface ISpeechGenerator {
    generate(voice: TVoiceMessage, destFilePath: string): Promise<TSpeechGeneratorResponse>;
}