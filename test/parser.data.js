"use strict"

require('mocha');
const Lodash = require('lodash');
let ObjectStream = require('../index.js');
let mycompare = function(bool, done){
	if(bool){
		done();
	} else {
		done(new Error('Test failed!'));
	}
}

describe('Parser: Invalid data type test_1:', function() {
	let parser = new ObjectStream.Parser();
	it('err[0].message === "Incoming data type is number, require data type is String!"', function(done){
		parser.once('error', function(err){
			mycompare(err[0].message === 'Incoming data type is number, require data type is String!', done);
		});
		parser.write(1);
	});
});

describe('Parser: Invalid data type test_2:', function() {
	let parser = new ObjectStream.Parser();
	it('err[0].message === "Unexpected end of JSON input"', function(done){
		parser.once('error', function(err){
			mycompare(err[0].message === 'Unexpected end of JSON input', done);
		});
		parser.end('{"a":1');
	});
});

describe('Parser: Invalid data type test_3:', function() {
	let parser = new ObjectStream.Parser();
	it('err[0].message === "Unexpected token t in JSON at position 0"', function(done){
		parser.once('error', function(err){
			mycompare(err[0].message === 'Unexpected token t in JSON at position 0', done);
		});
		parser.write(Buffer.from('t'));
	});
});

describe('Parser: Invalid data type test_4:', function() {
	let parser = new ObjectStream.Parser();
	it('err[0].message === "Unexpected token u in JSON at position 12"', function(done){
		parser.once('error', function(err){
			mycompare(err[0].message === 'Unexpected token u in JSON at position 12', done);
		});
		parser.write(Buffer.from('{"a":1,"c":function(){}}'));
	});
});

describe('Parser: Invalid data type test_5:', function() {
	let parser = new ObjectStream.Parser();
	it('err[0].message === "Unexpected token d in JSON at position 1"', function(done){
		parser.once('error', function(err){
			mycompare(err[0].message === 'Unexpected token d in JSON at position 1', done);
		});
		parser.write(Buffer.from("{d:}"));
	});
});

describe('Parser: Valid data type test_1:', function() {
	let parser = new ObjectStream.Parser();
	it('data === "{"w":1}"', function(done){
		parser.once('data', function(data){
			mycompare(Lodash.isEqual(data, {"w":1}), done);
		});
		parser.write('{"w":1}');
	});
});

describe('Parser: Valid data type test_2:', function() {
	let parser = new ObjectStream.Parser();
	it('data === "{"w":1,"c":{"k":true,"l":"t"}}"', function(done){
		parser.once('data', function(data){
			mycompare(Lodash.isEqual(data, {"w":1,"c":{"k":true,"l":"t"}}), done);
		});
		parser.write('{"w":1,"c":{"k":true,"l":"t"}}');
	});
});

describe('Parser: Valid data type test_3:', function() {
	let parser = new ObjectStream.Parser();
	it('data === "{"w":1,"c":{"k":true,"l":"t"}}"', function(done){
		parser.once('finish', function(data){
			mycompare(typeof(data) === 'undefined', done);
		});
		parser.end();
	});
});

describe('Parser: Valid data type test_4:', function() {
	let parser = new ObjectStream.Parser();
	it('data === "{"w":1,"c":{"k":true,"l":["1",2,"4",true]}}"', function(done){
		parser.once('data', function(data){
			mycompare(Lodash.isEqual(data, {"w":1,"c":{"k":true,"l":["1",2,"4",true]}}), done);
		});
		parser.write('{"w":1,"c":{"k":true,"l":["1",2,"4",true]}}');
	});
});

describe('Parser: Valid data type test_5:', function() {
	let parser = new ObjectStream.Parser();
	it('data === "{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\\b\\t\\n\\f\\r\\u0000\\u000b","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}"', function(done){
		parser.once('data', function(data){
			mycompare(Lodash.isEqual(data, {
				number: 1234567890,
				string_en: "abcdefghijklmnopqrstuvwxyz",
				string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
				string_ascii: "\b\t\n\f\r\0\v",
				bool: true,
				array: ["a", 1, true],
				object: {a:"a", "b":1, c:true}
			}), done);
		});
		parser.write('{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\b\t\n\f\r\0\v","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}');
	});
});