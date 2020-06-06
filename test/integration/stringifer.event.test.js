"use strict"
require('mocha')
const ObjectStream = require('../../lib/index.js')

describe('Stringifer Events:', function() {
	it('stringifer.on("data", (e) => {})', async () => {
		const stringifer = new ObjectStream.Stringifer()
		const actionError = new Promise((res, rej) => {
			stringifer.once('error', (e) => {
				rej("action error" + JSON.stringify(e))
			})
		})
		const actionData = new Promise((res, rej) => {
			stringifer.once('data', (e) => {
				res("action data")
			})
		})
		const actionFinish = new Promise((res, rej) => {
			stringifer.once('finish', () => {
				rej("action finish")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			stringifer.once('end', () => {
				rej("action end")
			})
		})
		stringifer.write({"a":1})
		await Promise.race([ actionData, actionError, actionFinish, actionEnd ])
		stringifer.end()
	})
	it('stringifer.on("error", (e) => {})', async () => {
		const stringifer = new ObjectStream.Stringifer()
		const actionError = new Promise((res, rej) => {
			stringifer.once('error', (e) => {
				res("action error")
			})
		})
		const actionData = new Promise((res, rej) => {
			stringifer.once('data', (e) => {
				rej("action data")
			})
		})
		const actionFinish = new Promise((res, rej) => {
			stringifer.once('finish', () => {
				rej("action finish")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			stringifer.once('end', () => {
				rej("action end")
			})
		})
		stringifer.write('}')
		await Promise.race([ actionData, actionError, actionFinish, actionEnd ])
		stringifer.end()
	})
	it('stringifer.on("finish", () => {})', async () => {
		const stringifer = new ObjectStream.Stringifer()
		stringifer.on('data', () => {})
		const actionError = new Promise((res, rej) => {
			stringifer.once('error', (e) => {
				rej("action error")
			})
		})
		const actionFinish = new Promise((res, rej) => {
			stringifer.once('finish', () => {
				res("action finish")
			})
		})
		stringifer.end()
		await Promise.race([ actionError, actionFinish ])
	})
	it('stringifer.on("end", () => {})', async () => {
		const stringifer = new ObjectStream.Stringifer()
		stringifer.on('data', () => {})
		const actionError = new Promise((res, rej) => {
			stringifer.once('error', (e) => {
				rej("action error")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			stringifer.once('end', () => {
				res("action end")
			})
		})
		stringifer.end()
		await Promise.race([ actionError, actionEnd ])
	})
	it('stringifer.on("end", () => {}), write null', async () => {
		const stringifer = new ObjectStream.Stringifer()
		stringifer.on('data', () => {})
		const actionError = new Promise((res, rej) => {
			stringifer.once('error', (e) => { console.log(e)
				rej("action error")
			})
		})
		const actionEnd = new Promise((res, rej) => {
			stringifer.once('end', () => {
				res("action end")
			})
		})
		stringifer.push(null)
		await Promise.race([ actionError, actionEnd ])
	})
})