import { DynamicObject } from ".";
export default function workerEach(values: any[] | DynamicObject, cb: (value: any, key: number | string) => any, args?: any): Promise<any>;
