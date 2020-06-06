"use strict"

require('mocha');
let ObjectStream = require('../../lib/index.js');

describe('Parser Events:', function() {
	it('parser.on("data", (e) => {})', async () => {
		const parser = new ObjectStream.Parser()
		const actionError = new Promise((res, rej) => {
			parser.once('error', (e) => {
				rej("action error" + JSON.stringify(e))
			})
		})
		const actionData = new Promise((res, rej) => {
			parser.once('data', () => {
				res("action data")
			})
		})
		const actionFinish = new Promise((res, rej) => {
			parser.once('finish', () => {
				rej("action finish")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			parser.once('end', () => {
				rej("action end")
			})
		})
		parser.write('{"a":1}')
		await Promise.race([ actionData, actionError, actionFinish, actionEnd ])
		parser.end()
	})
	it('parser.on("error", (e) => {})', async () => {
		const parser = new ObjectStream.Parser()
		const actionError = new Promise((res, rej) => {
			parser.once('error', () => {
				res("action error")
			})
		})
		const actionData = new Promise((res, rej) => {
			parser.once('data', () => {
				rej("action data")
			})
		})
		const actionFinish = new Promise((res, rej) => {
			parser.once('finish', () => {
				rej("action finish")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			parser.once('end', () => {
				rej("action end")
			})
		})
		parser.write('}')
		await Promise.race([ actionData, actionError, actionFinish, actionEnd ])
		parser.end()
	})
	it('finish.on("error", () => {})', async () => {
		const parser = new ObjectStream.Parser()
		const actionError = new Promise((res, rej) => {
			parser.once('error', () => {
				rej("action error")
			})
		})
		const actionData = new Promise((res, rej) => {
			parser.once('data', () => {
				rej("action data")
			})
		})
		const actionFinish = new Promise((res, rej) => {
			parser.once('finish', () => {
				res("action finish")
			})
		})
		parser.end()
		await Promise.race([ actionData, actionError, actionFinish ])
	})
	it('parser.on("end", () => {})', async () => {
		const parser = new ObjectStream.Parser()
		const actionError = new Promise((res, rej) => {
			parser.once('error', () => {
				rej("action error")
			})
		})
		const actionData = new Promise((res, rej) => {
			parser.once('data', () => {
				rej("action data")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			parser.once('end', () => {
				res("action end")
			})
		})
		parser.end()
		await Promise.race([ actionData, actionError, actionEnd ])
	})
})