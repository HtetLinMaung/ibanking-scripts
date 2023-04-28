"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const is_async_function_1 = __importDefault(require("./utils/is-async-function"));
function workerEach(values, cb, args = null) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(values)) {
            const promises = [];
            let i = 0;
            for (const value of values) {
                promises.push(runWorker(value, i, cb, args));
                i++;
            }
            if ((0, is_async_function_1.default)(cb)) {
                return yield Promise.all(promises);
            }
            return promises;
        }
        else {
            const obj = {};
            for (const [key, value] of Object.entries(values)) {
                obj[key] = runWorker(value, key, cb, args);
            }
            for (const [key, value] of Object.entries(obj)) {
                obj[key] = yield value;
            }
            return obj;
        }
    });
}
exports.default = workerEach;
function runWorker(value, indexOrKey, cb, args = null) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const worker = new worker_threads_1.Worker(__filename, {
                workerData: {
                    args,
                    value,
                    key: indexOrKey,
                    cb: cb.toString(),
                },
            });
            worker.on("message", resolve);
            worker.on("error", reject);
        });
    });
}
function workerJob() {
    return __awaiter(this, void 0, void 0, function* () {
        const { value, key, cb, args } = worker_threads_1.workerData;
        let data = null;
        if ((0, is_async_function_1.default)(eval(cb))) {
            data = yield eval(cb)(value, key, args);
        }
        else {
            data = eval(cb)(value, key, args);
        }
        worker_threads_1.parentPort.postMessage(data);
    });
}
if (!worker_threads_1.isMainThread) {
    workerJob();
}
