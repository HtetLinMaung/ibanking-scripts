export interface DynamicObject {
    [key: string]: any;
}
export declare const timeout: (duration: number) => Promise<unknown>;
export declare const asyncEach: (values: any[] | DynamicObject, cb: (value: any, key: number | string) => any, t?: number) => Promise<any>;
