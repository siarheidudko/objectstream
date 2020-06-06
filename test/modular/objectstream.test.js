"use strict"
require('mocha')
const Lodash = require('lodash')
const ObjectStream = require('../../lib/index.js')

describe('Stringifer invalid arguments:', function() {
	it('Invalid start separator', async () => {
        try {
            new ObjectStream.Stringifer('б', '', '')
        } catch (err) {
            return
        }
        throw new Error("error") 
    })
    it('Invalid middle separator', async () => {
        try {
            new ObjectStream.Stringifer('', 'б', '')
        } catch (err) {
            return
        }
        throw new Error("error") 
    })
    it('Invalid end separator', async () => {
        try {
            new ObjectStream.Stringifer('', '', 'б')
        } catch (err) {
            return
        }
        throw new Error("error") 
    })
})

describe('Parser invalid arguments:', function() {
	it('Invalid start separator', async () => {
        try {
            new ObjectStream.Parser('б', '', '')
        } catch (err) {
            return
        }
        throw new Error("error") 
    })
    it('Invalid middle separator', async () => {
        try {
            new ObjectStream.Parser('', 'б', '')
        } catch (err) {
            return
        }
        throw new Error("error") 
    })
    it('Invalid end separator', async () => {
        try {
            new ObjectStream.Parser('', '', 'б')
        } catch (err) {
            return
        }
        throw new Error("error") 
    })
})

describe('Set encoding:', function() {
	it('Stringifer', async () => {
        const stringifer = new ObjectStream.Stringifer()
        stringifer.setEncoding("latin1")
        const p = new Promise((res, rej) => {
			stringifer.once('data', (data) => {
                const string = Buffer.from('{"w":"тестовое сообщение"}')
				if(string.equals(data))
					res()
				else
					rej("Not Equal")
			})
		})
		stringifer.write({w:"тестовое сообщение"})
		await p
		stringifer.end()
    })
    it('Parser', async () => {
        const parser = new ObjectStream.Parser()
        parser.setEncoding("latin1")
        const p = new Promise((res, rej) => {
			parser.once('data', (data) => {
				if(Lodash.isEqual(data, {"w":"тестовое сообщениие"}))
					res()
				else
					rej("Not Equal")
			})
		})
		parser.write(Buffer.from('{"w":"тестовое сообщениие"}',"utf8").toString("latin1"))
		await p
		parser.end()
    })
})