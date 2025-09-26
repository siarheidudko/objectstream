# @sergdudko/objectstream

A powerful and efficient Node.js library for streaming JSON processing. Transform JSON strings to objects and objects to JSON strings with support for custom separators, multiple encodings, and high-performance streaming operations.

[![npm](https://img.shields.io/npm/v/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![npm](https://img.shields.io/npm/dy/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![NpmLicense](https://img.shields.io/npm/l/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
![GitHub last commit](https://img.shields.io/github/last-commit/siarheidudko/objectstream.svg)
![GitHub release](https://img.shields.io/github/release/siarheidudko/objectstream.svg)

## ✨ Features

- **Dual Package**: Full ES Modules (ESM) and CommonJS (CJS) support
- **TypeScript**: Complete type definitions included
- **High Performance**: Based on native Node.js stream methods
- **Multiple Encodings**: Support for utf8, base64, latin1, binary, and hex
- **Custom Separators**: Configure start, middle, and end separators
- **Memory Efficient**: Streaming approach for large JSON datasets
- **Zero Dependencies**: No external dependencies

## 📦 Installation

```bash
npm install @sergdudko/objectstream
```

## 🚀 Quick Start

### ESM (ES Modules)

```javascript
import { Parser, Stringifer } from '@sergdudko/objectstream';

// String to Object conversion
const parser = new Parser();
parser.on('data', (obj) => {
  console.log('Parsed object:', obj);
});
parser.write('{"name":"John","age":30}');
parser.end();

// Object to String conversion
const stringifer = new Stringifer();
stringifer.on('data', (jsonString) => {
  console.log('JSON string:', jsonString.toString());
});
stringifer.write({ name: 'John', age: 30 });
stringifer.end();
```

### CommonJS

```javascript
const { Parser, Stringifer } = require('@sergdudko/objectstream');

// Or using default export
const objectstream = require('@sergdudko/objectstream');
const { Parser, Stringifer } = objectstream.default;
```

### TypeScript

```typescript
import { Parser, Stringifer } from '@sergdudko/objectstream';

interface User {
  name: string;
  age: number;
}

const parser = new Parser();
parser.on('data', (user: User) => {
  console.log(`User: ${user.name}, Age: ${user.age}`);
});
```

## 📚 API Reference

### Parser Class

Transform stream that converts JSON strings to JavaScript objects.

#### Constructor

```typescript
new Parser(start?: string, middle?: string, end?: string)
```

#### Parameters

- `start` (optional): First separator character (default: none)
- `middle` (optional): Middle separator character (default: none)  
- `end` (optional): End separator character (default: none)

#### Methods

- `setEncoding(encoding)`: Set input encoding (`utf8`, `utf-8`, `base64`, `latin1`, `binary`, `hex`)

#### Events

- `data`: Emitted when an object is parsed
- `error`: Emitted when parsing fails
- `end`: Emitted when stream ends
- `finish`: Emitted when stream finishes

### Stringifer Class

Transform stream that converts JavaScript objects to JSON strings.

#### Constructor

```typescript
new Stringifer(start?: string, middle?: string, end?: string)
```

#### Parameters

- `start` (optional): First separator character (default: none)
- `middle` (optional): Middle separator character (default: none)
- `end` (optional): End separator character (default: none)

#### Methods

- `setEncoding(encoding)`: Set output encoding (`utf8`, `utf-8`, `base64`, `latin1`, `binary`, `hex`)

#### Events

- `data`: Emitted when JSON string is generated
- `error`: Emitted when stringification fails
- `end`: Emitted when stream ends
- `finish`: Emitted when stream finishes

## 💡 Usage Examples

### Basic JSON Processing

```javascript
import { Parser, Stringifer } from '@sergdudko/objectstream';

const parser = new Parser();
const stringifer = new Stringifer();

// Parse JSON string
parser.on('data', (obj) => {
  console.log('Parsed:', obj);
});

parser.write('{"message":"Hello World"}');
parser.end();

// Stringify object
stringifer.on('data', (data) => {
  console.log('Stringified:', data.toString());
});

stringifer.write({ message: 'Hello World' });
stringifer.end();
```

### Custom Separators for JSON Arrays

```javascript
import { Parser, Stringifer } from '@sergdudko/objectstream';

// Process JSON array with custom separators
const parser = new Parser('[', ',', ']');
const stringifer = new Stringifer('[', ',', ']');

stringifer.on('data', (data) => {
  console.log('JSON Array chunk:', data.toString());
});

// Write multiple objects
stringifer.write({ id: 1, name: 'Alice' });
stringifer.write({ id: 2, name: 'Bob' });
stringifer.write({ id: 3, name: 'Charlie' });
stringifer.end(); // Output: [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"},{"id":3,"name":"Charlie"}]
```

### Different Encodings

```javascript
import { Parser, Stringifer } from '@sergdudko/objectstream';

// Base64 encoding
const stringifer = new Stringifer();
stringifer.setEncoding('base64');

stringifer.on('data', (data) => {
  console.log('Base64 JSON:', data); // Base64 encoded JSON string
});

stringifer.write({ encoded: true });
stringifer.end();

// Parse Base64 encoded JSON
const parser = new Parser();
parser.setEncoding('base64');

parser.on('data', (obj) => {
  console.log('Decoded object:', obj);
});

// Write base64 encoded JSON
parser.write(Buffer.from('{"decoded":true}').toString('base64'));
parser.end();
```

### Stream Piping

```javascript
import { Parser, Stringifer } from '@sergdudko/objectstream';
import { Transform } from 'stream';

// Create a processing pipeline
const parser = new Parser();
const processor = new Transform({
  objectMode: true,
  transform(obj, encoding, callback) {
    // Process each object
    obj.processed = true;
    obj.timestamp = Date.now();
    callback(null, obj);
  }
});
const stringifer = new Stringifer();

// Pipe the streams together
parser
  .pipe(processor)
  .pipe(stringifer)
  .on('data', (data) => {
    console.log('Processed JSON:', data.toString());
  });

// Input data
parser.write('{"name":"test"}');
parser.end();
```

### Error Handling

```javascript
import { Parser, Stringifer } from '@sergdudko/objectstream';

const parser = new Parser();

parser.on('data', (obj) => {
  console.log('Valid object:', obj);
});

parser.on('error', (errors) => {
  console.error('Parsing errors:', errors);
});

// Valid JSON
parser.write('{"valid":true}');

// Invalid JSON
parser.write('{"invalid":}');

parser.end();
```

## 🎯 Supported Encodings

| Encoding | Input | Output | Description |
|----------|-------|--------|-------------|
| `utf8` (default) | ✅ | ✅ | Standard UTF-8 text |
| `utf-8` | ✅ | ✅ | Alias for utf8 |
| `base64` | ✅ | ✅ | Base64 encoded data |
| `latin1` | ✅ | ✅ | Latin-1 encoding |
| `binary` | ✅ | ✅ | Binary data encoding |
| `hex` | ✅ | ✅ | Hexadecimal encoding |

## ⚡ Performance

ObjectStream is optimized for high-performance streaming operations:

- **Memory Efficient**: Processes data in chunks, suitable for large JSON files
- **Zero-Copy Operations**: Minimizes memory copying where possible
- **Stream-Based**: Non-blocking operations using Node.js streams
- **Optimized Parsing**: Efficient JSON parsing with error recovery

## 🧪 Testing

The library includes comprehensive TypeScript tests:

```bash
npm test
```

Test coverage includes:

- ✅ Parser functionality with various data types
- ✅ Stringifer functionality with validation
- ✅ Custom separators and encodings
- ✅ Stream piping and event handling
- ✅ Error handling and edge cases
- ✅ Performance benchmarks
- ✅ ESM/CJS compatibility

## 🏗️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build dual package (ESM + CJS)
npm run build

# Lint code
npm run lint
```

## 📄 Package Structure

```
dist/
├── esm/          # ES Modules build
├── cjs/          # CommonJS build
└── types/        # Shared TypeScript definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎯 Version History

- **v3.x**: TypeScript rewrite, dual package support, modern Node.js features
- **v2.x**: Enhanced performance and encoding support
- **v1.x**: Initial release with basic streaming functionality

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📝 **Issues**: [GitHub Issues](https://github.com/siarheidudko/objectstream/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/siarheidudko/objectstream/discussions)
- 📧 **Email**: [siarhei@dudko.dev](mailto:siarhei@dudko.dev)

## 💝 Support This Project

If Redux Cluster helps you build amazing applications, consider supporting its development:

- ☕ **[Buy me a coffee](https://www.buymeacoffee.com/dudko.dev)**
- 💳 **[PayPal](https://paypal.me/dudkodev)**
- 🎯 **[Patreon](https://patreon.com/dudko_dev)**
- 🌐 **[More options](http://dudko.dev/donate)**

Your support helps maintain and improve Redux Cluster for the entire community!

---

**Made with ❤️ by [Siarhei Dudko](https://github.com/siarheidudko)**
