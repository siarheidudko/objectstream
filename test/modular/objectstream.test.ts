import { describe, it } from "node:test";
import { deepEqual } from "node:assert";
import objectstream, { Parser, Stringifer } from "../../src/index";

describe("Stringifer invalid arguments:", function () {
  it("Invalid start separator", async () => {
    try {
      new Stringifer("б", "", "");
    } catch (err) {
      return;
    }
    throw new Error("error");
  });

  it("Invalid middle separator", async () => {
    try {
      new Stringifer("", "б", "");
    } catch (err) {
      return;
    }
    throw new Error("error");
  });

  it("Invalid end separator", async () => {
    try {
      new Stringifer("", "", "б");
    } catch (err) {
      return;
    }
    throw new Error("error");
  });
});

describe("Parser invalid arguments:", function () {
  it("Invalid start separator", async () => {
    try {
      new Parser("б", "", "");
    } catch (err) {
      return;
    }
    throw new Error("error");
  });

  it("Invalid middle separator", async () => {
    try {
      new Parser("", "б", "");
    } catch (err) {
      return;
    }
    throw new Error("error");
  });

  it("Invalid end separator", async () => {
    try {
      new Parser("", "", "б");
    } catch (err) {
      return;
    }
    throw new Error("error");
  });
});

describe("Set encoding:", function () {
  it("Stringifer", async () => {
    const stringifer = new Stringifer();
    stringifer.setEncoding("latin1");
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: string) => {
        const string = Buffer.from('{"w":"тестовое сообщение"}').toString(
          "latin1"
        );
        if (data === string) res();
        else rej("Not Equal");
      });
    });
    stringifer.write({ w: "тестовое сообщение" });
    await p;
    stringifer.end();
  });

  it("Parser", async () => {
    const parser = new Parser();
    parser.setEncoding("latin1");
    const p = new Promise<void>((res, rej) => {
      parser.once("data", (data: { w: string }) => {
        deepEqual(data, { w: "тестовое сообщениие" }, "Not Equal");
        res();
      });
    });
    parser.write(
      Buffer.from('{"w":"тестовое сообщениие"}', "utf8").toString("latin1")
    );
    await p;
    parser.end();
  });
});

describe("Default export compatibility:", function () {
  it("should work with default export", async () => {
    const stringifer = new objectstream.Stringifer();
    const parser = new objectstream.Parser();

    const p = new Promise<void>((res, rej) => {
      parser.once("data", (data: { test: boolean }) => {
        deepEqual(data, { test: true }, "Not Equal");
        res();
      });
    });

    parser.write('{"test":true}');
    await p;
    parser.end();
    stringifer.end();
  });
});
