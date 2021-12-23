import {concat, isNone, none, notNone} from "./core.js";
import {register} from "./coder.js";

export function object(entries) {
    return {
        encode: function (object) {
            var mapped = [];
            for (var [key, value] of Object.entries(entries)) {
                mapped.push(object.hasOwnProperty(key)
                    ? [{bits: notNone}, value.encode(object[key])]
                    : {bits: none});
            }
            return concat(mapped.flat());
        },
        decode: function ({bits, blob}) {
            var object = {};
            Object.entries(entries).forEach(([key, entry]) => {
                if (isNone(bits)) {
                    bits = bits.substr(1);
                    return;
                } else {
                    bits = bits.substr(1);
                }

                var result = entry.decode({bits, blob});
                bits = result.rest.bits;
                blob = result.rest.blob;
                object[key] = result.value;
            });
            return {value: object, rest: {bits, blob}};
        }
    };
}

register('object', object);
