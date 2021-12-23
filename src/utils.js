export function sortBy(key) {
    return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
}

export function isObject(object) {
    return typeof object === "object" && object !== null;
}
