import {fromVarN, toVarN} from "./core.js";
import {register} from "./coder.js";

export default function varchar() {
    return {
        encode: function (string) {
            return {bits: '', blob: toVarN(string.length) + string};
        },
        decode: function ({bits, blob}) {
            let size;
            [size, blob] = fromVarN(blob);
            return {
                value: blob.substr(0, size),
                rest: { bits, blob: blob.substr(size) }
            };
        }
    };
}

register('varchar', varchar);
