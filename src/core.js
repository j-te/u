export function bitsRequired(maxValue) {
    if (maxValue === 0) {
        return 1;
    }
    return Math.floor(Math.log(maxValue) / Math.LN2) + 1;
}

export function paddedBinary(value, bitSize) {
    const binary = value.toString(2);
    if (binary.length > bitSize) {
        throw new Error(`Invalid value or bitSize: can't fit ${value} in ${bitSize} bits`);
    }

    return '0'.repeat(bitSize - binary.length) + binary;
}

export const notNone = paddedBinary(0, 1);
export const none = paddedBinary(1, 1);

export function isNone(bits) {
    return (bits && bits.length >= 1 && bits[0] === none[0]);
}

export function concat(encoded) {
    return encoded.reduce((acc, obj) => {
        return {bits: acc.bits + (obj.bits || ''), blob: acc.blob + (obj.blob || '')};
    }, {bits: '', blob: ''});
}

const availableCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-';
const base = availableCharacters.length; // 64

export function toN(x) {
    if (x < 0) {
        throw new Error(`Invalid number: can't encode negative number ${x}`);
    }

    let result = '';
    while (x >= base) {
        result = availableCharacters[x % base] + result;
        x = Math.floor(x / base);
    }

    result = availableCharacters[x] + result;
    return result;
}

export function fromN(n) {
    let x = 0,
        index;
    for (let i = 0; i < n.length; i++) {
        index = availableCharacters.indexOf(n[i]);
        if (index === -1) {
            throw new Error(`Invalid number: can't decode ${n}`);
        }
        x += index * Math.pow(base, n.length - i - 1);
    }
    return x;
}

export function fromVarN(string) {
    let str = string;
    let value = 0;
    let hasMore = true;
    while (hasMore) {
        if (str.length === 0) {
            throw new Error(`Invalid number: can't decode ${string}`);
        }
        const byte = str[0];
        str = str.substr(1);
        const n = fromN(byte);
        hasMore = n > 31;
        value = (value << 5) | (n & 31);
    }
    return [value, str];
}

export function toVarN(n) {
    let result = '';
    let charsRequired = Math.ceil(bitsRequired(n) / 5);
    let bits = paddedBinary(n, charsRequired * 5);
    while (bits) {
        let part = bits.substr(0, 5);
        bits = bits.substr(5);
        part = (bits.length === 0 ? '0' : '1') + part;
        result += bitsToN(part);
    }
    return result;
}


export function paddedN(x, charSize) {
    const r = toN(x);
    if (r.length > charSize) {
        throw new Error(`Invalid charSize: can't encode ${x} in ${charSize} chars`);
    }

    return availableCharacters[0].repeat(charSize - r.length) + r;
}

export function bitsToN(bits) {
    let result = '', char;
    while (bits) {
        char = bits.substr(0, 6);
        bits = bits.substr(6);

        if (char.length < 6) {
            char += '0'.repeat(6 - char.length);
        }
        result += toN(parseInt(char, 2));
    }

    return result;
}

export function nToBits(chars, bitSize) {
    return [...chars].map(c => paddedBinary(fromN(c), 6)).join('').substr(0, bitSize);
}
