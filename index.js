/**
 * Module for stream conversion Json to String and String to Json
 * @module sergdudko/objectstream
 * @author Siarhei Dudko <slavianich@gmail.com>
 * @copyright 2019
 * @license MIT
 * @version 1.7.6
 * @requires stream
 * @requires string_decoder
 */
 
'use strict'

let Stream = require('stream');
const { StringDecoder } = require('string_decoder');
  
let validator = function(obj, it = true){
	switch(typeof(obj)){
		case 'boolean':
			return true;
		case 'number':
			return true;
		case 'string':
			return true;
		case 'object':
			if(obj === null)
				return true;
			if((obj.__proto__ === {}.__proto__) || (it && (obj.__proto__ === [].__proto__))){
				let keys = Object.keys(obj);
				for(let i = 0; i < keys.length; i++){
					if(validator(obj[keys[i]]) === false){
						return false;
					}
				}
				return true;
			} else {
				return false;
			}
		default:
			return false;
	}
}


/**
  * Сreates an instance of Stringifer (Json to String conversion stream)
  * 
  * @class Stringifer
  * @param {string} _start - character at the beginning of the stream, is added
  * @param {string} _separator - separator of objects inside the stream, is added
  * @param {string} _end - character at the end of the stream, is added
  * @returns {Stream.Transform} 
  */
