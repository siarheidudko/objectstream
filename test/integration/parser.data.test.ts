import { describe, it } from "node:test";
import { Parser } from "../../src/index";
import { deepEqual } from "node:assert";

describe("Parser: Invalid data type:", function () {
  it('err[0].message === "Incoming data type is number, require data type is String!"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("error", (err: Error[]) => {
        if (err[0].message) res();
        else rej(err[0]);
      });
    });
    parser.write(1 as any);
    await p;
    parser.end();
  });

  it('err[0].message === "Unexpected end of JSON input"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("error", (err: Error[]) => {
        if (err[0].message) res();
        else rej(err[0]);
      });
    });
    parser.end('{"a":1');
    await p;
    parser.end();
  });

  it('err[0].message === "Unexpected token t in JSON at position 0"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("error", (err: Error[]) => {
        if (err[0].message) res();
        else rej(err[0]);
      });
    });
    parser.write(Buffer.from("t"));
    await p;
    parser.end();
  });

  it('err[0].message === "Unexpected token u in JSON at position 12"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("error", (err: Error[]) => {
        if (err[0].message) res();
        else rej(err[0]);
      });
    });
    parser.write(Buffer.from('{"a":1,"c":function(){}}'));
    await p;
    parser.end();
  });

  it('err[0].message === "Unexpected token d in JSON at position 1"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("error", (err: Error[]) => {
        if (err[0].message) res();
        else rej(err[0]);
      });
    });
    parser.write(Buffer.from("{d:}"));
    await p;
    parser.end();
  });
});

describe("Parser: Valid data type:", function () {
  it('data === "{"w":1}"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("data", (data: { w: number }) => {
        deepEqual(data, { w: 1 }, "Not Equal");
        res();
      });
    });
    parser.write('{"w":1}');
    await p;
    parser.end();
  });

  it('data === "{"w":1,"c":{"k":true,"l":"t","d":null}}"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once(
        "data",
        (data: { w: number; c: { k: boolean; l: string; d: null } }) => {
          deepEqual(
            data,
            { w: 1, c: { k: true, l: "t", d: null } },
            "Not Equal"
          );
          res();
        }
      );
    });
    parser.write('{"w":1,"c":{"k":true,"l":"t","d":null}}');
    await p;
    parser.end();
  });

  it('data === "undefined"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("finish", function (data: any) {
        if (typeof data === "undefined") res();
        else rej("Not Equal");
      });
    });
    parser.end();
    await p;
  });

  it('data === "{"w":1,"c":{"k":true,"l":["1",2,"4",true]}}"', async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once(
        "data",
        function (data: {
          w: number;
          c: { k: boolean; l: (string | number | boolean)[] };
        }) {
          deepEqual(
            data,
            { w: 1, c: { k: true, l: ["1", 2, "4", true] } },
            "Not Equal"
          );
          res();
        }
      );
    });
    parser.write('{"w":1,"c":{"k":true,"l":["1",2,"4",true]}}');
    await p;
    parser.end();
  });

  it("Complex data test", async () => {
    const parser = new Parser();
    const p = new Promise<void>((res, rej) => {
      parser.once("data", (data: any) => {
        deepEqual(
          data,
          {
            number: 1234567890,
            string_en: "abcdefghijklmnopqrstuvwxyz",
            string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
            string_ascii: "\b\t\n\f\r\0\v",
            bool: true,
            array: ["a", 1, true],
            object: { a: "a", b: 1, c: true },
          },
          "Not Equal"
        );
        res();
      });
    });
    parser.write(
      '{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\b\t\n\f\r\0\v","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}'
    );
    await p;
    parser.end();
  });
});
