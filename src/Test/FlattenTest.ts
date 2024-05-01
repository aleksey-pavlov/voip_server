import { isObject } from "util";

let obj = { "1": { "context": "webhook", "url": "http://someurl.ru", "2": { "test": 123 } } };


function flatten(obj, out = {}, key = "") {

    for (let i in obj) {
        let flateKey = key ? `${key}_${i}` : i;
        if (isObject(obj[i])) {
            flatten(obj[i], out, flateKey);
        } else {
            out[flateKey] = obj[i];
        }
    }

    return out;
}

console.log(flatten(obj));