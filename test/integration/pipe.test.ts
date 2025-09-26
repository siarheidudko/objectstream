import { describe, it } from "node:test";
import { Parser, Stringifer } from "../../src/index";

const start = "[",
  sep = ",",
  end = "]";

const object = {
  number: 1234567890,
  string_en: "abcdefghijklmnopqrstuvwxyz",
  string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
  string_ascii: "\b\t\n\f\r\0\v",
  bool: true,
  array: ["a", 1, true],
  object: { a: "a", b: 1, c: true },
  object2: {
    array: [
      {
        number: 1,
        null: null,
      },
    ],
  },
};
const string = JSON.stringify(object);
const buffer = Buffer.from(string);

describe("Pipe one byte:", function () {
  const encodings: Array<
    "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex"
  > = ["utf8", "utf-8", "base64", "latin1", "binary", "hex"];
  const iterations = 10000;

  for (const encoding of encodings) {
    it(encoding + " without errors", async () => {
      let nstring: Buffer[] = [Buffer.from(start)];
      let rstring: Buffer[] = [Buffer.from("")];

      const parser = new Parser(start, sep, end);
      const parser2 = new Parser(start, sep, end);
      const stringifer = new Stringifer(start, sep, end);
      const stringifer2 = new Stringifer(start, sep, end).setEncoding(encoding);

      let errcount = 0;

      const p = new Promise<void>((res, rej) => {
        stringifer2.on("end", function (data?: any) {
          if (data) rstring.push(Buffer.from(data, encoding));
          const r = Buffer.concat(rstring);
          const n = Buffer.concat(nstring);
          if (r.equals(n) && errcount === 0) res();
          else rej("Not Equal");
        });
      });

      stringifer2.on("data", function (data: string) {
        if (data) rstring.push(Buffer.from(data, encoding));
      });

      parser
        .on("error", () => {
          errcount++;
        })
        .pipe(stringifer)
        .on("error", () => {
          errcount++;
        })
        .pipe(parser2)
        .on("error", () => {
          errcount++;
        })
        .pipe(stringifer2)
        .on("error", () => {
          errcount++;
        });

      for (let i = 0; i < iterations; i++) {
        for (let j = 0; j < Buffer.byteLength(buffer); j++)
          parser.write(buffer.slice(j, j + 1));
        if (i !== 0) nstring.push(Buffer.from(sep));
        nstring.push(Buffer.from(string));
      }
      nstring.push(Buffer.from(end));
      parser.end();
      await p;
    });

    if (Number.parseInt(process.versions["node"].substr(0, 2)) <= 12)
      it(encoding + " with errors", async () => {
        let nstring: Buffer[] = [Buffer.from(start)];
        let rstring: Buffer[] = [Buffer.from("")];

        const parser = new Parser(start, sep, end);
        const parser2 = new Parser(start, sep, end);
        const stringifer = new Stringifer(start, sep, end);
        const stringifer2 = new Stringifer(start, sep, end).setEncoding(
          encoding
        );

        let errcount = 0;

        const p = new Promise<void>((res, rej) => {
          stringifer2.on("end", (data?: any) => {
            if (data) rstring.push(Buffer.from(data, encoding));
            const r = Buffer.concat(rstring);
            const n = Buffer.concat(nstring);
            if (r.equals(n) && errcount === iterations) res();
            else rej("Not Equal");
          });
        });

        stringifer2.on("data", (data: string) => {
          if (data) rstring.push(Buffer.from(data, encoding));
        });

        parser
          .on("error", () => {
            errcount++;
          })
          .pipe(stringifer)
          .on("error", () => {
            errcount++;
          })
          .pipe(parser2)
          .on("error", () => {
            errcount++;
          })
          .pipe(stringifer2)
          .on("error", () => {
            errcount++;
          });

        for (let i = 0; i < iterations; i++) {
          for (let j = 0; j < Buffer.byteLength(buffer); j++)
            parser.write(buffer.slice(j, j + 1));
          if (i !== 0) nstring.push(Buffer.from(sep));
          nstring.push(Buffer.from(string));
          parser.write(Buffer.from("foo"));
        }
        nstring.push(Buffer.from(end));
        parser.end();
        await p;
      });
  }
});

describe("Pipe with different encodings:", function () {
  const encodings: Array<
    "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex"
  > = ["utf8", "utf-8", "base64", "latin1", "binary", "hex"];
  const iterations = 10000;

  for (const encoding of encodings) {
    it(encoding + " without errors", async () => {
      let nstring: Buffer[] = [Buffer.from(start)];
      let rstring: Buffer[] = [Buffer.from("")];

      const parser = new Parser(start, sep, end).setEncoding(encoding);
      const parser2 = new Parser(start, sep, end);
      const stringifer = new Stringifer(start, sep, end);
      const stringifer2 = new Stringifer(start, sep, end).setEncoding(encoding);

      let errcount = 0;

      const p = new Promise<void>((res, rej) => {
        stringifer2.on("end", function (data?: any) {
          if (data) rstring.push(Buffer.from(data, encoding));
          const r = Buffer.concat(rstring);
          const n = Buffer.concat(nstring);
          if (r.equals(n) && errcount === 0) res();
          else rej("Not Equal");
        });
      });

      stringifer2.on("data", function (data: string) {
        if (data) rstring.push(Buffer.from(data, encoding));
      });

      parser
        .on("error", () => {
          errcount++;
        })
        .pipe(stringifer)
        .on("error", () => {
          errcount++;
        })
        .pipe(parser2)
        .on("error", () => {
          errcount++;
        })
        .pipe(stringifer2)
        .on("error", () => {
          errcount++;
        });

      for (let i = 0; i < iterations; i++) {
        parser.write(buffer.toString(encoding));
        if (i !== 0) nstring.push(Buffer.from(sep));
        nstring.push(buffer);
      }
      nstring.push(Buffer.from(end));
      parser.end();
      await p;
    });

    if (Number.parseInt(process.versions["node"].substr(0, 2)) <= 12)
      it(encoding + " with errors", async () => {
        let nstring: Buffer[] = [Buffer.from(start)];
        let rstring: Buffer[] = [Buffer.from("")];

        const parser = new Parser(start, sep, end).setEncoding(encoding);
        const parser2 = new Parser(start, sep, end);
        const stringifer = new Stringifer(start, sep, end);
        const stringifer2 = new Stringifer(start, sep, end).setEncoding(
          encoding
        );

        let errcount = 0;

        const p = new Promise<void>((res, rej) => {
          stringifer2.on("end", (data?: any) => {
            if (data) rstring.push(Buffer.from(data, encoding));
            const r = Buffer.concat(rstring);
            const n = Buffer.concat(nstring);
            if (r.equals(n) && errcount === iterations) res();
            else rej("Not Equal");
          });
        });

        stringifer2.on("data", (data: string) => {
          if (data) rstring.push(Buffer.from(data, encoding));
        });

        parser
          .on("error", () => {
            errcount++;
          })
          .pipe(stringifer)
          .on("error", () => {
            errcount++;
          })
          .pipe(parser2)
          .on("error", () => {
            errcount++;
          })
          .pipe(stringifer2)
          .on("error", () => {
            errcount++;
          });

        for (let i = 0; i < iterations; i++) {
          parser.write(buffer.toString(encoding));
          if (i !== 0) nstring.push(Buffer.from(sep));
          nstring.push(buffer);
          parser.write(Buffer.from("foo"));
        }
        nstring.push(Buffer.from(end));
        parser.end();
        await p;
      });
  }
});
