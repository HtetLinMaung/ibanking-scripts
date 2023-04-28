"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAsyncFunction(func) {
    if (func.toString().includes("async") ||
        func.toString().includes("__awaiter")) {
        return true;
    }
    return false;
}
exports.default = isAsyncFunction;
