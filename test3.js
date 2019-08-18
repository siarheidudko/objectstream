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
	Parser: new (ObjectStream().Parser)(start, sep, end),
	Stringifer2: new (ObjectStream().Stringifer)(start, sep, end),
	Parser2: new (ObjectStream().Parser)(start, sep, end)
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
const buffer = Buffer.from(string);
let nstring = start;
let rstring = '';

objectstream.Stringifer.on('data', function(data){
	if(data)
		rstring += data;
}).on('end', function(data){
	if(data)
		rstring += data;
	console.log('in :', JSON.parse(nstring));
	console.log('\r\nout:',JSON.parse(rstring));
	if((nstring === rstring)){
		console.log('\r\n******************** Test Pipe is succeed! ********************');
	} else {
		console.error('\r\n****************** Test Pipe is not succeed! ******************');
	}
}).on('error', function(data){ console.error(data); });


objectstream.Parser.on('error', function(data){ console.log(data); });
objectstream.Stringifer2.on('error', function(data){ console.log(data); });
objectstream.Parser2.on('error', function(data){ console.log(data); });

objectstream.Parser.pipe(objectstream.Stringifer2).pipe(objectstream.Parser2).pipe(objectstream.Stringifer);

for(let i = 0; i < 10000; i++){
	for(let j = 0; j < Buffer.byteLength(buffer); j++){
		objectstream.Parser.write(buffer.slice(j, j+1));
	}
	if(i === 0){
		nstring += string;
	} else {
		nstring += sep+string;
	}
}
nstring += end;
objectstream.Parser.end();