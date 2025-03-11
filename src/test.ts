type ReturnTypes =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | void;
class LogErr<
  Mapping extends Record<
    string,
    <T extends ReturnTypes = ReturnTypes>(err: Error) => T
  >,
> {
  private handlers: Mapping;

  constructor(handlers: Mapping) {
    this.handlers = handlers;
  }

  // private handleError<E extends Error & { name: keyof Mapping }>(err: E) {
  //   const handler = this.handlers[err.name];
  //   if (!handler) throw new Error("No handler");
  //   return handler(err);
  // }

  logAndHandleError<E extends Error & { name: keyof Mapping }>(err: E) {
    const handler = this.handlers[err.name];
    if (!handler) throw new Error("No handler");
    return handler(err);
  }
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
});
