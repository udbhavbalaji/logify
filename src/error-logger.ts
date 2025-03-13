import createLogifier, { type Logify, type LogifyOptions } from "./logify";

type ReturnTypes =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | void;

type ErrorHandler<T = ReturnTypes> = (err: Error) => T;

// type ErrorReturnMapping = Record<string, ReturnTypes>;
type ErrorReturnMapping<T = ReturnTypes> = Record<string, T>;

type ErrorHandlerMapping<T extends ErrorReturnMapping> = {
  [K in keyof T]: ErrorHandler<T[K]>;
};

// todo: Need to create a helper type that allows a user to define the type

class ErrorLogifier<Mapping extends ErrorReturnMapping> {
  private logger: Logify;
  // todo: need to check if wrapping Partial has broken something
  private handlers: Partial<ErrorHandlerMapping<Mapping>>;

  constructor(handlers: Partial<ErrorHandlerMapping<Mapping>>, logger: Logify) {
    this.handlers = handlers;
    this.logger = logger;
  }

  private formContextAndMessage(err: Error): {
    context: string;
    message: string;
  } {
    const context = `${err.name}Log`;
    const message = `${err.message}\n${err.name} Stack Trace:\n${err.stack}\n\n`;
    return { context, message };
  }

  private handleError<K extends keyof Mapping>(errorName: K, err: Error) {
    const handler = this.handlers[errorName];
    if (!handler) {
      this.logger
        .overrideContext("ErrorHandlerException")
        .error(
          `No handler found for ${err.name}. Add it to handler mapping or use logError().`,
        );
      process.exit(1);
    }
    try {
      return handler(err);
    } catch (error) {
      this.logger
        .overrideContext("ErrorHandlerException")
        .error(`Error in error handler for ${(error as Error).name}.`);
      this.logError(error as Error);
      process.exit(1);
    }
  }

  logError(err: Error): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).error(message);
  }

  logErrorToFile(err: Error): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).errorToFile(message);
  }

  logAndHandleError(err: Error): unknown;
  logAndHandleError<K extends keyof Mapping>(err: Error): Mapping[K];
  logAndHandleError<K extends keyof Mapping>(err: Error): unknown | Mapping[K] {
    const result = this.handleError(err.name, err) as any;
    this.logError(err);
    return result;
  }

  logAndHandleErrorToFile(err: Error): unknown;
  logAndHandleErrorToFile<K extends keyof Mapping>(err: Error): Mapping[K];
  logAndHandleErrorToFile<K extends keyof Mapping>(
    err: Error,
  ): unknown | Mapping[K] {
    const result = this.handleError(err.name, err) as any;
    this.logErrorToFile(err);
    return result;
  }
}

function createErrorLogifier<Mapping extends ErrorReturnMapping>(
  handlers?: ErrorHandlerMapping<Mapping>,
  loggerOptions?: Partial<
    Pick<LogifyOptions, "logDirName" | "withTime" | "context">
  >,
): ErrorLogifier<Mapping> {
  const logger = createLogifier({ ...loggerOptions, level: "error" });
  return new ErrorLogifier(handlers ?? {}, logger);
}

export { createErrorLogifier, ErrorLogifier };
