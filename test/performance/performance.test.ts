import { describe, it } from "node:test";
import { Parser, Stringifer } from "../../src/index";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const object = JSON.parse(
  readFileSync(resolve(__dirname, "../utils/object.json"), "utf8")
);

const start = "[",
  sep = ",",
  end = "]";

describe("Performance:", function () {
  it("performance", async () => {
    const parser = new Parser(start, sep, end);
    const parser2 = new Parser(start, sep, end);
    const stringifer = new Stringifer(start, sep, end);
    const stringifer2 = new Stringifer(start, sep, end);

    let errcount = 0;
    let time1: number, time2: number, time3: number, time4: number;
    let s = true;

    const p = new Promise<void>((res, rej) => {
      stringifer
        .on("data", function (d: Buffer) {
          time1 = Date.now();
        })
        .on("error", function () {
          errcount += 1;
        })
        .pipe(
          parser.on("data", function (d: any) {
            time2 = Date.now();
            if (time2 - time1 > 2000) s = false;
          })
        )
        .on("error", function () {
          errcount += 1;
        })
        .pipe(
          stringifer2.on("data", function (d: Buffer) {
            time3 = Date.now();
            if (time3 - time2 > 2000) s = false;
          })
        )
        .on("error", function () {
          errcount += 1;
        })
        .pipe(
          parser2.on("data", function (d: any) {
            time4 = Date.now();
            if (time4 - time3 > 2000) s = false;
          })
        )
        .on("error", function () {
          errcount += 1;
        })
        .on("end", function () {
          if (errcount === 0 && s === true) res();
          else rej("Error");
        });
    });

    for (let i = 0; i < 10; i += 1) stringifer.write(object);
    stringifer.end();
    await p;
  });
});
