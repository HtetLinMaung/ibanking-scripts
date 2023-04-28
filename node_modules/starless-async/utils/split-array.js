"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function splitArray(items, parts = 1) {
    const result = [];
    const perPart = Math.ceil(items.length / parts);
    for (let i = 0; i < parts; i++) {
        const start = i * perPart;
        const end = (i + 1) * perPart;
        const subItems = items.slice(start, end);
        if (subItems.length) {
            result.push(subItems);
        }
    }
    return result;
}
exports.default = splitArray;
