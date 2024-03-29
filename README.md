﻿# @sergdudko/objectstream

Revolutionize Your JSON Handling with Streamlined Efficiency: Seamlessly Convert JSON from String or Transform JSON to Drain with this Powerful Stream Creation Tool. Harness the Power of Object Streams for Swift and Seamless Data Processing!

[![npm](https://img.shields.io/npm/v/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![npm](https://img.shields.io/npm/dy/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![NpmLicense](https://img.shields.io/npm/l/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
![GitHub last commit](https://img.shields.io/github/last-commit/siarheidudko/objectstream.svg)
![GitHub release](https://img.shields.io/github/release/siarheidudko/objectstream.svg)

- Based on native methods of NodeJS

## INSTALL

```bash
 npm i @sergdudko/objectstream --save
```

## DOCS

[See docs](https://siarheidudko.github.io/objectstream/index.html)

## SUPPORTED ENCODING

| Stream     | incoming stream                   | outgoing stream                   |
| ---------- | --------------------------------- | --------------------------------- |
| Stringifer | utf8 (object mode)                | utf8, base64, latin1, binary, hex |
| Parser     | utf8, base64, latin1, binary, hex | utf8 (object mode)                |

## USE

```js
// REQUIRE OR IMPORT CLASS

const Stringifer = require("@sergdudko/objectstream").Stringifer;
const Parser = require("@sergdudko/objectstream").Parser;
// or use import
import { Stringifer, Parser } from "@sergdudko/objectstream";

// CREATE STREAM

const firstSeparator = "[";
const middleSeparator = ",";
const endSeparator = "]";
const stringToObject = new Parser(
  firstSeparator,
  middleSeparator,
  endSeparator
);
const objectToString = new Stringifer(
  firstSeparator,
  middleSeparator,
  endSeparator
);

// EVENTS

stringToObject.on("data", (e) => {
  // e - is Object
});
stringToObject.on("error", (d) => {
  // e - Array of Error
});
stringToObject.on("end", () => {
  // end event
});
stringToObject.on("finish", () => {
  // finish event
});
objectToString.on("data", (e) => {
  // e - is Buffer (deault, if you need a string use setEncoding)
});
objectToString.on("error", (d) => {
  // e - Array of Error
});
objectToString.on("end", () => {
  // end event
});
objectToString.on("finish", () => {
  // finish event
});

// CHANGE ENCODING

stringToObject.setEncoding("latin1");
objectToString.setEncoding("latin1");

// WRITE DATA (example for utf8)

stringToObject.write('{"boolean":true}');
objectToString.write({ boolean: true });

// PIPE

stringToObject.pipe(objectToString);
```

## EXAMPLE

[see test directory](https://github.com/siarheidudko/objectstream/tree/master/test)

## OLDER VERSIONS

- [v2.0.5](https://www.npmjs.com/package/@sergdudko/objectstream/v/2.0.5) - supported Node 8

## LICENSE

MIT
