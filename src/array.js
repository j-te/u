import {concat, fromVarN, toVarN} from "./core.js";
import {register} from "./coder.js";

export function array(entry) {
    return {
        encode: function (array) {
            return concat([{blob: toVarN(array.length)}].concat(array.map(entry.encode)));
        },
        decode: function ({bits, blob}) {
            let size;
            [size, blob] = fromVarN(blob);
            let rest = {bits, blob};
            let array = [], result, i;
            for (i = 0; i < size; i++) {
                result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            }
            return {value: array, rest};
        }
    };
}

register('array', array);
