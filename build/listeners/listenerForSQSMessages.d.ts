interface ListenerFunction {
    (message: any): Promise<void>;
}
export declare function startSQSListener(queueUrl: string, region: string, func: ListenerFunction, interval?: number): Promise<void>;
export {};
