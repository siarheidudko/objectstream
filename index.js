/**
 *	objectstream
 *	(c) 2019 by Siarhei Dudko.
 *
 */
 
'use strict'

let STREAM = require('stream');

let Stringifer = function(){
	let self = this;
	self.Transform = new STREAM.Transform({
		transform(object, encoding, callback) {
			if(typeof(object) === 'object'){
				if(!Array.isArray(object)){
					try{
						self.Transform.push(JSON.stringify(object));
						return callback();
					} catch(err){
						return callback(err);
					}
				} else {
					return callback(new Error('Incoming data type is Array, require data type is Object!'));
				}
			} else {
				return callback(new Error('Incoming data type is '+typeof(object)+', require data type is Object!'));
			}
		},
		highWaterMark: 64*1024,
		objectMode: true
	});
	return self.Transform;
}

let Parser = function(){
	let self = this;
	self.clear = function(){
		self.StringBuffer = '';
		self.LeftBrace = 0;
		self.RightBrace = 0;
		self.OpenQuotes = false;
		return;
	}
	self.clear();
	self.Transform = new STREAM.Transform({
		transform(string, encoding, callback) {
			let charArr = new Array();
			let error = new Array();
			if(string instanceof Buffer){ 
				charArr = string.toString().split(''); 
			} else if(typeof(string) === 'string'){
				charArr = string.split('');
			}
			if(charArr.length > 0){
				for(let s = 0; s < charArr.length; s++){
					switch(charArr[s]){
						case '{':
							self.LeftBrace++;
							self.StringBuffer = self.StringBuffer + charArr[s];
							break;
						case '}':
							self.RightBrace++;
							self.StringBuffer = self.StringBuffer + charArr[s];
							break;
						case '\0':
					//	case '\a':
						case '\b':
						case '\t':
						case '\n':
						case '\v':
						case '\f':
						case '\r':
					//	case '\e':
							if(self.OpenQuotes && (self.LeftBrace !== 0)){ self.StringBuffer = self.StringBuffer + charArr[s]; }
							break;
						case '"':
							if(self.OpenQuotes){ self.OpenQuotes = false; } else if (self.LeftBrace !== 0) {
								self.OpenQuotes = true;
							}
						default:
							if(self.LeftBrace !== 0) { self.StringBuffer = self.StringBuffer + charArr[s]; }
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
					if(s === (charArr.length -1)){
						if(error.length > 0){
							return callback(error);
						} else {
							return callback();
						}
					}
				};
			} else {
				return callback(new Error('Incoming data type is '+typeof(charArr)+', require data type is String or Buffer!'));
			}
		},
		highWaterMark: 64*1024,
		objectMode: true
	});
	return self.Transform;
}

let ObjectStream = function(){
	let self = this;
	if(this){
		self.Stringifer = new Stringifer();
		self.Parser = new Parser();
		return self;
	} else {
		return {
			Stringifer: Stringifer,
			Parser: Parser
		};
	}
}

module.exports = ObjectStream;