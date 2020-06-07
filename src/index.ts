/**
 * Module for stream conversion Json to String and String to Json
 * @module sergdudko/objectstream
 * @author Siarhei Dudko <slavianich@gmail.com>
 * @copyright 2020
 * @license MIT
 * @version 2.0.0
 * @requires stream
 */

import { Transform } from "stream"

/**
 * Validate object
 * 
 * @private
 * @param obj - object for validation
 * @param it - internal flag
 */
const validator = (obj: any, it: boolean = true) => {
	switch(typeof(obj)){
		case "boolean":
			return true
		case "number":
			return true
		case "string":
			return true
		case "object":
			if(obj === null)
				return true
			if(obj.__proto__ === ({} as any ).__proto__){
				for (const key in obj)
				if(validator(obj[key]) === false)
					return false
				return true
			}
			if(it && (obj.__proto__ === ([] as any).__proto__)){
				for (const key of obj)
				if(validator(key) === false)
					return false
				return true		
			}
			return false
		default:
			return false
	}
}

/**
 * @class Stringifer
 * 
 * Сreates an instance of Stringifer (Json to String conversion stream)
 */
class Stringifer extends Transform {
	/**
	 * 
	 * @param start - first separator
	 * @param middle - middle separator
	 * @param end - end separator
	 */
	constructor(start?: string, middle?: string, end?: string){
		super({ highWaterMark: 64*1024, objectMode: true })
		if(
			(typeof(start) !== "undefined") &&
			((typeof(start) !== "string") || 
			(Buffer.byteLength(start) > 1) || 
			(start.match(/["{}]/)))
		) 
			throw new Error("Argument start require one byte String!")
		if(
			(typeof(middle) !== "undefined") &&
			((typeof(middle) !== "string") || 
			(Buffer.byteLength(middle) > 1) || 
			(middle.match(/["{}]/)))
		) 
			throw new Error("Argument separator require one byte String!")
		if(
			(typeof(end) !== "undefined") &&
			((typeof(end) !== "string") || 
			(Buffer.byteLength(end) > 1) || 
			(end.match(/["{}]/)))
		) 
			throw new Error("Argument end require one byte String!")
		this.__separators = {
			start: Buffer.from(start?start:"", "utf8"),
			middle: Buffer.from(middle?middle:"", "utf8"),
			end: Buffer.from(end?end:"", "utf8")
		}
		this.__isString = false
		this.__bytesWrite = 0
		this.__encoding = "utf8"
		this.setDefaultEncoding(this.__encoding)
	}
	/**
	 * separators
	 * 
	 * @private
	 */
	private __separators: {
		start: Buffer,
		middle: Buffer,
		end: Buffer
	}
	/**
	 * pass string data to the stream
	 * 
	 * @private
	 */
	private __isString: boolean
	/**
	 * stream byte counter
	 * 
	 * @private
	 */
	private __bytesWrite: number
	/**
	 * stream encoding
	 * 
	 * @private
	 */
	private __encoding: "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex"
	/**
	 * Data event handler
	 * 
	 * @private
	 * @param object - object data
	 * @param encoding - stream encoding
	 * @param callback - callback function
	 */
	public _transform(object: {[key: string]: any}|null|undefined, encoding: "utf8" | "ascii" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" = this.__encoding, callback: Function = () => { return }) {
		if(typeof(object) === "undefined"){
			callback()
			return
		}
		if(object === null) {
			this._final(()=>{
				callback()
			})
			return
		}
		switch(typeof(object)){
			case "object":
				try{
					if(validator(object, false) !== true) {
						callback([new Error("Validation failed, incoming data type is not pure Object!")])
						return
					}
					let _buffer: Buffer = Buffer.from(JSON.stringify(object), "utf8")
					if(this.__bytesWrite === 0){
						_buffer = Buffer.concat([this.__separators.start, _buffer])
					} else {
						_buffer = Buffer.concat([this.__separators.middle, _buffer])
					}
					if(this.__isString) this.push(_buffer.toString(this.__encoding))
						else this.push(_buffer, this.__encoding)
					this.__bytesWrite += Buffer.byteLength(_buffer)
					callback()
					return
				} catch (err){
					callback([err])
					return
				}
			case "undefined":
				callback()
				return
			default:
				callback([new Error("Incoming data type is "+typeof(object)+", require data type is pure Object!")])
				return
		}
	}
	/**
	 * Flush event handler
	 * 
	 * @private
	 * @param callback - callback function
	 */
	public _flush(callback = () => { return }){
		callback()
	}
	/**
	 * End event handler
	 * 
	 * @private
	 * @param callback - callback function
	 */
	public _final(callback = () => { return }){
		if(this.__bytesWrite === 0){
			const _buffer: Buffer = Buffer.concat([this.__separators.start, this.__separators.end])
			if(this.__isString) this.push(_buffer.toString(this.__encoding))
				else this.push(_buffer, this.__encoding)
		} else {
			if(this.__isString) this.push(this.__separators.end.toString(this.__encoding))
				else this.push(this.__separators.end, this.__encoding)
		}
		this.__bytesWrite += Buffer.byteLength(this.__separators.end)
		callback()
	}
	/**
	 * set stream encoding
	 */
	public setEncoding = (encoding: "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex") => {
		this.__encoding = encoding
		this.setDefaultEncoding(this.__encoding)
		this.__isString = true
		return this
	}
}

/**
 * @class Parser
 * 
 * Сreates an instance of Parser (String to Json conversion stream)
 */
class Parser extends Transform {
	/**
	 * 
	 * @param start - first separator
	 * @param middle - middle separator
	 * @param end - end separator
	 */
	constructor(start?: string, middle?: string, end?: string){
		super({ highWaterMark: 64*1024, objectMode: true })
		if(
			(typeof(start) !== "undefined") &&
			((typeof(start) !== "string") || 
			(Buffer.byteLength(start) > 1) || 
			(start.match(/["{}]/)))
		) 
			throw new Error("Argument start require one byte String!")
		if(
			(typeof(middle) !== "undefined") &&
			((typeof(middle) !== "string") || 
			(Buffer.byteLength(middle) > 1) || 
			(middle.match(/["{}]/)))
		) 
			throw new Error("Argument separator require one byte String!")
		if(
			(typeof(end) !== "undefined") &&
			((typeof(end) !== "string") || 
			(Buffer.byteLength(end) > 1) || 
			(end.match(/["{}]/)))
		) 
			throw new Error("Argument end require one byte String!")
		this.__separators = {
			start: Buffer.from(start?start:"", "utf8")[0],
			middle: Buffer.from(middle?middle:"", "utf8")[0],
			end: Buffer.from(end?end:"", "utf8")[0]
		}
		this.__clear()
		this.__bytesRead = 0
		this.__encoding = "utf8"
		this.setDefaultEncoding(this.__encoding)
		this.__buffers = []
		this.__leftBrace = 0
		this.__rightBrace = 0
		this.__openQuotes = false
	}
	/**
	 * separators
	 * 
	 * @private
	 */
	private __separators: {
		start: number,
		middle: number,
		end: number
	}
	/**
	 * empty buffer
	 * 
	 * @private
	 */
	private static __empty: Buffer = Buffer.from("")
	/**
	 * stream byte counter
	 * 
	 * @private
	 */
	private __bytesRead: number
	/**
	 * stream encoding
	 * 
	 * @private
	 */
	private __encoding: "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex"
	/**
	 * stream buffer
	 * 
	 * @private
	 */
	private __buffers: Buffer[]
	/**
	 * left brace counter
	 * 
	 * @private
	 */
	private __leftBrace: number
	/**
	 * right brace counter
	 * 
	 * @private
	 */
	private __rightBrace: number
	/**
	 * open quote flag
	 * 
	 * @private
	 */
	private __openQuotes: boolean
	/**
	 * clear buffer and reset counters
	 * 
	 * @private
	 */
	private __clear = () => {
		this.__buffers = []
		this.__leftBrace = 0
		this.__rightBrace = 0
		this.__openQuotes = false
	}
	/**
	 * basic stream handler
	 */
	private __handler = (buffer: Buffer, s: number, errors: Error[]) => {
		if(this.__buffers.length > 65536){
			const _nbuffer = Buffer.concat(this.__buffers)
			this.__buffers = []
			this.__buffers.push(_nbuffer)
		}
		if(this.__leftBrace !== 0) {
			this.__buffers.push(buffer.slice(s,s+1))
		} else if(
			(this.__separators.start !== buffer[s]) && 
			(this.__separators.end !== buffer[s]) && 
			(this.__separators.middle !== buffer[s]) && 
			(0x20 !== buffer[s]) && 
			(0x0d !== buffer[s]) && 
			(0x0a !== buffer[s]) && 
			(0x09 !== buffer[s])
		){
			errors.push(new Error("Unexpected token " + 
				buffer.slice(s,s+1).toString(this.__encoding) + 
				" in JSON at position "+(this.__bytesRead+s)))
		}
	}
	/**
	 * Data event handler
	 * 
	 * @private
	 * @param string - string or buffer data
	 * @param encoding - stream encoding
	 * @param callback - callback function
	 */
	public _transform(string: string|Buffer|null|undefined, encoding: "utf8" | "ascii" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" = this.__encoding, callback: Function = () => { return }) {
		if(typeof(string) === "undefined"){
			callback()
			return
		}
		if(string === null) {
			this._final(()=>{
				callback()
			})
			return
		}
		const _buffer: Buffer = (typeof(string) === "string")?
			Buffer.from(string, encoding) : string
		if(!(_buffer instanceof Buffer)){
			callback([
				new Error("Incoming data type is " +
					typeof(_buffer) + 
					", require data type is String!")
			])
			return
		}
		if(Parser.__empty.equals(_buffer)){
			callback()
			return
		}
		const errors: Error[] = []
		for(let s = 0; s < _buffer.length; s++){
			switch(_buffer[s]){
				case 0x7b:
					this.__leftBrace++
					this.__handler(_buffer, s, errors)
					break
				case 0x7d:
					this.__rightBrace++
					this.__handler(_buffer, s, errors)
					break
				case 0x08:
				case 0x09:
				case 0x0a:
				case 0x0c:
				case 0x0d:
				case 0x00:
				case 0x0b:
					if(this.__openQuotes && (this.__leftBrace !== 0))
						this.__buffers.push(
							Buffer.from("\\u"+("0000" + _buffer[s].toString(16)).slice(-4), "utf8")
						)
					break
				case 0x22:
					if(_buffer[s-1] !== 0x5c) if(this.__openQuotes)
						this.__openQuotes = false
					else if (this.__leftBrace !== 0)
						this.__openQuotes = true
					this.__handler(_buffer, s, errors)
					break
				default:
					this.__handler(_buffer, s, errors)
					break
			}
			if((this.__leftBrace !== 0) && (this.__leftBrace === this.__rightBrace)){
				try{
					const _buf: Buffer = Buffer.concat(this.__buffers)
					const _str: string = _buf.toString("utf8")
					const _object = JSON.parse(_str)
					if(validator(_object, false)){
						this.__clear()
						this.push(_object)
					} else {
						this.__clear()
						errors.push(
							new Error("Validation failed, incoming data type is not pure Object!")
						)
					}
				} catch(err){
					this.__clear()
					errors.push(err)
				}
			} else if(this.__leftBrace < this.__rightBrace){
				this.__clear()
				errors.push(
					new Error("Parsing error, clear buffer!")
				)
			}
		}
		if(errors.length > 0)
			callback(errors)
		else
			callback()
		this.__bytesRead += _buffer.byteLength
	}
	/**
	 * Flush event handler
	 * 
	 * @private
	 * @param callback - callback function
	 */
	public _flush(callback: Function = () => { return }){
		this.__clear()
		callback()
	}
	/**
	 * End event handler
	 * 
	 * @private
	 * @param callback - callback function
	 */
	public _final(callback: Function = () => { return }){
		if(this.__buffers.length === 0){
			callback()
			return
		}
		try{
			const _buf: Buffer = Buffer.concat(this.__buffers)
			const _str: string = _buf.toString("utf8")
			JSON.parse(_str)
			callback([
				new Error("Raw object detected!")
			])
		} catch(err){
			callback([ err ])
		}
	}
	/**
	 * set stream encoding
	 */
	public setEncoding = (encoding: "utf8" | "utf-8" | "base64" | "latin1" | "binary" | "hex") => {
		this.__encoding = encoding
		this.setDefaultEncoding(this.__encoding)
		return this
	}
}

export = module.exports = {
	/**
	 * Object to String stream
	 */
	Stringifer,
	/**
	 * String to Object stream
	 */
	Parser
}