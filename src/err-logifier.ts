import createLogifier, { type Logify } from "./logify";

export type ErrorHandler = <T extends Error>(err: T) => any;
type ErrorMappingType = Record<string, ErrorHandler>;

class LogifyErr<Mapping extends ErrorMappingType> {
  private logger: Logify;
  private handlers: Partial<Mapping>;

  constructor(mapping?: Mapping) {
    this.logger = createLogifier({ level: "error", context: "ErrorLog" });
    this.handlers = mapping ?? {};
  }

  private formContextAndMessage<T extends Error>(
    err: T,
  ): { context: string; message: string } {
    const context = `${err.name}Log`;
    const message = `${err.message}\n${err.name} Stack Trace:\n${err.stack}`;
    return { context, message };
  }

  private handleError<T extends Error>(err: T, handler: ErrorHandler) {
    try {
      return (handler as ErrorHandler)(err);
    } catch (err) {
      this.logger
        .overrideContext("ErrorHandlerException")
        .error(`Error in Error handler for ${(err as Error).name}`);
    }
  }

  logError<T extends Error>(err: T): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).error(message);
  }

  logAndHandleError<T extends Error>(err: T) {
    const handler = this.handlers[err.name as keyof Mapping];

    if (!handler) {
      this.logger
        .overrideContext("ErrorHandlerException")
        .error("This error has no handler function registered");
      this.logError(err);
      return;
    }

    this.logError(err);
    return this.handleError(err, handler);
  }

  logErrorToFile<T extends Error>(err: T): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).errorToFile(message);
  }

  logAndHandleErrorToFile<T extends Error>(err: T) {
    this.logErrorToFile(err);
    const handler = this.handlers[err.name as keyof Mapping];
    if (!handler) {
      this.logger
        .overrideContext("ErrorHandlerException")
        .error("This error has no handler registered");
      return;
    }
    return this.handleError(err, handler);
  }
}
export default LogifyErr;
