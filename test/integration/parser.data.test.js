"use strict"
require('mocha')
const Lodash = require('lodash')
const ObjectStream = require('../../lib/index.js')

describe('Parser: Invalid data type:', function() {
	it('err[0].message === "Incoming data type is number, require data type is String!"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('error', (err) => {
				if(err[0].message === 'Incoming data type is number, require data type is String!')
					res()
				else
					rej(err[0])
			})
		})
		parser.write(1)
		await p
		parser.end()
	})
	it('err[0].message === "Unexpected end of JSON input"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('error', (err) => {
				if(err[0].message === 'Unexpected end of JSON input')
					res()
				else
					rej(err[0])
			})
		})
		parser.end('{"a":1')
		await p
		parser.end()
	})
	it('err[0].message === "Unexpected token t in JSON at position 0"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('error', (err) => {
				if(err[0].message === 'Unexpected token t in JSON at position 0')
					res()
				else
					rej(err[0])
			})
		})
		parser.write(Buffer.from('t'))
		await p
		parser.end()
	})
	it('err[0].message === "Unexpected token u in JSON at position 12"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('error', (err) => {
				if(err[0].message === 'Unexpected token u in JSON at position 12')
					res()
				else
					rej(err[0])
			})
		})
		parser.write(Buffer.from('{"a":1,"c":function(){}}'))
		await p
		parser.end()
	})
	it('err[0].message === "Unexpected token d in JSON at position 1"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('error', (err) => {
				if(err[0].message === 'Unexpected token d in JSON at position 1')
					res()
				else
					rej(err[0])
			})
		})
		parser.write(Buffer.from("{d:}"))
		await p
		parser.end()
	})
})

describe('Parser: Valid data type:', function () {
	it('data === "{"w":1}"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('data', (data) => {
				if(Lodash.isEqual(data, {"w":1}))
					res()
				else
					rej("Not Equal")
			})
		})
		parser.write('{"w":1}')
		await p
		parser.end()
	})
	it('data === "{"w":1,"c":{"k":true,"l":"t","d":null}}"', async() => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('data', (data) => {
				if(Lodash.isEqual(data, {"w":1,"c":{"k":true,"l":"t","d":null}}))
					res()
				else
					rej("Not Equal")
			})
		})
		parser.write('{"w":1,"c":{"k":true,"l":"t","d":null}}')
		await p
		parser.end()
	})
	it('data === "undefined"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('finish', function(data){
				if(typeof(data) === "undefined")
					res()
				else
					rej("Not Equal")
			})
		})
		parser.end()
		await p
	})
	it('data === "{"w":1,"c":{"k":true,"l":["1",2,"4",true]}}"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('data', function(data){
				if(Lodash.isEqual(data, {"w":1,"c":{"k":true,"l":["1",2,"4",true]}}))
					res()
				else
					rej("Not Equal")
			})
		})
		parser.write('{"w":1,"c":{"k":true,"l":["1",2,"4",true]}}')
		await p
		parser.end()
	})
	it('data === "{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\\b\\t\\n\\f\\r\\u0000\\u000b","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}"', async () => {
		const parser = new ObjectStream.Parser()
		const p = new Promise((res, rej) => {
			parser.once('data', (data) => {
				if(Lodash.isEqual(data, {
					number: 1234567890,
					string_en: "abcdefghijklmnopqrstuvwxyz",
					string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
					string_ascii: "\b\t\n\f\r\0\v",
					bool: true,
					array: ["a", 1, true],
					object: {a:"a", "b":1, c:true}
				}))
					res()
				else
					rej("Not Equal")
			})
		})
		parser.write('{"number":1234567890,"string_en":"abcdefghijklmnopqrstuvwxyz","string_ru":"абвгдеёжзийклмнопртуфхцчшщъыьэюя","string_ascii":"\b\t\n\f\r\0\v","bool":true,"array":["a",1,true],"object":{"a":"a","b":1,"c":true}}')
		await p
		parser.end()
	})
})