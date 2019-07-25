/**
 *	objectstream - test
 *	(c) 2019 by Siarhei Dudko.
 *
 */
 
let ObjectStream = require('./index.js');

let objectstream = {
	Stringifer: new (ObjectStream().Stringifer)(),
	Parser: new (ObjectStream().Parser)(),
	Stringifer2: new (ObjectStream().Stringifer)(),
	Parser2: new (ObjectStream().Parser)()
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

objectstream.Stringifer.on('data', function(data){
	console.table({in:string, out:data});
	if(data === string){
		console.log('******************** Test Stringifer is succeed! ********************');
	} else {
		console.error('****************** Test Stringifer is not succeed! ******************');
	}
}).on('error', function(data){ console.error(data); });


objectstream.Parser.on('error', function(data){ console.log(data); });
objectstream.Stringifer2.on('error', function(data){ console.log(data); });
objectstream.Parser2.on('error', function(data){ console.log(data); });

objectstream.Parser.pipe(objectstream.Stringifer2).pipe(objectstream.Parser2).pipe(objectstream.Stringifer);

objectstream.Parser.end(string);