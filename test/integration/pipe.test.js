"use strict"
require('mocha')
const Lodash = require('lodash')
const ObjectStream = require('../../lib/index.js')

const start = '[',
	  sep = ',',
	  end = ']'

const object = {
	number: 1234567890,
	string_en: "abcdefghijklmnopqrstuvwxyz",
	string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
	string_ascii: "\b\t\n\f\r\0\v",
	bool: true,
	array: ["a", 1, true],
	object: {a:"a", "b":1, c:true},
	object2: {
		array: [
			{
				number: 1,
				null: null
			}
		]
	}
}
const string = JSON.stringify(object)
const buffer = Buffer.from(string)

describe('Pipe with different encodings:', function() {
	this.timeout(60000)
	const encodings = [
		"utf8",
		"utf-8",
		"ascii",
		"utf16le",
		"ucs2",
		"ucs-2",
		"base64",
		"latin1",
		"binary",
		"hex"
	]
	const iterations = 1000
	for(const encoding of encodings) {
		it(encoding + " without errors", async () => {
			let nstring = [Buffer.from(start)]
			let rstring = [Buffer.from("")]
			const parser = (new ObjectStream.Parser(start, sep, end)).setEncoding(encoding)
			const parser2 = (new ObjectStream.Parser(start, sep, end)).setEncoding(encoding)
			const stringifer = (new ObjectStream.Stringifer(start, sep, end)).setEncoding(encoding)
			const stringifer2 = (new ObjectStream.Stringifer(start, sep, end)).setEncoding(encoding)
			let errcount = 0
			const p = new Promise((res, rej) => {
				stringifer2.on('end', function(data){
					if(data) rstring.push(data)
					const r = Buffer.concat(rstring)
					const n = Buffer.concat(nstring)
					if(r.equals(n) && (errcount === 0)) res()
						else rej("Not Equal")
				})
			})
			stringifer2.on('data', function(data){
				if(data) rstring.push(data)
			})
			parser.on('error', () => { 
				errcount++
			}).pipe(stringifer).on('error', () => { 
				errcount++ 
			}).pipe(parser2).on('error', () => { 
				errcount++ 
			}).pipe(stringifer2).on('error', () => { 
				errcount++ 
			})
			for(let i = 0; i < iterations; i++){
				for(let j = 0; j < Buffer.byteLength(buffer); j++)
					parser.write(buffer.slice(j, j+1))
				if(i !== 0) nstring.push(Buffer.from(sep))
				nstring.push(Buffer.from(string))
			}
			nstring.push(Buffer.from(end))
			parser.end()
			await p
		})
		it(encoding + " with errors", async () => {
			let nstring = [Buffer.from(start)]
			let rstring = [Buffer.from("")]
			const parser = (new ObjectStream.Parser(start, sep, end)).setEncoding(encoding)
			const parser2 = (new ObjectStream.Parser(start, sep, end)).setEncoding(encoding)
			const stringifer = (new ObjectStream.Stringifer(start, sep, end)).setEncoding(encoding)
			const stringifer2 = (new ObjectStream.Stringifer(start, sep, end)).setEncoding(encoding)
			let errcount = 0
			const p = new Promise((res, rej) => {
				stringifer2.on('end', (data) => {
					if(data) rstring.push(data)
					const r = Buffer.concat(rstring)
					const n = Buffer.concat(nstring)
					if(r.equals(n) && (errcount === iterations)) res()
						else rej("Not Equal")
				})
			})
			stringifer2.on('data', (data) => {
				if(data) rstring.push(data)
			})
			parser.on('error', () => { 
				errcount++
			}).pipe(stringifer).on('error', () => { 
				errcount++
			}).pipe(parser2).on('error', () => { 
				errcount++
			}).pipe(stringifer2).on('error', () => { 
				errcount++
			})
			for(let i = 0; i < iterations; i++){
				for(let j = 0; j < Buffer.byteLength(buffer); j++)
					parser.write(buffer.slice(j, j+1))
				if(i !== 0) nstring.push(Buffer.from(sep))
				nstring.push(Buffer.from(string))
				parser.write(Buffer.from('foo'))
			}
			nstring.push(Buffer.from(end))
			parser.end()
			await p
		})
	}
})