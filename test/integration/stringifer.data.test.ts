import { describe, it } from "node:test";
import { Stringifer } from "../../src/index";

describe("Stringifer: Invalid data type:", function () {
  it('err[0].message === "Incoming data type is number, require data type is pure Object!"', async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("error", function (err: Error[]) {
        if (
          err[0].message ===
          "Incoming data type is number, require data type is pure Object!"
        )
          res();
        else rej(err[0].message);
      });
    });
    stringifer.write(1 as any);
    await p;
    stringifer.end();
  });

  it('err[0].message === "Validation failed, incoming data type is not pure Object!"', async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("error", function (err: Error[]) {
        if (
          err[0].message ===
          "Validation failed, incoming data type is not pure Object!"
        )
          res();
        else rej(err[0].message);
      });
    });
    stringifer.write(Buffer.from("dfdssad") as any);
    await p;
    stringifer.end();
  });

  it("Array validation error", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("error", function (err: Error[]) {
        if (
          err[0].message ===
          "Validation failed, incoming data type is not pure Object!"
        )
          res();
        else rej(err[0].message);
      });
    });
    stringifer.write([1, 2, 3] as any);
    await p;
    stringifer.end();
  });

  it("Buffer object validation error", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("error", function (err: Error[]) {
        if (
          err[0].message ===
          "Validation failed, incoming data type is not pure Object!"
        )
          res();
        else rej(err[0].message);
      });
    });
    stringifer.write({ a: Buffer.from("t") } as any);
    await p;
    stringifer.end();
  });

  it("Function in object validation error", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("error", function (err: Error[]) {
        if (
          err[0].message ===
          "Validation failed, incoming data type is not pure Object!"
        )
          res();
        else rej(err[0].message);
      });
    });
    stringifer.write({ a: { b: { c: 2, d: function () {} } } } as any);
    await p;
    stringifer.end();
  });
});

describe("Stringifer: Valid data type test_1:", function () {
  it('data === "{"w":"fdsfds"}"', async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: Buffer) => {
        if (data.toString() === '{"w":"fdsfds"}') res();
        else rej("Not Equal");
      });
    });
    stringifer.write({ w: "fdsfds" });
    await p;
    stringifer.end();
  });

  it('data === "{"w":1}"', async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: Buffer) => {
        if (data.toString() === '{"w":1}') res();
        else rej("Not Equal");
      });
    });
    stringifer.write({ w: 1 });
    await p;
    stringifer.end();
  });

  it('data === "{"w":1,"c":true}"', async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: Buffer) => {
        if (data.toString() === '{"w":1,"c":true}') res();
        else rej("Not Equal");
      });
    });
    stringifer.write({ w: 1, c: true });
    await p;
    stringifer.end();
  });

  it("Complex object test", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: Buffer) => {
        if (data.toString() === '{"w":1,"c":{"k":true,"l":"t","m":[1,2,3]}}')
          res();
        else rej("Not Equal");
      });
    });
    stringifer.write({ w: 1, c: { k: true, l: "t", m: [1, 2, 3] } });
    await p;
    stringifer.end();
  });

  it("Full complexity test", async () => {
    const stringifer = new Stringifer();
    const p = new Promise<void>((res, rej) => {
      stringifer.once("data", (data: Buffer) => {
        if (
          data.toString() ===
          '{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz"' +
            ',"string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\\b\\t\\n' +
            '\\f\\r\\u0000\\u000b","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}'
        )
          res();
        else rej("Not Equal");
      });
    });
    stringifer.write({
      number: 1234567890,
      string_en: "abcdefghijklmnopqrstuvwxyz",
      string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
      string_ascii: "\b\t\n\f\r\0\v",
      bool: true,
      array: ["a", 1, true],
      object: { a: "a", b: 1, c: true },
    });
    await p;
    stringifer.end();
  });
});
