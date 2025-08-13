import path from "path";
import fs from "fs";
import { Chalk } from "chalk";

import {
  ensureDirExists,
  findProjectRoot,
  getFormattedDate,
  getTimestamp,
} from "./internals";
import { getFormattedJSON } from "./utils";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogifyOptions {
  level: LogLevel;
  context?: LogifyContext["context"];
  contextPrefix?: LogifyContext["prefix"];
  withTime: boolean;
  logDirName: string;
  showLevel: boolean;
  showContext: boolean;
}

type LogifyContext = {
  context?: string;
  prefix?: string;
};

const defaultLogifyOptions: LogifyOptions = {
  level: "info",
  showLevel: true,
  withTime: true,
  logDirName: "debug_logs",
  showContext: true,
};

const chalk = new Chalk();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LOGIFY CLASS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Logify {
  private level: LogLevel;
  private showLevel: boolean;
  private ctx: LogifyContext;
  private showContext: boolean;
  private withTime: boolean;
  private logDir: string;

  constructor(options: LogifyOptions) {
    this.level = options.level;
    this.withTime = options.withTime;
    this.logDir = path.join(findProjectRoot(), options.logDirName);
    this.ctx = {
      context: options.context,
      prefix: options.contextPrefix,
    };
    this.showLevel = options.showLevel;
    this.showContext = options.showContext;
  }

  private getOptions(): LogifyOptions {
    return {
      level: this.level,
      withTime: this.withTime,
      logDirName: path.basename(this.logDir),
      context: this.ctx.context,
      contextPrefix: this.ctx.prefix,
      showLevel: this.showLevel,
      showContext: this.showContext,
    };
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
      const formattedMessage = `${this.withTime ? `[${getFormattedDate()} ${getTimestamp()}] ` : ""}${this.ctx.context && this.showContext ? `<${this.ctx.prefix ? `${this.ctx.prefix}: ` : ""}${this.ctx.context}> ` /*`<ctx: ${this.context}> `*/ : ""}${this.showLevel ? `[${level.toUpperCase()}]` : ""} ${message}`;

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

      const logMessage = `${this.withTime ? `[${getFormattedDate()} ${getTimestamp()}] ` : ""}${this.ctx.context && this.showContext ? `<${this.ctx.prefix ? `${this.ctx.prefix}: ` : ""}> ` /*`<ctx: ${this.context}> `*/ : ""}${this.showLevel ? `[${level.toUpperCase()}]` : ""} ${message}`;

      fs.appendFileSync(logFilePath, logMessage);
    }
  }

  // Methods for modiyfing level
  setLevel(level: LogLevel) {
    this.level = level;
    return this;
  }

  overrideLevel(level: LogLevel) {
    return new Logify({
      ...this.getOptions(),
      level,
    });
  }

  // Method for modifying if log level is included with message
  displayLevel() {
    this.showLevel = true;
    return this;
  }

  hideLevel() {
    this.showLevel = false;
    return this;
  }

  // Methods for modifying context
  setContext(context: LogifyOptions["context"]) {
    this.ctx = {
      ...this.ctx,
      context,
    };
    return this;
  }

  overrideContext(context: LogifyOptions["context"]) {
    return new Logify({
      ...this.getOptions(),
      context,
    });
  }

  // Methods for modifying context prefix
  setContextPrefix(prefix: LogifyOptions["contextPrefix"]) {
    this.ctx = { ...this.ctx, prefix };
    return this;
  }

  overrideContextPrefix(prefix: LogifyOptions["contextPrefix"]) {
    return new Logify({
      ...this.getOptions(),
      contextPrefix: prefix,
    });
  }

  // Methods for modifying if context and prefix are included in message
  displayContext() {
    this.showContext = true;
    return this;
  }

  hideContext() {
    this.showContext = false;
    return this;
  }

  // Methods for modifying if timestamps are shown or not
  showTime() {
    this.withTime = true;
    return this;
  }

  hideTime() {
    this.withTime = false;
    return this;
  }

  // displayLevel(): void {
  //   this.showLevel = true;
  // }

  // hideLevel(): void {
  //   this.showLevel = false;
  // }

  // hideContext(): Logify {
  //   return new Logify({
  //     ...this.getOptions(),
  //     context: undefined,
  //     contextPrefix: undefined,
  //   });
  // }

  // setLevel(level: LogLevel): void {
  //   this.level = level;
  // }

  // overrideLevel(level: LogLevel): Logify {
  //   return new Logify({ ...this.getOptions(), level });
  // }

  // setContext(context: string | undefined): void {
  //   this.ctx = { ...this.ctx, context };
  // }

  // setContextPrefix(prefix: string | undefined): void {
  //   this.ctx = { ...this.ctx, prefix };
  // }

  // overrideContext(ctx: string | undefined): Logify {
  //   return new Logify({ ...this.getOptions(), context: ctx });
  // }

  // overrideContextPrefix(prefix: string | undefined): Logify {
  //   return new Logify({ ...this.getOptions(), contextPrefix: prefix });
  // }

  debug(message: string, ...args: any[]) {
    this.logToConsole("debug", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.logToConsole("info", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logToConsole("warn", message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logToConsole("error", message, ...args);
  }

  debugToFile(message: string) {
    this.logToFile("debug", message);
  }

  infoToFile(message: string) {
    this.logToFile("info", message);
  }

  warnToFile(message: string) {
    this.logToFile("warn", message);
  }

  errorToFile(message: string) {
    this.logToFile("error", message);
  }

  logOptions() {
    this.overrideLevel("debug").debug(getFormattedJSON(this.getOptions()));
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INSTANCE CREATOR FUNCTION
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const createLogify = (options?: Partial<LogifyOptions>) => {
  const mergedOptions = { ...defaultLogifyOptions, ...options };
  return new Logify(mergedOptions);
};

export { Logify, createLogify as default };
