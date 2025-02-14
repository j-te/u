import {paddedBinary, bitsRequired} from "./core.js";
import {register} from "./coder.js";

export default function oneOf(...choices) {
    const bitSize = bitsRequired(choices.length - 1);
    return {
        encode: function (choice) {
            const index = choices.indexOf(choice);
            if (index === -1) {
                throw new Error(`Invalid choice: ${choice} is not one of ${choices.join(',')}`);
            }
            return {bits: paddedBinary(index, bitSize), blob: ''};
        },

        decode: function ({bits, blob}) {
            const index = parseInt(bits.substr(0, bitSize), 2);
            return {
                value: choices[index],
                rest: { bits: bits.substring(bitSize), blob }
            };
        }
    };
}

register('oneOf', oneOf);
