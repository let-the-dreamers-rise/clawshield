export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export class Logger {
  constructor(
    private readonly name: string,
    private readonly minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info"
  ) {}

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? { agent: this.name, ...context } : { agent: this.name },
    };
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }
  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }
  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }
  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  }

  child(suffix: string): Logger {
    return new Logger(`${this.name}:${suffix}`, this.minLevel);
  }
}

export function createLogger(name: string): Logger {
  return new Logger(name);
}
