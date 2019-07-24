
# sergdudko/objectstream
Creates a stream to convert json from string or convert json to drain. The stream is based on the incoming object stream.. 

[![npm](https://img.shields.io/npm/v/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![npm](https://img.shields.io/npm/dy/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![NpmLicense](https://img.shields.io/npm/l/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
![GitHub last commit](https://img.shields.io/github/last-commit/siarheidudko/objectstream.svg)
![GitHub release](https://img.shields.io/github/release/siarheidudko/objectstream.svg)
  
- Based on native methods of NodeJS
  

## Install  
  
```
	npm i objectstream --save
```
  

## Use
    
```
	let ObjectStream = require('objectstream');
	let objectStream = new ObjectStream();
	
	objectStream.Stringifer.on('data', function(data){
		..//data event return string (based on JSON.stringify method)
	});
	objectStream.Stringifer.on('error', function(err){
		..//error event return err (instanceof Error)
	});
	objectStream.Stringifer.on('end', function(){
		..//end event
	});
	objectStream.Stringifer.on('finish', function(){
		..//finish event
	});
	
	objectStream.Parser.on('data', function(data){
		..//data event return object (based on JSON.parse method)
	});
	objectStream.Parser.on('error', function(errors){
		..//error event return Array of error (instanceof Error)
		errors.forEach(function(err){
			..//err (instanceof Error)
		});
	});
	objectStream.Parser.on('end', function(){
		..//end event
	});
	objectStream.Parser.on('finish', function(){
		..//finish event
	});
	
	objectstream.Stringifer.write(1);		//will cause an error event
	objectstream.Stringifer.write({w:1});	//will cause an data event {"w":1}
	objectstream.Stringifer.end({w:1});		//will cause an data event {"w":1}, end event, finish event

	objectstream.Parser.write('@');				//will cause an error event
	objectstream.Parser.write('{"w":1}\r{"b":2, "a": false}, [{"f":3}, {"c":]10 }{"g":1}{}{u:0}');		//will cause an data event {w:1} {b:2, a: false} {f:3} {g:1} {}, error event 
	objectstream.Parser.end('{"w":1}');			//will cause an data event {"w":1}, end event, finish event
```
    
## Alternative  
```
	let objectStream = require('objectstream')();
	let Stringifer = new objectStream.Stringifer();
	let Parser = new objectStream.Parser();	
	
	Stringifer.on('data', function(data){
		..//data event return string (based on JSON.stringify method)
	});
	Stringifer.on('error', function(err){
		..//error event return err (instanceof Error)
	});
	Stringifer.on('end', function(){
		..//end event
	});
	Stringifer.on('finish', function(){
		..//finish event
	});
	
	Parser.on('data', function(data){
		..//data event return object (based on JSON.parse method)
	});
	Parser.on('error', function(errors){
		..//error event return Array of error (instanceof Error)
		errors.forEach(function(err){
			..//err (instanceof Error)
		});
	});
	Parser.on('end', function(){
		..//end event
	});
	Parser.on('finish', function(){
		..//finish event
	});
	
	Stringifer.write(1);		//will cause an error event
	Stringifer.write({w:1});	//will cause an data event {"w":1}
	Stringifer.end({w:1});		//will cause an data event {"w":1}, end event, finish event

	Parser.write('@');				//will cause an error event
	Parser.write('{"w":1}\r{"b":2, "a": false}, [{"f":3}, {"c":]10 }{"g":1}{}{u:0}');		//will cause an data event {w:1} {b:2, a: false} {f:3} {g:1} {}, error event 
	Parser.end('{"w":1}');			//will cause an data event {"w":1}, end event, finish event
```
  
## LICENSE  
  
MIT  
