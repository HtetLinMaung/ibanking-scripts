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
const os_1 = __importDefault(require("os"));
const worker_threads_1 = require("worker_threads");
const run_worker_1 = __importDefault(require("./utils/run-worker"));
function runParallel(values, scriptUrl, environments = {}, workerNums = os_1.default.cpus().length) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(values)) {
            if (values.length) {
                for (const [key, value] of Object.entries(environments)) {
                    (0, worker_threads_1.setEnvironmentData)(key, value);
                }
            }
            let items = [];
            let promises = [];
            for (const [index, value] of values.entries()) {
                promises.push((0, run_worker_1.default)(scriptUrl, { index, value, key: index }));
                if (promises.length % workerNums == 0 ||
                    (index == values.length - 1 && promises.length)) {
                    const subItems = yield Promise.all(promises);
                    items = [...items, ...subItems];
                    promises = [];
                }
            }
            return items;
        }
        else {
            if (Object.keys(values).length) {
                for (const [key, value] of Object.entries(environments)) {
                    (0, worker_threads_1.setEnvironmentData)(key, value);
                }
            }
            let items = {};
            let promises = [];
            let keys = [];
            let index = 0;
            for (const [key, value] of Object.entries(values)) {
                keys.push(key);
                promises.push((0, run_worker_1.default)(scriptUrl, { key, value, index }));
                if (promises.length % workerNums == 0 ||
                    (index == values.length - 1 && promises.length)) {
                    const subItems = yield Promise.all(promises);
                    for (const [i, v] of subItems.entries()) {
                        items[keys[i]] = v;
                    }
                    promises = [];
                    keys = [];
                }
                index++;
            }
            return items;
        }
    });
}
exports.default = runParallel;
