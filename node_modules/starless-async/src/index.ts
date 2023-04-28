import isAsyncFunction from "./utils/is-async-function";

export interface DynamicObject {
  [key: string]: any;
}

export const timeout = async (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration * 1000));

export const asyncEach = async (
  values: any[] | DynamicObject,
  cb: (value: any, key: number | string) => any,
  t = 0
) => {
  if (Array.isArray(values)) {
    let results: any[] = [];
    let promises: any[] = [];
    let i = 0;
    for (const value of values) {
      if (t > 0 && promises.length % t == 0) {
        results = [
          ...results,
          ...(isAsyncFunction(cb) ? await Promise.all(promises) : promises),
        ];
        promises = [];
      }
      promises.push(cb(value, i));
      i++;
    }
    if (promises.length) {
      results = [
        ...results,
        ...(isAsyncFunction(cb) ? await Promise.all(promises) : promises),
      ];
      promises = [];
    }

    return results;
  } else {
    let result: any = {};
    let obj: any = {};
    for (const [key, value] of Object.entries(values)) {
      if (t > 0 && Object.keys(obj).length % t == 0) {
        for (const [key, value] of Object.entries(obj)) {
          result[key] = isAsyncFunction(cb) ? await value : value;
        }
        obj = {};
      }
      obj[key] = cb(value, key);
    }
    if (Object.keys(obj).length) {
      for (const [key, value] of Object.entries(obj)) {
        result[key] = isAsyncFunction(cb) ? await value : value;
      }
      obj = {};
    }

    return result;
  }
};