let Stringifer = function(_start = '', _separator = '', _end = ''){
	if((typeof(_start) !== 'string') || (Buffer.byteLength(_start) > 1) || (_start.match(/["{}]/))){ throw new Error('Argument start require one byte String!'); }
	if((typeof(_separator) !== 'string') || (Buffer.byteLength(_separator) > 1) || (_separator.match(/["{}]/))){ throw new Error('Argument separator require one byte String!'); }
	if((typeof(_end) !== 'string') || (Buffer.byteLength(_end) > 1) || (_end.match(/["{}]/))){ throw new Error('Argument end require one byte String!'); }
	let self = this;
	self.bytesWrite = 0;
	self.encoding = 'utf8';
	self.transform = new Stream.Transform({
		transform(object, encoding = self.encoding, callback = function(){}) {
			self.encoding = encoding;
			switch(typeof(object)){
				case 'object':
					try{
						if(validator(object, false) !== true) {
							callback(new Error('Validation failed, incoming data type is not pure Object!'));
						} else {
							let _string = JSON.stringify(object);
							if(self.bytesWrite === 0){
								_string = _start+_string;
							} else {
								_string = _separator+_string;
							}
							self.transform.push(_string);
							self.bytesWrite += Buffer.byteLength(_string, self.encoding);
							callback();
						}
					} catch (err){
						callback(err);
					}
					break;
				case 'undefined':
					callback();
					break;
				default:
					callback(new Error('Incoming data type is '+typeof(object)+', require data type is pure Object!'));
					break;
			}
		},
		flush(callback = function(){}){
			callback();
		},
		final(callback = function(){}){
			if(self.bytesWrite === 0){
				self.transform.push(_start+_end);
			} else {
				self.transform.push(_end);
			}
			self.bytesWrite += Buffer.byteLength(_end, self.encoding);
			callback();
		},
		highWaterMark: 64*1024,
		objectMode: true
	});
	return self.transform;
}

/**
  * Сreates an instance of Parser (String to Json conversion stream)
  * 
  * @class Parser
  * @param {string} _start - character at the beginning of the stream, is discarded
  * @param {string} _separator - separator of objects inside the stream, is discarded
  * @param {string} _end - character at the end of the stream, is discarded
  * @returns {Stream.Transform} 
  */
let Parser = function(_start = '', _separator = '', _end = ''){
	if((typeof(_start) !== 'string') || (Buffer.byteLength(_start) > 1) || (_start.match(/["{}]/))){ throw new Error('Argument start require one byte String!'); }
	if((typeof(_separator) !== 'string') || (Buffer.byteLength(_separator) > 1) || (_separator.match(/["{}]/))){ throw new Error('Argument separator require one byte String!'); }
	if((typeof(_end) !== 'string') || (Buffer.byteLength(_end) > 1) || (_end.match(/["{}]/))){ throw new Error('Argument end require one byte String!'); }
	let self = this;
	const _startToken = Buffer.from(_start)[0],
		_separatorToken = Buffer.from(_separator)[0],
		_endToken = Buffer.from(_end)[0],
		_spaceToken = Buffer.from(' ')[0],
		_rToken = Buffer.from('\r')[0],
		_nToken = Buffer.from('\n')[0],
		_tToken = Buffer.from('\t')[0];
	self.bytesRead = 0;
	self.encoding = 'utf8';
	self.StringDecoder = new StringDecoder(self.encoding);
	self.clear = function(){
		self.StringBufferArray = new Array();
		self.LeftBrace = 0;
		self.RightBrace = 0;
		self.OpenQuotes = false;
		return;
	}
	self.clear();
	self.defaultHandler = function(_buffer, s, error){
		if(self.StringBufferArray.length > 65536){
			let _nbuffer = Buffer.concat(self.StringBufferArray);
			self.StringBufferArray = new Array();
			self.StringBufferArray.push(_nbuffer);
		}
		if(self.LeftBrace !== 0) {
			self.StringBufferArray.push(_buffer.slice(s,s+1)); 
		} else if((_startToken !== _buffer[s]) && (_endToken !== _buffer[s]) && (_separatorToken !== _buffer[s]) && (_spaceToken !== _buffer[s]) && (_rToken !== _buffer[s]) && (_nToken !== _buffer[s]) && (_tToken !== _buffer[s])){
			error.push(new Error('Unexpected token '+_buffer.slice(s,s+1).toString(self.encoding)+' in JSON at position '+(self.bytesRead+s)));
		}
	}
	self.transform = new Stream.Transform({
		transform(string, encoding = self.encoding, callback = function(){}) {
			self.encoding = encoding;
			let _string;
			if(string instanceof Buffer){ 
				_string = self.StringDecoder.write(string);
			} else {
				_string = string;
			}
			if(_string === ''){
				callback();
			}else if(typeof(_string) === 'undefined'){
				callback();
			} else if(typeof(_string) !== 'string'){
				callback([new Error('Incoming data type is '+typeof(_string)+', require data type is String!')]);
			} else {
				let error = new Array();
				let _buffer = Buffer.from(_string, self.encoding);
				for(let s = 0; s < _buffer.length; s++){
					switch(_buffer[s]){
						case 0x7b:	// symbol {
							self.LeftBrace++;
							self.defaultHandler(_buffer, s, error);
							break;
						case 0x7d:	// symbol }
							self.RightBrace++;
							self.defaultHandler(_buffer, s, error);
							break;
						case 0x08:	// symbol \b
						case 0x09:	// symbol \t
						case 0x0a:	// symbol \n
						case 0x0c:	// symbol \f
						case 0x0d:	// symbol \r
						case 0x00:	// symbol \0
						case 0x0b:	// symbol \v
							if(self.OpenQuotes && (self.LeftBrace !== 0)){ 
								self.StringBufferArray.push(Buffer.from('\\u'+('0000' + _buffer[s].toString(16)).slice(-4), self.encoding));
							}
							break;
						case 0x22:	// symbol "
							if(_buffer[s-1] !== 0x5c){
								if(self.OpenQuotes){ 
									self.OpenQuotes = false;
								} else if (self.LeftBrace !== 0) {
									self.OpenQuotes = true;
								}
							}
							self.defaultHandler(_buffer, s, error);
							break;
						default:
							self.defaultHandler(_buffer, s, error);
							break;
					}
					if((self.LeftBrace !== 0) && (self.LeftBrace === self.RightBrace)){
						try{
							let _object = JSON.parse(Buffer.concat(self.StringBufferArray).toString(self.encoding));
							if(validator(_object, false)){
								self.clear();
								self.transform.push(_object);
							} else {
								self.clear();
								error.push(new Error('Validation failed, incoming data type is not pure Object!'));
							}
						} catch(err){
							self.clear();
							error.push(err);
						}
					} else if(self.LeftBrace < self.RightBrace){
						self.clear();
						error.push(new Error('Parsing error, clear buffer!'));
					}
				}
				if(error.length > 0){
					callback(error);
				} else {
					callback();
				}
				self.bytesRead += _buffer.byteLength;
			}
		},
		flush(callback = function(){}){
			self.clear();
			callback();
		},
		final(callback = function(){}){
			self.StringDecoder.end();
			if(self.StringBufferArray.length === 0){
				callback();
			} else {
				try{
					JSON.parse(Buffer.concat(self.StringBufferArray).toString(self.encoding));
					callback([new Error('Raw object detected!')]);
				} catch(err){
					callback([err]);
				}
			}
		},
		highWaterMark: 64*1024,
		objectMode: true
	});
	return self.transform;
}

module.exports = { Stringifer, Parser };