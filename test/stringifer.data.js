"use strict"

require('mocha');
let ObjectStream = require('../index.js');
let stringifer = new ObjectStream.Stringifer();
let mycompare = function(bool, done){
	if(bool){
		done();
	} else {
		done(new Error('Test failed!'));
	}
}

describe('Stringifer: Invalid data type test_1:', function() {
	it('err.message === "Incoming data type is number, require data type is pure Object!"', function(done){
		stringifer.once('error', function(err){
			mycompare(err.message === 'Incoming data type is number, require data type is pure Object!', done);
		});
		stringifer.write(1);
	});
});

describe('Stringifer: Invalid data type test_2:', function() {
	it('err.message === "Validation failed, incoming data type is not pure Object!"', function(done){
		stringifer.once('error', function(err){
			mycompare(err.message === 'Validation failed, incoming data type is not pure Object!', done);
		});
		stringifer.write(Buffer.from('dfdssad'));
	});
});

describe('Stringifer: Invalid data type test_3:', function() {
	it('err.message === "Validation failed, incoming data type is not pure Object!"', function(done){
		stringifer.once('error', function(err){
			mycompare(err.message === 'Validation failed, incoming data type is not pure Object!', done);
		});
		stringifer.write([1,2,3]);
	});
});

describe('Stringifer: Invalid data type test_4:', function() {
	it('err.message === "Validation failed, incoming data type is not pure Object!"', function(done){
		stringifer.once('error', function(err){
			mycompare(err.message === 'Validation failed, incoming data type is not pure Object!', done);
		});
		stringifer.write({a:new Buffer.from("t")});
	});
});

describe('Stringifer: Invalid data type test_5:', function() {
	it('err.message === "Validation failed, incoming data type is not pure Object!"', function(done){
		stringifer.once('error', function(err){
			mycompare(err.message === 'Validation failed, incoming data type is not pure Object!', done);
		});
		stringifer.write({a:{b:{c: 2, d:function(){}}}});
	});
});

describe('Stringifer: Valid data type test_1:', function() {
	it('data === "{"w":"fdsfds"}"', function(done){
		stringifer.once('data', function(data){
			mycompare(data === '{"w":"fdsfds"}', done);
		});
		stringifer.write({w:"fdsfds"});
	});
});

describe('Stringifer: Valid data type test_2:', function() {
	it('data === "{"w":1}"', function(done){
		stringifer.once('data', function(data){
			mycompare(data === '{"w":1}', done);
		});
		stringifer.write({w:1});
	});
});

describe('Stringifer: Valid data type test_3:', function() {
	it('data === "{"w":1,"c":true}"', function(done){
		stringifer.once('data', function(data){
			mycompare(data === '{"w":1,"c":true}', done);
		});
		stringifer.write({w:1, c: true});
	});
});

describe('Stringifer: Valid data type test_4:', function() {
	it('data === "{"w":1,"c":{"k":true,"l":"t","m":[1,2,3]}}"', function(done){
		stringifer.once('data', function(data){ console.log(data)
			mycompare(data === '{"w":1,"c":{"k":true,"l":"t","m":[1,2,3]}}', done);
		});
		stringifer.write({w:1,c:{k:true,l:"t","m":[1,2,3]}});
	});
});

describe('Stringifer: Valid data type test_5:', function() {
	it('data === "{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\\b\\t\\n\\f\\r\\u0000\\u000b","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}"', function(done){
		stringifer.once('data', function(data){ 
			mycompare(data === '{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\\b\\t\\n\\f\\r\\u0000\\u000b","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}', done);
		});
		stringifer.write({
			number: 1234567890,
			string_en: "abcdefghijklmnopqrstuvwxyz",
			string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
			string_ascii: "\b\t\n\f\r\0\v",
			bool: true,
			array: ["a", 1, true],
			object: {a:"a", "b":1, c:true}
		});
	});
});