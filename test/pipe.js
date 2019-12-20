"use strict"

const start = '[',
	  sep = ',',
	  end = ']';

require('mocha');
const Lodash = require('lodash');
let ObjectStream = require('../index.js');

const object = {
	number: 1234567890,
	string_en: "abcdefghijklmnopqrstuvwxyz",
	string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
	string_ascii: "\b\t\n\f\r\0\v",
	bool: true,
	array: ["a", 1, true],
	object: {a:"a", "b":1, c:true}
};
const string = JSON.stringify(object);
const buffer = Buffer.from(string);


let mycompare = function(bool, done){
	if(bool){
		done();
	} else {
		done(new Error('Test failed!'));
	}
}

describe('Pipe Valid with Errors:', function() {
	this.timeout(15000);
	let nstring = start;
	let rstring = '';
	let parser = new ObjectStream.Parser(start, sep, end);
	let parser2 = new ObjectStream.Parser(start, sep, end);
	let stringifer = new ObjectStream.Stringifer(start, sep, end);
	let stringifer2 = new ObjectStream.Stringifer(start, sep, end);
	let errcount = 0;
	it('nstring === rstring', function(done){
		stringifer2.on('data', function(data){
			if(data)
				rstring += data;
		}).on('end', function(data){
			if(data)
				rstring += data;
			mycompare(((nstring === rstring) && (errcount === 10000)), done);
		});
		parser.on('error', function(){ errcount++; }).pipe(stringifer).on('error', function(){ errcount++; }).pipe(parser2).on('error', function(){ errcount++; }).pipe(stringifer2).on('error', function(){ errcount++; });
		for(let i = 0; i < 10000; i++){
			for(let j = 0; j < Buffer.byteLength(buffer); j++){
				parser.write(buffer.slice(j, j+1));
			}
			if(i === 0){
				nstring += string;
			} else {
				nstring += sep+string;
			}
			parser.write('foo');
		}
		nstring += end;
		parser.end();
	});
});

describe('Pipe Valid without Errors:', function() {
	this.timeout(15000);
	let nstring = start;
	let rstring = '';
	let parser = new ObjectStream.Parser(start, sep, end);
	let parser2 = new ObjectStream.Parser(start, sep, end);
	let stringifer = new ObjectStream.Stringifer(start, sep, end);
	let stringifer2 = new ObjectStream.Stringifer(start, sep, end);
	let errcount = 0;
	it('nstring === rstring', function(done){
		stringifer2.on('data', function(data){
			if(data)
				rstring += data;
		}).on('end', function(data){
			if(data)
				rstring += data;
			mycompare(((nstring === rstring) && (errcount === 0)), done);
		});
		parser.on('error', function(){ errcount++; }).pipe(stringifer).on('error', function(){ errcount++; }).pipe(parser2).on('error', function(){ errcount++; }).pipe(stringifer2).on('error', function(){ errcount++; });
		for(let i = 0; i < 10000; i++){
			for(let j = 0; j < Buffer.byteLength(buffer); j++){
				parser.write(buffer.slice(j, j+1));
			}
			if(i === 0){
				nstring += string;
			} else {
				nstring += sep+string;
			}
		}
		nstring += end;
		parser.end();
	});
});