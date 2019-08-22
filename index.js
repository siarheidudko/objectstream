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
		self.StringBuffer = '';
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
				let charArr = new Array();
				let error = new Array();
				charArr = _string.split('');
				self.bytesRead += Buffer.byteLength(_string, self.encoding);
				for(let s = 0; s < charArr.length; s++){
					if(charArr[s] !== null){
						switch(charArr[s]){
							case '{':
								self.LeftBrace++;
								self.StringBuffer = self.StringBuffer + charArr[s];
								break;
							case '}':
								self.RightBrace++;
								self.StringBuffer = self.StringBuffer + charArr[s];
								break;
							case '\b':
							case '\t':
							case '\n':
							case '\f':
							case '\r':
							case '\0':
							case '\v':
								if(self.OpenQuotes && (self.LeftBrace !== 0)){ 
									self.StringBuffer = self.StringBuffer + '\\u'+('0000' + charArr[s].charCodeAt(0).toString(16)).slice(-4);
								}
								break;
							case '"':
								if(self.StringBuffer[self.StringBuffer.length-1] !== '\\'){
									if(self.OpenQuotes){ self.OpenQuotes = false; } else if (self.LeftBrace !== 0) {
										self.OpenQuotes = true;
									}
								}
							default:
								if(self.LeftBrace !== 0) {
									self.StringBuffer = self.StringBuffer + charArr[s]; 
								}
								break;
						}
						if((self.LeftBrace !== 0) && (self.LeftBrace === self.RightBrace)){
							try{
								let _object = JSON.parse(self.StringBuffer);
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
			if(self.StringBuffer === ''){
				callback();
			} else {
				try{
					let c = JSON.parse(self.StringBuffer);
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