import { Document, Model } from "mongoose";
interface LoggerAttrs {
    level: string;
    message: string;
    meta: {
        ip_address?: string;
        correlation_id?: string;
        flow_id?: string;
        status_code?: number;
        route?: string;
        method?: string;
        browser_name?: string;
        browser_version?: string;
        os_name?: string;
        os_version?: string;
        device_name?: string;
        device_type?: string;
        resolution?: string;
        user_agent_source?: string;
        request_body?: string;
        request_response?: string;
        request_params?: string;
        application_name?: string;
        description?: string;
    };
    description: string;
}
interface LoggerDoc extends Document {
    level: string;
    message: string;
    meta: {
        ip_address?: string;
        correlation_id?: string;
        flow_id?: string;
        status_code?: number;
        route?: string;
        method?: string;
        browser_name?: string;
        browser_version?: string;
        os_name?: string;
        os_version?: string;
        device_name?: string;
        device_type?: string;
        resolution?: string;
        user_agent_source?: string;
        request_body?: string;
        request_response?: string;
        request_params?: string;
        application_name?: string;
        description?: string;
    };
    description: string;
    createdAt: Date;
    lastUpdatedAt: Date;
    version: number;
    fingerprint?: string;
}
interface LoggerModel extends Model<LoggerDoc> {
    build(attrs: LoggerAttrs): Promise<LoggerDoc>;
    searchLogs(options: {
        keyword?: string;
        fromDateTime?: Date;
        toDateTime?: Date;
        page?: number;
        pageSize?: number;
    }): Promise<any>;
}
declare const Logger: LoggerModel;
export { Logger };
