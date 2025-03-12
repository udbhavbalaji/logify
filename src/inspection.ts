import { getFormattedJSONTypes, getFormattedJSON } from "./utils";
import createLogifier from "./logify";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type MethodNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type MethodArgs<T, K extends MethodNames<T>> = T[K] extends (
  ...args: infer P
) => any
  ? P
  : never;

type MethodInspectionResult<T, K extends MethodNames<T>> =
  | ReturnType<T[K] extends (...args: any[]) => any ? T[K] : never>
  | undefined;

type FnInspectionResult<T extends (...args: any[]) => any> =
  | ReturnType<T>
  | undefined;

const getDetailedTypes = (
  result: any,
  args: any[],
): { finalArgTypes: string; finalReturnType: string } => {
  const finalArgTypes = args
    .map((arg) => {
      if (typeof arg === "object") {
        return getFormattedJSONTypes(arg);
      } else {
        return typeof arg;
      }
    })
    .join(", ");
  const returnType = typeof result;

  const finalReturnType =
    returnType === "object" ? getFormattedJSONTypes(result) : returnType;

  return { finalReturnType, finalArgTypes };
};

const logger = createLogifier({ level: "debug", context: "InspectionAction" });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INSPECTION FUNCTIONS (Exported)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const inspectFn = <T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): FnInspectionResult<T> => {
  try {
    const result = func(...args);
    const argTypes = args.map((arg) => typeof arg).join(", ");
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const message = `[FnInspection] ${func.name} <${argTypes}> => ${finalResult} <${returnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectFnAsync = async <T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): Promise<FnInspectionResult<T>> => {
  try {
    const result = await func(...args);
    const argTypes = args.map((arg) => typeof arg).join(", ");
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const message = `[FnInspection] ${func.name} <${argTypes}> => ${finalResult} <${returnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectFnInDetail = <T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): FnInspectionResult<T> => {
  try {
    const result = func(...args);
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const { finalReturnType, finalArgTypes } = getDetailedTypes(result, args);

    const message = `[FnInspection] ${func.name} <${finalArgTypes}> => ${finalResult} <${finalReturnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectFnAsyncInDetail = async <T extends (...args: any[]) => any>(
  func: T,
  ...args: Parameters<T>
): Promise<FnInspectionResult<T>> => {
  try {
    const result = await func(...args);
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const { finalReturnType, finalArgTypes } = getDetailedTypes(result, args);

    const message = `[FnInspection] ${func.name} <${finalArgTypes}> => ${finalResult} <${finalReturnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectMethod = <T, K extends MethodNames<T>>(
  instance: T,
  method: K,
  ...args: MethodArgs<T, K>
): MethodInspectionResult<T, K> => {
  try {
    const result = (instance[method] as Function).apply(instance, args);

    const argTypes = args.map((arg) => typeof arg).join(", ");
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const message = `[MethodInspection] ${method as string} <${argTypes}> => ${finalResult} <${returnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectMethodAsync = async <T, K extends MethodNames<T>>(
  instance: T,
  method: K,
  ...args: MethodArgs<T, K>
): Promise<MethodInspectionResult<T, K>> => {
  try {
    const result = await (instance[method] as Function).apply(instance, args);

    const argTypes = args.map((arg) => typeof arg).join(", ");
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const message = `[MethodInspection] ${method as string} <${argTypes}> => ${finalResult} <${returnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectMethodInDetail = <T, K extends MethodNames<T>>(
  instance: T,
  method: K,
  ...args: MethodArgs<T, K>
): MethodInspectionResult<T, K> => {
  try {
    const result = (instance[method] as Function).apply(instance, args);
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const { finalReturnType, finalArgTypes } = getDetailedTypes(result, args);

    const message = `[MethodInspection] ${method as string} <${finalArgTypes}> => ${finalResult} <${finalReturnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};

const inspectMethodAsyncInDetail = async <T, K extends MethodNames<T>>(
  instance: T,
  method: K,
  ...args: MethodArgs<T, K>
): Promise<MethodInspectionResult<T, K>> => {
  try {
    const result = await (instance[method] as Function).apply(instance, args);
    const returnType = typeof result;

    const finalResult =
      returnType === "object"
        ? getFormattedJSON(result)
        : returnType === "string"
          ? `"${result}"`
          : result;

    const { finalReturnType, finalArgTypes } = getDetailedTypes(result, args);

    const message = `[MethodInspection] ${method as string} <${finalArgTypes}> => ${finalResult} <${finalReturnType}>`;

    logger.debug(message);

    return result;
  } catch (err) {
    logger.error((err as Error).message, (err as Error).stack);
  }
};
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EXPORTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export {
  inspectFn,
  inspectFnAsync,
  inspectFnInDetail,
  inspectFnAsyncInDetail,
  inspectMethod,
  inspectMethodAsync,
  inspectMethodInDetail,
  inspectMethodAsyncInDetail,
};
