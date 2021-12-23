import oneOf from "./oneOf.js";
import {register} from "./coder.js";

export default function boolean() {
    return oneOf(true, false);
}

register('boolean', boolean);
