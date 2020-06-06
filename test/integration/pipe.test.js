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
	object: {a:"a", "b":1, c:true}
}
const string = JSON.stringify(object)
const buffer = Buffer.from(string)

describe('Pipe Valid with Errors:', function() {
	this.timeout(15000)
	it('nstring === rstring', async () => {
		let nstring = start
		let rstring = ''
		const parser = new ObjectStream.Parser(start, sep, end)
		const parser2 = new ObjectStream.Parser(start, sep, end)
		const stringifer = new ObjectStream.Stringifer(start, sep, end)
		const stringifer2 = new ObjectStream.Stringifer(start, sep, end)
		let errcount = 0
		const p = new Promise((res, rej) => {
			stringifer2.on('end', (data) => {
				if(data) rstring += data
				if((nstring === rstring) && (errcount === 10000)) res()
					else rej("Not Equal")
			})
		})
		stringifer2.on('data', (data) => {
			if(data) rstring += data
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
		for(let i = 0; i < 10000; i++){
			for(let j = 0; j < Buffer.byteLength(buffer); j++)
				parser.write(buffer.slice(j, j+1))
			if(i === 0) nstring += string
				else nstring += sep+string
			parser.write('foo')
		}
		nstring += end
		parser.end()
		await p
	})
})

describe('Pipe Valid without Errors:', function() {
	this.timeout(15000)
	it('nstring === rstring', async () => {
		let nstring = start
		let rstring = ''
		const parser = new ObjectStream.Parser(start, sep, end)
		const parser2 = new ObjectStream.Parser(start, sep, end)
		const stringifer = new ObjectStream.Stringifer(start, sep, end)
		const stringifer2 = new ObjectStream.Stringifer(start, sep, end)
		let errcount = 0
		const p = new Promise((res, rej) => {
			stringifer2.on('end', function(data){
				if(data) rstring += data
				if((nstring === rstring) && (errcount === 0)) res()
					else rej("Not Equal")
			})
		})
		stringifer2.on('data', function(data){
			if(data) rstring += data
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
		for(let i = 0; i < 10000; i++){
			for(let j = 0; j < Buffer.byteLength(buffer); j++)
				parser.write(buffer.slice(j, j+1))
			if(i === 0) nstring += string
				else nstring += sep+string
		}
		nstring += end
		parser.end()
		await p
	})
})