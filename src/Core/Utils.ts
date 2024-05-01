import * as fs from "fs";
import { isObject } from "util";

export function getCurrentTimeSec(): number {
    return Math.ceil(Date.now()/1000);
}

export async function delayAsync(sec: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), sec * 1000);
    });
}

export async function checkExistsFile(filePatch: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        fs.exists(filePatch, (exists: boolean) => {
            resolve(exists);
        })
    });
}

export async function fileStat(filePatch: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(filePatch, (err: Error, stat: fs.Stats) => {
            resolve(stat);
        })
    });
}

export async function writeFile(filePatch: string, data: any, flag: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(filePatch, data, { flag: flag }, (err: NodeJS.ErrnoException) => {
            if (err) { reject(err); }
            resolve();
        })
    });
}

export async function removeFile(filePatch: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.unlink(filePatch, (err: NodeJS.ErrnoException) => {
            if (err) { reject(err); }
            resolve();
        })
    });
}

export async function readTypedFile<T>(filePatch: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        fs.readFile(filePatch, (err, data) => {
            if (err) { reject(err); }
            try {
                let typedData = JSON.parse(data.toString());
                resolve(typedData);
            } catch (err) {
                reject(err);
            }
        })
    });
}

export async function readFile(filePatch: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(filePatch, (err, data) => {
            if (err) { reject(err); }
            resolve(data);
        })
    });
}

export async function scandir(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, { encoding: "utf8" }, (err: NodeJS.ErrnoException, files: string[]) => {
            if (err) { reject(err); }
            resolve(files);
        });
    });
}

export function flatten(obj: Object, handlers: TFlattenCustomHandlers = {}, out = {}, key = ""): Object {

    for (let i in obj) {

        if (handlers[i]) {
            obj[i] = handlers[i](obj[i]);
        }

        let flateKey = key ? `${key}_${i}` : i;
        if (isObject(obj[i])) {
            flatten(obj[i], handlers, out, flateKey);
        } else {
            out[flateKey] = obj[i];
        }
    }

    return out;
}

export type TFlattenCustomHandlers = { [x: string]: (value: any) => any };

export function compileTemplate(source, template) {
    let keys = Object.keys(source);
    let func = Function(...keys, "return `" + template + "`");
    return func(...keys.map(k => source[k]));
}


export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}