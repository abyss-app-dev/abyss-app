export interface LogMessage {
    level: 'info' | 'errr' | 'warn' | 'begin' | 'success' | 'fail';
    message: string;
    data?: object;
}

export type LogLevel = LogMessage['level'];
