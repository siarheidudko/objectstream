import { Transform } from "stream";
import { validator } from "../utils/global";

/**
 * @class Stringifer
 *
 * Сreates an instance of Stringifer (Json to String conversion stream)
 */
export class Stringifer extends Transform {
  /**
   *
   * @param start - first separator
   * @param middle - middle separator
   * @param end - end separator
   */
  constructor(start?: string, middle?: string, end?: string) {
    super({ highWaterMark: 64 * 1024, objectMode: true });
    if (
      typeof start !== "undefined" &&
      (typeof start !== "string" ||
        Buffer.byteLength(start) > 1 ||
        start.match(/["{}]/))
    )
      throw new Error("Argument start require one byte String!");
    if (
      typeof middle !== "undefined" &&
      (typeof middle !== "string" ||
        Buffer.byteLength(middle) > 1 ||
        middle.match(/["{}]/))
    )
      throw new Error("Argument separator require one byte String!");
    if (
      typeof end !== "undefined" &&
      (typeof end !== "string" ||
        Buffer.byteLength(end) > 1 ||
        end.match(/["{}]/))
    )
      throw new Error("Argument end require one byte String!");
    this.__separators = {
      start: Buffer.from(start ? start : "", "utf8"),
      middle: Buffer.from(middle ? middle : "", "utf8"),
      end: Buffer.from(end ? end : "", "utf8")
    };
    this.__isString = false;
    this.__bytesWrite = 0;
    this.__encoding = "utf8";
    this.setDefaultEncoding(this.__encoding);
  }
  /**
   * separators
   *
   * @private
   */
  private __separators: {
    start: Buffer;
    middle: Buffer;
    end: Buffer;
  };
  /**
   * pass string data to the stream
   *
   * @private
   */
  private __isString: boolean;
  /**
   * stream byte counter
   *
   * @private
   */
  private __bytesWrite: number;
  /**
   * stream encoding
   *
   * @private
   */
  private __encoding: "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex";
  /**
   * Data event handler
   *
   * @private
   * @param object - object data
   * @param encoding - stream encoding
   * @param callback - callback function
   */
  // eslint-disable-next-line
  public _transform(
    object: { [key: string]: any } | null | undefined,
    // eslint-disable-next-line
    encoding = this.__encoding as BufferEncoding,
    callback: Function = () => {
      return;
    }
  ) {
    if (typeof object === "undefined") {
      callback();
      return;
    }
    if (object === null) {
      this._final(() => {
        callback();
      });
      return;
    }
    switch (typeof object) {
      case "object":
        try {
          if (validator(object, false) !== true) {
            callback([
              new Error(
                "Validation failed, incoming data type is not pure Object!"
              )
            ]);
            return;
          }
          let _buffer: Buffer = Buffer.from(JSON.stringify(object), "utf8");
          if (this.__bytesWrite === 0) {
            _buffer = Buffer.concat([this.__separators.start, _buffer]);
          } else {
            _buffer = Buffer.concat([this.__separators.middle, _buffer]);
          }
          if (this.__isString) this.push(_buffer.toString(this.__encoding));
          else this.push(_buffer, this.__encoding);
          this.__bytesWrite += Buffer.byteLength(_buffer);
          callback();
          return;
        } catch (err) {
          callback([err]);
          return;
        }
      case "undefined":
        callback();
        return;
      default:
        callback([
          new Error(
            "Incoming data type is " +
            typeof object +
            ", require data type is pure Object!"
          )
        ]);
        return;
    }
  }
  /**
   * Flush event handler
   *
   * @private
   * @param callback - callback function
   */
  public _flush(
    callback = () => {
      return;
    }
  ) {
    callback();
  }
  /**
   * End event handler
   *
   * @private
   * @param callback - callback function
   */
  public _final(
    callback = () => {
      return;
    }
  ) {
    if (this.__bytesWrite === 0) {
      const _buffer: Buffer = Buffer.concat([
        this.__separators.start,
        this.__separators.end
      ]);
      if (this.__isString) this.push(_buffer.toString(this.__encoding));
      else this.push(_buffer, this.__encoding);
    } else {
      if (this.__isString)
        this.push(this.__separators.end.toString(this.__encoding));
      else this.push(this.__separators.end, this.__encoding);
    }
    this.__bytesWrite += Buffer.byteLength(this.__separators.end);
    callback();
  }
  /**
   * set stream encoding
   */
  public setEncoding(
    encoding: "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex"
  ) {
    this.__encoding = encoding;
    this.setDefaultEncoding(this.__encoding);
    this.__isString = true;
    return this;
  }
}
