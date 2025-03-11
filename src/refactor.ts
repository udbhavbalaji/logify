import createLogifier, { type Logify } from "./logify";

type ReturnTypes =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | void;

type ErrorHandler<
  H extends ErrorReturnMapping,
  T extends ReturnTypes = ReturnTypes,
> = (err: RegError<H>) => T;
type RegError<T extends ErrorReturnMapping, E extends Error = Error> = E & {
  name: keyof T;
};
type ErrorReturnMapping = Record<string, ReturnTypes>;
type ErrorHandlerMapping<T extends ErrorReturnMapping> = {
  [K in keyof T]: ErrorHandler<T, T[K]>;
};

class LogErr<Mapping extends ErrorReturnMapping> {
  private logger: Logify;
  private handlers: ErrorHandlerMapping<Mapping>;

  constructor(handlers: ErrorHandlerMapping<Mapping>) {
    this.logger = createLogifier({ level: "error", context: "ErrorLog" });
    this.handlers = handlers;
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
      return handler(err);
    } catch (err) {
      throw new Error("Error in handler");
    }
  }

  logError(err: Error): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).error(message);
  }

  private isHandleableError(
    name: string,
  ): name is Extract<keyof Mapping, string> {
    return name in this.handlers;
  }

  // logAndHandleError<K extends keyof typeof this.handlers>(
  //   err: Error & { name: K },
  // ): ReturnType<(typeof this.handlers)[K]> {
  //   this.logError(err);
  //   return this.handleError(err.name, err) as any;
  // }
  logAndHandleError<E extends Error>(err: RegError<Mapping, E>) {
    if (this.isHandleableError(err.name)) {
      this.logError(err);
      return this.handleError(err.name, err);
    } else {
      return;
    }
  }
}

class CA extends Error {
  name: "CA";
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
  CA: (err: Error) => console.log(err.name),
  CB: (err: CB) => err.name,
});

const err = new CA("this is CA");

const res = logerr.logAndHandleError(new CA("This is CA"));
