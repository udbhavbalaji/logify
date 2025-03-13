# logify

**A utility package, written in TS, for advanced, formatted logging while debugging.**

## Features:

1. Replaces console's different log levels (debug, info, warn, error) with formatted logging functions.
2. Provides additional methods to log to file (separate for each level).
3. Allows configuration of context & timestamps.
4. Includes API for directly logging Error objects, with option to also handle errors.

## Usage:

Install the package with npm.

```npm install @udawg00/logify```

### Logger


Create logger instance.

```
import createLogifier from "@udawg00/logify";

const logger = createLogifier();
```

The logger can now be used just as console's built-in log functions.

```
logger.debug("This is a debug log"); // This won't show up as the logger's level is set to "info"
logger.info("This is a info log"); // This will show up as the logger's level is set to "info"
logger.warn("This is a warn log"); // This will show up as the logger's level is set to "info""
logger.error("This is a error log"); // This will show up as the logger's level is set to "info"
```

Here are the default options for Logify.
```
const defaultOptions: LogifyOptions: = {
  level: "info", // "debug" | "info" | "warn" | "error"
  withTime: true, // true | false
  logDirName: "debug_logs", // string
  context: undefined, // optional string
}
```

Logify also has some methods that can be used to change configurations of the logger on the fly!

```
logger.setLevel("debug"); // this changes the logger's level to debug
logger.setContext("Test Context"); // This sets the supplied ocntext to the logger instance
logger.overrideContext("Overriden context"); // this returns a new instance of logger with the overridden context, for easy line-level configuration of context
logger.toggleTimestamps() // this toggles the flag indicating if timestamps should be used
```

### Error Logger

```udawg00/logify``` also comes with an error logger, which can be used to directly log Error objects. Optionally, can supply a mapping of expected error names and their respective handler functions. This gives access to the logAndHandle methods. This allows modularizing error handlers together and ensure that only expected errors are received.


```
import { createErrorLogifier } from "@udawg00/logify";

const errorLogger
const errorHandler = createErrorLogifier({
  // optional handler mapping
  CustomErrorA: (err: CustomErrorA) => errorAHandler(err),
  CustomErrorB: (err: CustomErrorB) => err.name,
});
```

The error logger can be used to log errors to the console, or to a logfile.

```
errorlogger.logError(errorA as CustomErrorA);
errorLogger.logErrorToFile(err as Error);
```

Error names that were included in the handler mapping can also be handled as shown below.

```
const result1 = errorHandler.logAndHandleError(new CustomErrorA("Test Error A")); // result1 will be typed as unknown, as the compiler can't confirm that the error supplied is mapped in the handler

const result2 = errorHandler.logAndHandleError<"CustomErrorB">(new CustomErrorB("Test Error B")); // result2 will be typed as string, since the handler function of the error name supplied as type hint returns a string
```


### Function/Method Inspection

```@udawg00/logify``` comes with some useful functions (mainly for JavaScript) that allows you to inspect a function as it is being called. This includes arg types and return types (primitive and detailed). This gives great visibility into the function/method call, allowing for easier error identification.

```
import { insepctFn } from "@udawg00/logify";

function add (num1, num2) {
  return num1+num2;
}

const result1 = insepctFn(add, 5, 6);
const result2 = insepctFnInDetail(add, "5", "6");
const result3 = insepctFnInDetail(add, 5, 6);
```

Here's the output of the above code block.

```
[2025-01-12 16:56:03] <ctx: InspectionAction> [DEBUG] [FnInspection] add <number, number> => {
  result: 11,
} <object>
[2025-01-12 16:56:03] <ctx: InspectionAction> [DEBUG] [FnInspection] add <string, string> => {
  result: 56,
} <{
  result: string,
}>
[2025-01-12 16:56:03] <ctx: InspectionAction> [DEBUG] [FnInspection] add <number, number> => {
  result: 11,
} <{
  result: number,
}>
```

For methods of instance objects, a similar functionality can be achieved by using inspectMethod & inspectMethodInDetail.

Further, all of these functions have asynchronous versions as well.

### Type Logging

There are some useful functions that ```@udawg00/logify``` comes with that allows you to log proper JSON objects and their detailed types. Usually, JSON objects don't get logged properly in the terminal, so this is a handy workaround. Actual JSON objects can be stringified with the getFormattedJSON and the JSON detailed types can be returned with the getFormattedJSONTypes.


**Any feedback is welcome!**


