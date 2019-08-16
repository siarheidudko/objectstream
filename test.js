/**
 *	objectstream - test
 *	(c) 2019 by Siarhei Dudko.
 *
 */
 
let ObjectStream = require('./index.js');

let objectstream = {
	Stringifer: new (ObjectStream().Stringifer)(),
	Parser: new (ObjectStream().Parser)()
};

objectstream.Stringifer.on('data', function(data){
	if(data)
		console.log(data);
});
objectstream.Stringifer.on('error', function(data){
	console.error(data.message);
});
objectstream.Stringifer.on('end', function(data){
	if(data)
		console.error(data);
	console.error('END: Stringifer!');
});
objectstream.Stringifer.on('finish', function(){
	console.error('FIN: Stringifer!');
});
objectstream.Parser.on('data', function(data){
	if(data)
		console.log(data);
});
objectstream.Parser.on('error', function(data){
	data.forEach(function(err){
		console.error(err.message);
	});
});
objectstream.Parser.on('end', function(data){
	if(data)
		console.error(data);
	console.error('END: Parser!');
});
objectstream.Parser.on('finish', function(){
	console.error('FIN: Parser!');
});


objectstream.Stringifer.write(1);																//	Incoming data type is number, require data type is Object!
objectstream.Stringifer.write({w:"fdsfds"});													//	{"w":"fdsfds"}
objectstream.Stringifer.write({w:1});															//	{"w":1}
objectstream.Stringifer.end({ b: 'тестовая строка\b\t\n\f\r\0\v\a\e' });						//	{"b":"тестовая строка\b\t\n\f\r\u0000\u000bae"}

objectstream.Parser.write('@');	//false
objectstream.Parser.write('{"w":1}\r{"b":2, "a": false}, [{"f":3}, {"c":]10 }{"g":1}{}{u:0}'); 	/*	{ w: 1 } 
																									{ b: 2, a: false } 
																									{ f: 3 } 
																									{ g: 1 } 
																									{} 
																									Unexpected token ] in JSON at position 5 
																									Unexpected token u in JSON at position 1 */
objectstream.Parser.write('{"b":"');															//	go to next line
objectstream.Parser.write('тестовая строка\b\t\n\f\r\0\v"}');									//	{ b: 'тестовая строка\b\t\n\f\r\u0000\u000b' }
objectstream.Parser.end('{"test":');															//	Unexpected end of JSON input

/* Output:
	Incoming data type is number, require data type is Object!
	{"w":"fdsfds"}
	{"w":1}
	{"b":"тестовая строка\b\t\n\f\r\u0000\u000bae"}
	{ w: 1 }
	{ b: 2, a: false }
	{ f: 3 }
	{ g: 1 }
	{}
	Unexpected token ] in JSON at position 5
	Unexpected token u in JSON at position 1
	{ b: 'тестовая строка\b\t\n\f\r\u0000\u000b' }
	FIN: Stringifer!
	Unexpected end of JSON input
	FIN: Parser!
	END: Stringifer!
	END: Parser!
*/