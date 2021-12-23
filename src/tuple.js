import {concat} from "./core.js";
import {register} from "./coder.js";

export function tuple(entries) {
    return {
        encode: function (array) {
            return concat(entries.map((entry, i) => entry.encode(array[i])));
        },
        decode: function (rest) {
            const array = [];
            entries.forEach((entry, i) => {
                const result = entry.decode(rest);
                array[i] = result.value;
                rest = result.rest;
            });
            return {value: array, rest};
        }
    };
}

register('tuple', tuple);
