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
	Stringifer: new ObjectStream.Stringifer(start, sep, end),
	Parser: new ObjectStream.Parser(start, sep, end),
	Stringifer2: new ObjectStream.Stringifer(start, sep, end),
	Parser2: new ObjectStream.Parser(start, sep, end)
};

const object = require('./object.json');

let time1,time2,time3,time4, str;
objectstream.Parser.on('error', function(data){ console.log(data); });
objectstream.Stringifer.on('error', function(data){ console.log(data); });
objectstream.Parser2.on('error', function(data){ console.log(data); });
objectstream.Stringifer2.on('error', function(data){ console.log(data); });

objectstream.Stringifer.on('data', function(d){
	time1 = Date.now();
}).pipe(objectstream.Parser.on('data', function(d){
	time2 = Date.now();
	str = time2 - time1;
	console.log('STRING TO OBJECT '+str+'ms');
})).pipe(objectstream.Stringifer2.on('data', function(d){
	time3 = Date.now();
	str = time3 - time2;
	console.log('OBJECT TO STRING '+str+'ms');
})).pipe(objectstream.Parser2.on('data', function(d){
	time4 = Date.now();
	str = time4 - time3;
	console.log('STRING TO OBJECT 2 '+str+'ms');
}));

for(let i = 0; i < 10; i++){
	objectstream.Stringifer.write(object);
}
objectstream.Stringifer.end();