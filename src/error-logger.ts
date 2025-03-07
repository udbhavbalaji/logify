import createLogifier from "./logify";

const errorLogger = createLogifier({ level: "error", context: "ErrorLog" });

const logError = (err: Error): void => {
  const context = `<<${err.name}Log>> `;

  const errorMessage = `${err.message}\nError Stack Trace:\n${err.stack}`;

  errorLogger.overrideContext(context).error(errorMessage);
};

const logAndHandleError = () => { };

const logErrorToFile = (err: Error): void => {
  const context = `<<${err.name}Log>> `;

  const errorMessage = `${err.message}\nError Stack Trace:\n${err.stack}\n`;

  errorLogger.overrideContext(context).errorToFile(errorMessage);
};

const logAndHandleErrorToFile = () => { };

export { logError, logErrorToFile, logAndHandleError, logAndHandleErrorToFile };
