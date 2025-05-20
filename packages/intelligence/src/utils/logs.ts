interface LoggerProps {
    scope: string;
    level: Level;
}

export enum Level {
    debg = 0,
    info = 1,
    warn = 2,
    errr = 3,
    silent = 4,
}

const colors = {
    gray: '\x1b[90m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
};

export class Logger {
    public static base = new Logger({ scope: '', level: Level.debg });
    private scope: string;
    private level: Level;

    constructor(props: LoggerProps) {
        this.scope = props.scope;
        this.level = props.level;
    }

    private formatMessage(level: Level, message: string): string {
        const levelColor = {
            [Level.debg]: colors.gray,
            [Level.info]: colors.blue,
            [Level.warn]: colors.yellow,
            [Level.errr]: colors.red,
            [Level.silent]: colors.gray,
        }[level];

        return `${colors.gray}${this.scope.padEnd(30)}${colors.reset} ${levelColor}${level}${colors.reset} ${message}`;
    }

    child(scope: string) {
        return new Logger({
            scope: this.scope.length > 0 ? `${this.scope}.${scope}` : scope,
            level: this.level,
        });
    }

    log(message: string) {
        if (this.level <= Level.info) {
            console.log(this.formatMessage(Level.info, message));
        }
    }

    debug(message: string) {
        if (this.level <= Level.debg) {
            console.log(this.formatMessage(Level.debg, message));
        }
    }

    error(message: string) {
        if (this.level <= Level.errr) {
            console.error(this.formatMessage(Level.errr, message));
        }
    }

    warn(message: string) {
        if (this.level <= Level.warn) {
            console.warn(this.formatMessage(Level.warn, message));
        }
    }
}
