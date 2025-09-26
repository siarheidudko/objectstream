import { describe, it } from "node:test";
import { Parser } from "../../src/index";

describe("Parser: Event handling:", function () {
  it("should handle data event correctly", async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("data", (data: any) => {
        if (data.test === true) res();
        else rej("Data event not triggered correctly");
      });
    });
    parser.write('{"test":true}');
    await p;
    parser.end();
  });

  it("should handle finish event", async () => {
    const parser = new Parser();
    const p = new Promise<void>((res) => {
      parser.once("finish", () => {
        res();
      });
    });
    parser.end();
    await p;
  });

  it("should handle end event", async () => {
    const parser = new Parser();
    const p = new Promise<void>((res) => {
      parser.once("end", () => {
        res();
      });
    });
    parser.end();
    await p;
  });
});
