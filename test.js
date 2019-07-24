/**
 *	objectstream - test
 *	(c) 2019 by Siarhei Dudko.
 *
 */
 
let ObjectStream = require('./index.js');

//let objectstream = new ObjectStream();
let objectstream = {
	Stringifer: new (ObjectStream().Stringifer)(),
	Parser: new (ObjectStream().Parser)()
};

objectstream.Stringifer.on('data', function(data){
	console.log(data);
});
objectstream.Stringifer.on('error', function(data){
	console.error(data.message);
});
objectstream.Stringifer.on('end', function(){
	console.error('END: Stringifer!');
});
objectstream.Stringifer.on('finish', function(){
	console.error('FIN: Stringifer!');
});
objectstream.Parser.on('data', function(data){
	console.log(data);
});
objectstream.Parser.on('error', function(data){
	data.forEach(function(err){
		console.error(err.message);
	});
});
objectstream.Parser.on('end', function(){
	console.error('END: Parser!');
});
objectstream.Parser.on('finish', function(){
	console.error('FIN: Parser!');
});


objectstream.Stringifer.write(1);	//false
objectstream.Stringifer.write({w:1});	//{"w":1}
objectstream.Stringifer.end({w:1});	//{"w":1}

objectstream.Parser.write('@');	//false
objectstream.Parser.write('{"w":1}\r{"b":2, "a": false}, [{"f":3}, {"c":]10 }{"g":1}{}{u:0}'); //{w:1} {b:2, a: false} {f:3} {g:1} {}
objectstream.Parser.end('{"w":1}');	//{w:1}

/* Output:
	Incoming data type is number, require data type is Object!
	{"w":1}
	{"w":1}
	{ w: 1 }
	{ b: 2, a: false }
	{ f: 3 }
	{ g: 1 }
	{}
	Unexpected token ] in JSON at position 5
	Unexpected token u in JSON at position 1
	{ w: 1 }
	FIN: Stringifer!
	END: Stringifer!
	FIN: Parser!
	END: Parser!
	Incoming data type is number, require data type is Object!
*/