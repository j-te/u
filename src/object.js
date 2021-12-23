import {concat, isNone, none, notNone} from "./core.js";
import {register} from "./coder.js";
import _ from "lodash";

export function object(entries) {
    return {
        encode: function (object) {
            return concat(
                _.flatten(_.map(entries, function (entry, key) {
                    //console.log("HAS", key, typeof key);
                    if (object.hasOwnProperty(key)) {
                        return [{bits: notNone}, entry.encode(object[key])];
                    }
                    return {bits: none};
                })));
        },
        decode: function ({bits, blob}) {
            var object = {};
            _.each(entries, function (entry, key) {
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
