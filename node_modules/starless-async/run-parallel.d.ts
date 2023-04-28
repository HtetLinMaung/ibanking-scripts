import { DynamicObject } from ".";
export default function runParallel(values: any[] | DynamicObject, scriptUrl: string | URL, environments?: DynamicObject, workerNums?: number): Promise<any[] | DynamicObject>;
