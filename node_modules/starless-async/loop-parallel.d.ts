import { DynamicObject } from ".";
export default function loopParallel(values: any[] | DynamicObject, scriptUrl: string | URL, environments?: DynamicObject, workerNums?: number): Promise<any[] | DynamicObject>;
