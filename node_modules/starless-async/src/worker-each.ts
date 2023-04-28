import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { DynamicObject } from ".";
import isAsyncFunction from "./utils/is-async-function";

export default async function workerEach(
  values: any[] | DynamicObject,
  cb: (value: any, key: number | string) => any,
  args: any = null
) {
  if (Array.isArray(values)) {
    const promises: any[] = [];
    let i = 0;
    for (const value of values) {
      promises.push(runWorker(value, i, cb, args));
      i++;
    }
    if (isAsyncFunction(cb)) {
      return await Promise.all(promises);
    }
    return promises;
  } else {
    const obj: any = {};
    for (const [key, value] of Object.entries(values)) {
      obj[key] = runWorker(value, key, cb, args);
    }
    for (const [key, value] of Object.entries(obj)) {
      obj[key] = await value;
    }
    return obj;
  }
}

async function runWorker(
  value: any,
  indexOrKey: number | string,
  cb: (value: any, key: number | string, args: any) => any,
  args: any = null
) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
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
}

async function workerJob() {
  const { value, key, cb, args } = workerData;
  let data = null;
  if (isAsyncFunction(eval(cb))) {
    data = await eval(cb)(value, key, args);
  } else {
    data = eval(cb)(value, key, args);
  }
  parentPort.postMessage(data);
}

if (!isMainThread) {
  workerJob();
}
