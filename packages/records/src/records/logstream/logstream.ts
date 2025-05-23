import { DBArtifact } from '../../sqlite/db-artifact';
import type { SQliteClient } from '../../sqlite/sqlite-client';
import { safeSerialize } from '../../utils/serialization';
import type { LogMessage } from './logstream.type';

export class LogStream {
    public static VERBOSE = false;
    public readonly id: string;
    private scope: string;
    private readonly artifact: DBArtifact;
    private readonly startTime: number;

    static fromClient(id: string, client: SQliteClient): LogStream {
        const artifact = new DBArtifact(client, 'logs', id);
        console.log('%cStarted Log Stream:', 'color:rgb(87, 185, 90); font-weight: bold', artifact.fullPath);
        return new LogStream(id, 'root', artifact, Date.now());
    }

    private constructor(id: string, scope: string, artifact: DBArtifact, startTime: number = Date.now()) {
        this.id = id;
        this.scope = scope;
        this.artifact = artifact;
        this.startTime = startTime;
    }

    private formatTimeDelta() {
        const delta = Date.now() - this.startTime;
        const minutes = Math.floor(delta / 60000);
        const seconds = Math.floor((delta % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private formatMessage(level: LogMessage['level'], message: string, data: object = {}) {
        if (Object.keys(data).length > 0) {
            const dataObj = safeSerialize(data);
            const dataString = JSON.stringify(dataObj);
            return `${this.formatTimeDelta()} ${level} ${this.scope.padEnd(20)} ${message}\n${dataString}`;
        }
        return `${this.formatTimeDelta()} ${level} ${this.scope.padEnd(20)} ${message}`;
    }

    public child(scope: string) {
        return new LogStream(this.id, `${this.scope}.${scope}`, this.artifact, this.startTime);
    }

    private addMessage(message: LogMessage) {
        const formattedMessage = this.formatMessage(message.level, message.message, message.data);
        if (LogStream.VERBOSE) {
            console.log(formattedMessage);
        }
        this.artifact.appendString(`\n${formattedMessage}`);
    }

    public log(message: string, data: object = {}) {
        this.addMessage({ message, data, level: 'info' });
    }

    public warn(message: string, data: object = {}) {
        this.addMessage({ message, data, level: 'warn' });
    }

    public error(message: string, data: object = {}) {
        this.addMessage({ message, data, level: 'errr' });
    }

    public success() {
        this.addMessage({ message: 'success', level: 'success' });
    }

    public fail() {
        this.addMessage({ message: 'fail', level: 'fail' });
    }
}
