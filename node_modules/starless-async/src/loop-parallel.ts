import os from "os";
import { setEnvironmentData } from "worker_threads";
import { DynamicObject } from ".";
import runWorker from "./utils/run-worker";

export default async function loopParallel(
  values: any[] | DynamicObject,
  scriptUrl: string | URL,
  environments: DynamicObject = {},
  workerNums: number = os.cpus().length
): Promise<any[] | DynamicObject> {
  if (Array.isArray(values)) {
    if (values.length) {
      for (const [key, value] of Object.entries(environments)) {
        setEnvironmentData(key, value);
      }
    }

    let items = [];
    let promises = [];
    for (const [index, value] of values.entries()) {
      promises.push(runWorker(scriptUrl, { index, value, key: index }));
      if (
        promises.length % workerNums == 0 ||
        (index == values.length - 1 && promises.length)
      ) {
        const subItems = await Promise.all(promises);
        items = [...items, ...subItems];
        promises = [];
      }
    }
    return items;
  } else {
    if (Object.keys(values).length) {
      for (const [key, value] of Object.entries(environments)) {
        setEnvironmentData(key, value);
      }
    }

    let items = {};

    let promises = [];
    let keys = [];
    let index = 0;
    for (const [key, value] of Object.entries(values)) {
      keys.push(key);
      promises.push(runWorker(scriptUrl, { key, value, index }));
      if (
        promises.length % workerNums == 0 ||
        (index == values.length - 1 && promises.length)
      ) {
        const subItems = await Promise.all(promises);
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
}
