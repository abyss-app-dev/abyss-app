import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SQliteClient } from './sqlite-client';

export class DBArtifact {
    public readonly fullPath: string;
    private folderPath: string;
    private grouping: string;
    private id: string;
    private client: SQliteClient;

    constructor(client: SQliteClient, grouping: string, id: string) {
        this.grouping = grouping;
        this.id = id;
        this.client = client;

        this.fullPath = join(this.client.path, '..', this.grouping, this.id);
        this.folderPath = join(this.client.path, '..', this.grouping);

        mkdirSync(this.folderPath, { recursive: true });

        if (!existsSync(this.fullPath)) {
            writeFileSync(this.fullPath, '');
        }
    }

    public static async readRawString(client: SQliteClient, grouping: string, id: string) {
        const path = join(client.path, '..', grouping, id);
        return await readFile(path, 'utf8');
    }

    public appendString(string: string) {
        const path = this.fullPath;
        appendFileSync(path, string);
    }
}
