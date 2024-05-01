import { compileTemplate } from "../Core/Utils";

export type TSipChannelCompilerParams = {
    provider: string;
    id: string;
    recipient: string;
    caller: string;
}

export function sipChannelCompiler(params: TSipChannelCompilerParams, sipChannelTemplate: string) {
    return compileTemplate(params, sipChannelTemplate);
}