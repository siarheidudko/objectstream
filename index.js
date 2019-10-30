/**
 *	objectstream
 *	(c) 2019 by Siarhei Dudko.
 *
 */
 
'use strict'

let STREAM = require('stream');
const { StringDecoder } = require('string_decoder');

let Stringifer = function(_start = '', _separator = '', _end = ''){
	if((typeof(_start) !== 'string') || (_start.length > 1) || (_start.match(/["{}]/))){ throw new Error('Argument start require type Char!'); }
	if((typeof(_separator) !== 'string') || (_separator.length > 1) || (_separator.match(/["{}]/))){ throw new Error('Argument separator require type Char!'); }
	if((typeof(_end) !== 'string') || (_end.length > 1) || (_end.match(/["{}]/))){ throw new Error('Argument end require type Char!'); }
	let self = this;
	self.bytesWrite = 0;
	self.encoding = 'utf8';
	self.Transform = new STREAM.Transform({
		transform(object, encoding = self.encoding, callback = function(){}) {
			switch(typeof(object)){
				case 'object':
					if(!Array.isArray(object)){
						try{
							let _string = JSON.stringify(object);
							if(self.bytesWrite === 0){
								_string = _start+_string;
							} else {
								_string = _separator+_string;
							}
							self.Transform.push(_string);
							self.bytesWrite += Buffer.byteLength(_string, self.encoding);
							callback();
						} catch(err){
							callback(err);
						}
					} else {
						callback(new Error('Incoming data type is Array, require data type is Object!'));
					}
					break;
				case 'undefined':
					callback();
					break;
				default:
					callback(new Error('Incoming data type is '+typeof(object)+', require data type is Object!'));
					break;
			}
		},
		flush(callback = function(){}){
			callback();
		},
		final(callback = function(){}){
			if(self.bytesWrite === 0){
				self.Transform.push(_start+_end);
			} else {
				self.Transform.push(_end);
			}
			self.bytesWrite += Buffer.byteLength(_end, self.encoding);
			callback();
		},
		highWaterMark: 64*1024,
		objectMode: true
	});
	return self.Transform;
}

let Parser = function(_start = '', _separator = '', _end = ''){
	if((typeof(_start) !== 'string') || (_start.length > 1) || (_start.match(/["{}]/))){ throw new Error('Argument start require type Char!'); }
	if((typeof(_separator) !== 'string') || (_separator.length > 1) || (_separator.match(/["{}]/))){ throw new Error('Argument separator require type Char!'); }
	if((typeof(_end) !== 'string') || (_end.length > 1) || (_end.match(/["{}]/))){ throw new Error('Argument end require type Char!'); }
	let self = this;
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
	self.Transform = new STREAM.Transform({
		transform(string, encoding = self.encoding, callback = function(){}) {
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
				self.bytesRead += _buffer.length;
				for(let s = 0; s < _buffer.length; s++){
					switch(_buffer[s]){
						case 0x7b:	// symbol {
							self.LeftBrace++;
							self.StringBufferArray.push(_buffer.slice(s,s+1)); 
							break;
						case 0x7d:	// symbol }
							self.RightBrace++;
							self.StringBufferArray.push(_buffer.slice(s,s+1)); 
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
								if(self.OpenQuotes){ self.OpenQuotes = false;} else if (self.LeftBrace !== 0) {
									self.OpenQuotes = true;
								}
							}
						default:
							if(self.LeftBrace !== 0) {
								self.StringBufferArray.push(_buffer.slice(s,s+1)); 
							}
							break;
					}
					if((self.LeftBrace !== 0) && (self.LeftBrace === self.RightBrace)){
						try{
							let _object = JSON.parse(Buffer.concat(self.StringBufferArray).toString(self.encoding));
							self.Transform.push(_object);
						} catch(err){
							error.push(err);
						} finally {
							self.clear();
						}
					} else if(self.LeftBrace < self.RightBrace){
						self.clear();
						error.push(new Error('Parsing error, clear buffer!'));
					}
				};
				if(error.length > 0){
					callback(error);
				} else {
					callback();
				}
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
					let c = JSON.parse(Buffer.concat(self.StringBufferArray).toString(self.encoding));
					callback([new Error('Raw object detected!')]);
				} catch(err){
					callback([err]);
				}
			}
		},
		highWaterMark: 64*1024,
		objectMode: true
	});
	return self.Transform;
}

module.exports.Stringifer = Stringifer;
module.exports.Parser = Parser;