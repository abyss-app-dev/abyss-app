import os from 'node:os';
import path from 'node:path';
import { SQliteClient } from '@abyss/records';

const dbPath = path.join(os.homedir(), '.abyss', 'sqlite');
export const db = new SQliteClient(dbPath);
window['abyss-sqlite'] = db;
