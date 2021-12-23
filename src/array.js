import {concat, fromVarN, toVarN} from "./core.js";
import {register} from "./coder.js";
import _ from "lodash";

export function array(entry) {
    return {
        encode: function (array) {
            return concat([{blob: toVarN(array.length)}].concat(_.map(array, entry.encode)));
        },
        decode: function ({bits, blob}) {
            var size;
            [size, blob] = fromVarN(blob);
            var rest = {bits, blob};
            var array = [], result, i;
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
