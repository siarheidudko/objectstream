import { describe, it } from "node:test";
import { Stringifer } from "../../src/index";

describe("Stringifer: Event handling:", function () {
  it("should handle data event correctly", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: Buffer) => {
        if (data.toString() === '{"test":true}') res();
        else rej("Data event not triggered correctly");
      });
    });
    stringifer.write({ test: true });
    await p;
    stringifer.end();
  });

  it("should handle finish event", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res) => {
      stringifer.once("finish", () => {
        res();
      });
    });
    stringifer.end();
    await p;
  });

  it("should handle readable event", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res) => {
      stringifer.once("readable", () => {
        res();
      });
    });
    stringifer.write({ test: true });
    stringifer.end();
    await p;
  });
});
