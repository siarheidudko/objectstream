"use strict";
require("mocha");
const Lodash = require("lodash");
const ObjectStream = require("../../lib/index.js");
const object = require("../utils/object.json");

const start = "[",
  sep = ",",
  end = "]";

describe("Performance:", function () {
  this.timeout(30000);
  it("performance", async () => {
    let nstring = start;
    let rstring = "";
    const parser = new ObjectStream.Parser(start, sep, end);
    const parser2 = new ObjectStream.Parser(start, sep, end);
    const stringifer = new ObjectStream.Stringifer(start, sep, end);
    const stringifer2 = new ObjectStream.Stringifer(start, sep, end);
    let errcount = 0;
    let time1, time2, time3, time4, str;
    let s = true;
    const p = new Promise((res, rej) => {
      stringifer
        .on("data", function (d) {
          time1 = Date.now();
        })
        .on("error", function () {
          errcount++;
        })
        .pipe(
          parser.on("data", function (d) {
            time2 = Date.now();
            if (time2 - time1 > 2000) s = false;
          })
        )
        .on("error", function () {
          errcount++;
        })
        .pipe(
          stringifer2.on("data", function (d) {
            time3 = Date.now();
            if (time3 - time2 > 2000) s = false;
          })
        )
        .on("error", function () {
          errcount++;
        })
        .pipe(
          parser2.on("data", function (d) {
            time4 = Date.now();
            if (time4 - time3 > 2000) s = false;
          })
        )
        .on("error", function () {
          errcount++;
        })
        .on("end", function () {
          if (errcount === 0 && s === true) res();
          else rej("Error");
        });
    });
    for (let i = 0; i < 10; i++) stringifer.write(object);
    stringifer.end();
    await p;
  });
});
