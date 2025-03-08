import createLogifier, { type Logify } from "./logify";

type ErrorHandler = <T extends Error>(err: T) => any;
type ErrorMappingType = Record<string, ErrorHandler>;

class LogifyErr<Mapping extends ErrorMappingType> {
  private logger: Logify;
  private handlers: Partial<ErrorMappingType>;
  constructor(handlers?: ErrorMappingType) {
    this.handlers = handlers ?? {};
    this.logger = createLogifier({ level: "error", context: "ErrorLog" });
  }
  private formContextAndMessage<T extends Error>(
    err: T,
  ): { context: string; message: string } {
    const context = `${err.name}Log`;
    const message = `${err.message}\n${err.name} Stack Trace:\n${err.stack}`;
    return { context, message };
  }
  logError<T extends Error>(err: T): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).error(message);
  }
  logAndHandleError<T extends Error>(err: T) { }
  logErrorToFile<T extends Error>(err: T): void {
    const { context, message } = this.formContextAndMessage(err);
    this.logger.overrideContext(context).errorToFile(message);
  }
  logAndHandleErrorToFile<T extends Error>() { }
}
