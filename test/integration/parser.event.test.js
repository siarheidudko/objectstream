"use strict";
const { describe, it } = require("node:test");
const ObjectStream = require("../../lib/index.js");

describe("Parser Events:", function () {
  it('parser.on("data", (e) => {})', async () => {
    const parser = new ObjectStream.Parser();
    const actionError = new Promise((res, rej) => {
      parser.once("error", (e) => {
        rej("action error" + JSON.stringify(e));
      });
    });
    const actionData = new Promise((res, rej) => {
      parser.once("data", (e) => {
        res("action data");
      });
    });
    const actionFinish = new Promise((res, rej) => {
      parser.once("finish", () => {
        rej("action finish");
      });
    });
    const actionEnd = new Promise((res, rej) => {
      parser.once("end", () => {
        rej("action end");
      });
    });
    parser.write('{"a":1}');
    await Promise.race([actionData, actionError, actionFinish, actionEnd]);
    parser.end();
  });
  it('parser.on("error", (e) => {})', async () => {
    const parser = new ObjectStream.Parser();
    const actionError = new Promise((res, rej) => {
      parser.once("error", (e) => {
        res("action error");
      });
    });
    const actionData = new Promise((res, rej) => {
      parser.once("data", (e) => {
        rej("action data");
      });
    });
    const actionFinish = new Promise((res, rej) => {
      parser.once("finish", () => {
        rej("action finish");
      });
    });
    const actionEnd = new Promise((res, rej) => {
      parser.once("end", () => {
        rej("action end");
      });
    });
    parser.write("}");
    await Promise.race([actionData, actionError, actionFinish, actionEnd]);
    parser.end();
  });
  it('finish.on("error", () => {})', async () => {
    const parser = new ObjectStream.Parser();
    parser.on("data", () => {});
    const actionError = new Promise((res, rej) => {
      parser.once("error", (e) => {
        rej("action error");
      });
    });
    const actionFinish = new Promise((res, rej) => {
      parser.once("finish", () => {
        res("action finish");
      });
    });
    parser.end();
    await Promise.race([actionError, actionFinish]);
  });
  it('parser.on("end", () => {})', async () => {
    const parser = new ObjectStream.Parser();
    parser.on("data", () => {});
    const actionError = new Promise((res, rej) => {
      parser.once("error", (e) => {
        rej("action error");
      });
    });
    const actionEnd = new Promise((res, rej) => {
      parser.once("end", () => {
        res("action end");
      });
    });
    parser.end();
    await Promise.race([actionError, actionEnd]);
  });
  it('parser.on("end", () => {}), write null', async () => {
    const parser = new ObjectStream.Parser();
    parser.on("data", () => {});
    const actionError = new Promise((res, rej) => {
      parser.once("error", (e) => {
        console.log(e);
        rej("action error");
      });
    });
    const actionEnd = new Promise((res, rej) => {
      parser.once("end", () => {
        res("action end");
      });
    });
    parser.push(null);
    await Promise.race([actionError, actionEnd]);
  });
});
