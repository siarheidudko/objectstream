/**
 *	objectstream - test
 *	(c) 2019 by Siarhei Dudko.
 *
 */
 
let ObjectStream = require('./index.js');

const start = '[',
	  sep = ',',
	  end = ']';

let objectstream = {
	Stringifer: new (ObjectStream().Stringifer)(start, sep, end),
	Parser: new (ObjectStream().Parser)(start, sep, end)
};

const object = {
	number: 1234567890,
	string_en: "abcdefghijklmnopqrstuvwxyz",
	string_ru: "абвгдеёжзийклмнопртуфхцчшщъыьэюя",
	string_ascii: "\b\t\n\f\r\0\v",
	bool: true,
	array: ["a", 1, true],
	object: {a:"a", "b":1, c:true}
}
const string = JSON.stringify(object);

let nstring = '';
objectstream.Stringifer.on('data', function(data){
	if(data)
		nstring += data;
});
objectstream.Stringifer.on('error', function(data){
	console.error(data);
});
objectstream.Stringifer.on('end', function(data){
	if(data)
		nstring += data;
	console.table({in:start+string+end, out:nstring});
	if(start+string+end === nstring){
		console.log('******************** Test Stringifer is succeed! ********************');
	} else {
		console.error('****************** Test Stringifer is not succeed! ******************');
	}
});
objectstream.Stringifer.on('finish', function(){});

objectstream.Parser.on('data', function(data){
	console.log('in');
	console.log(object);
	console.log('out');
	console.log(data);
	let compare = function(_obj, _dt){
		if(typeof(_obj) === typeof(_dt)){
			switch(typeof(_obj)){
				case 'object':
					let flg = true;
					for(const key in _obj){
						if(compare(_obj[key], _dt[key]) === false){
							flg = false;
						}
					}
					return flg;
					break;
				case 'string':
				case 'boolean':
				case 'number':
					if(_obj === _dt){
						return true;
					} else {
						return false;
					}
					break;
				default:
					return false;
					break;
			}
		} else {
			return false;
		}
	}
	if(compare(object, data)){
		console.log('******************** Test Parser is succeed! ********************');
	} else {
		console.error('****************** Test Parser is not succeed! ******************');
	}
});
objectstream.Parser.on('error', function(data){ 
	console.error(data);
});
objectstream.Parser.on('end', function(){});
objectstream.Parser.on('finish', function(){});

objectstream.Stringifer.write();
objectstream.Stringifer.write(Object.assign(object));
objectstream.Stringifer.write();
objectstream.Stringifer.end();

objectstream.Parser.write(start);
objectstream.Parser.write();
objectstream.Parser.write(string);
objectstream.Parser.write();
objectstream.Parser.end(end);