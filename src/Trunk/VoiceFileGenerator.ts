import { ISpeechGenerator } from "./ISpeechGenerator";
import { TVoiceMessage, EVoiceMessageTypes } from "../Types/VoiceModel";
import { fileStat, writeFile, readTypedFile } from "../Core/Utils";
import md5 = require("md5");

export type TVoiceFileGeneratorContext = {
    duration: number;
    name: string;
    text: string;
}

export type TVoiceFileGeneratorResponse = TVoiceFileGeneratorContext & {
    exists: boolean;
    chars: number;
}

export interface IVoiceFileGenerator {
    generate(voice: TVoiceMessage): Promise<TVoiceFileGeneratorResponse>;
}

export enum EVoiceGeneratorTypes {
    SOURCE = "source",
    TEXT = "text",
    TEXT_V2 = "text_v2"
};

export class VoiceFileGenerator implements IVoiceFileGenerator {

    private readonly generators: Map<EVoiceGeneratorTypes, ISpeechGenerator>;
    private readonly voiceFilesDir: string;

    constructor(generators: Map<EVoiceGeneratorTypes, ISpeechGenerator>, voiceFilesDir: string) {
        this.generators = generators;
        this.voiceFilesDir = voiceFilesDir;
    }

    public async generate(voice: TVoiceMessage): Promise<TVoiceFileGeneratorResponse> {

        let generatorType: EVoiceGeneratorTypes = EVoiceGeneratorTypes.SOURCE;

        if (voice.type == EVoiceMessageTypes.TEXT) {
            generatorType = EVoiceGeneratorTypes.TEXT;
            voice.voiceFile = this.getVoiceFileName(voice);
        }

        if (voice.type == EVoiceMessageTypes.TEXT_V2) {
            generatorType = EVoiceGeneratorTypes.TEXT_V2;
            voice.voiceFile = this.getVoiceFileNameV2(voice);
        }

        let voiceFilePath = `${this.voiceFilesDir}/${voice.voiceFile}.gsm`;
        let voiceContextFilePath = `${this.voiceFilesDir}/${voice.voiceFile}.json`;

        let isExists = await this.isfileExists(voiceContextFilePath) && await this.isfileExists(voiceFilePath);

        if (!isExists) {
            let fileInfo = await this.generators.get(generatorType).generate(voice, voiceFilePath);
            let fileContext: TVoiceFileGeneratorContext = {
                duration: fileInfo.duration,
                name: voice.voiceFile,
                text: voice.text
            };
            await writeFile(voiceContextFilePath, JSON.stringify(fileContext), "w+");
        }

        let context = await readTypedFile<TVoiceFileGeneratorResponse>(voiceContextFilePath);

        return {
            duration: context.duration,
            exists: isExists,
            name: voice.voiceFile,
            text: voice.text,
            chars: voice.text ? voice.text.length : 0
        };
    }

    private async isfileExists(path: string): Promise<boolean> {

        let stat = await fileStat(path);
        if (stat && stat.isFile()) {
            return true;
        }

        return false;
    }

    private getVoiceFileName(voice: TVoiceMessage): string {

        return md5(`${voice.text}${JSON.stringify(voice.speechGenerateParams)}`);

    }

    private getVoiceFileNameV2(voice: TVoiceMessage): string {

        return md5(`${voice.text}${JSON.stringify(voice.speechGenerateParamsV2)}`);

    }
}