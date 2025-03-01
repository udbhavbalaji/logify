import path from "path";
import fs from "fs";
import { Chalk } from "chalk";

import {
  ensureDirExists,
  findProjectRoot,
  getFormattedDate,
  getTimestamp,
} from "./internals";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogifyOptions {
  level: LogLevel;
  context?: string;
  withTime: boolean;
  logDirName: string;
}

const defaultLogifyOptions: LogifyOptions = {
  level: "info",
  withTime: true,
  logDirName: "debug_logs",
};

const chalk = new Chalk();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LOGIFY CLASS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Logify {
  private level: LogLevel;
  private context?: string;
  private withTime: boolean;
  private logDir: string;

  constructor(options?: Partial<LogifyOptions>) {
    const mergedOptions = { ...defaultLogifyOptions, ...options };

    this.level = mergedOptions.level;
    this.context = mergedOptions.context;
    this.withTime = mergedOptions.withTime;
    this.logDir = path.join(findProjectRoot(), mergedOptions.logDirName);
  }

  private shouldLog(level: LogLevel): boolean {
    const levelValues: { [key in LogLevel]: number } = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levelValues[level] >= levelValues[this.level];
  }

  private logToConsole(level: LogLevel, message: string, ...args: any): void {
    if (this.shouldLog(level)) {
      const formattedMessage = `${this.withTime ? `[${getFormattedDate()} ${getTimestamp()}] ` : ""}${this.context ? `(ctx: ${this.context}) ` : ""}[${level.toUpperCase()}] ${message}`;

      switch (level) {
        case "debug": {
          console.log(chalk.cyan(formattedMessage, ...args));
          break;
        }
        case "info": {
          console.log(chalk.green(formattedMessage, ...args));
          break;
        }
        case "warn": {
          console.log(chalk.yellow(formattedMessage, ...args));
          break;
        }
        default: {
          console.log(chalk.red(formattedMessage, ...args));
          break;
        }
      }
    }
  }

  private logToFile(level: LogLevel, message: string): void {
    if (this.shouldLog(level)) {
      ensureDirExists(this.logDir);
      const logDirWithLevel = path.join(this.logDir, level);
      ensureDirExists(logDirWithLevel);
      const logFilePath = path.join(
        logDirWithLevel,
        `${getFormattedDate("")}.log`,
      );

      const logMessage = `${this.withTime ? `[${getFormattedDate()} ${getTimestamp()}] ` : ""}${this.context ? `(ctx: ${this.context}) ` : ""}[${level.toUpperCase()}] ${message}`;

      fs.appendFileSync(logFilePath, logMessage);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  toggleTimestamps(): void {
    this.withTime = !this.withTime;
  }

  setContext(ctx: string): void {
    this.context = ctx;
  }

  debug(message: string, ...args: any[]): void {
    this.logToConsole("debug", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logToConsole("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logToConsole("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logToConsole("error", message, ...args);
  }

  debugToFile(message: string): void {
    this.logToConsole("debug", message);
  }

  infoToFile(message: string): void {
    this.logToConsole("info", message);
  }

  warnToFile(message: string): void {
    this.logToConsole("warn", message);
  }

  errorToFile(message: string): void {
    this.logToConsole("error", message);
  }
}

export default Logify;
