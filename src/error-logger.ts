import createLogifier, { type Logify } from "./logify";

type ReturnTypes =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | void;
type ErrorHandler<T extends ReturnTypes = ReturnTypes> = (err: Error) => T;
type ErrorReturnMapping = Record<string, ReturnTypes>;
type ErrorHandlerMapping<T extends ErrorReturnMapping> = {
  [K in keyof T]: ErrorHandler<T[K]>;
};

class LogErr<Mapping extends ErrorReturnMapping> {
  private logger: Logify;
  private handlers: ErrorHandlerMapping<Mapping>;

  constructor(handlers: ErrorHandlerMapping<Mapping>) {
    this.handlers = handlers;
    this.logger = createLogifier({ level: "error", context: "ErrorLog" });
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
    if (!handler) throw new Error("No handler");
    try {
      return handler(err) as any;
    } catch (err) {
      throw new Error("Error in handler");
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

  logAndHandleError<T = unknown>(err: Error) {
    this.logError(err);
    return this.handleError(err.name, err) as T;
  }

  logAndHandleErrorToFile<T = unknown>(err: Error) {
    this.logErrorToFile(err);
    return this.handleError(err.name, err) as T;
  }
}

function createLogErr<Mapping extends ErrorReturnMapping>(
  handlers: ErrorHandlerMapping<Mapping>,
): LogErr<Mapping> {
  return new LogErr(handlers);
}

class CA extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "CA";
  }
}

class CB extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "CB";
  }
}

const logerr = new LogErr({
  CA: (err: CA) => console.log(err.name),
  CB: (err: CB) => err.name,
});

const res = logerr.logAndHandleError(new CA("This is CA"));
