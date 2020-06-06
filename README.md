
# @sergdudko/objectstream
Creates a stream to convert json from string or convert json to drain. The stream is based on the incoming object stream.. 

[![npm](https://img.shields.io/npm/v/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![npm](https://img.shields.io/npm/dy/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
[![NpmLicense](https://img.shields.io/npm/l/@sergdudko/objectstream.svg)](https://www.npmjs.com/package/@sergdudko/objectstream)
![GitHub last commit](https://img.shields.io/github/last-commit/siarheidudko/objectstream.svg)
![GitHub release](https://img.shields.io/github/release/siarheidudko/objectstream.svg)
  
- Based on native methods of NodeJS
  

## Install  
  
```
	npm i @sergdudko/objectstream --save
```

## Docs

[See docs](https://siarheidudko.github.io/objectstream/index.html)

## Use
    
```
	let ObjectStream = require('@sergdudko/objectstream');
	let stringifer = new ObjectStream.Stringifer();
	let parser = new ObjectStream.Parser();
	
	stringifer.on('data', function(data){
		//data event return string (based on JSON.stringify method)
	});
	stringifer.on('error', function(err){
		//error event return err (instanceof Error)
	});
	stringifer.on('end', function(data){
		//end event
	});
	stringifer.on('finish', function(){
		//finish event
	});
	
	parser.on('data', function(data){
		//data event return object (based on JSON.parse method)
	});
	parser.on('error', function(errors){
		//error event return Array of error (instanceof Error)
		errors.forEach(function(err){
			//err (instanceof Error)
		});
	});
	parser.on('end', function(data){
		//end event
	});
	parser.on('finish', function(){
		//finish event
	});
	
	stringifer.write(1);		//Error event: Error: Incoming data type is number, require data type is pure Object!
	stringifer.write({w:1});	//Data event: {"w":1}
	stringifer.end({w:1});		//Data event: {"w":1}, End event, Finish event

	parser.write('@');				//Error event: Error: Unexpected token @ in JSON at position 0
	parser.write('{"w":1}\r{"b":2, "a": false}, [{"f":3}, {"c":]10 }{"g":1}{}{u:0}');		
	//Data event: {w:1}, 
	//Data event: {b:2, a: false}, 
	//Data event: {f:3}, 
	//Data event: {g:1}, 
	//Data event: {}, 
	//Error event: 
	//Error: Unexpected token , in JSON at position 27
	//Error: Unexpected token   in JSON at position 28
	//Error: Unexpected token [ in JSON at position 29
	//Error: Unexpected token , in JSON at position 37
	//Error: Unexpected token   in JSON at position 38
	//SyntaxError: Unexpected token ] in JSON at position 5
	//SyntaxError: Unexpected token u in JSON at position 1
	parser.end('{"w":1}');			//Data event: {"w":1}, End event, Finish event
```

## TEST  
```
	let ObjectStream = require('@sergdudko/objectstream');

    const start = '[',
          sep = ',',
          end = ']';
          
    let stringifer = new ObjectStream.Stringifer(start, sep, end),
        parser = new ObjectStream.Parser(start, sep, end),
        stringifer2 = new ObjectStream.Stringifer(start, sep, end),
        parser2 = new ObjectStream.Parser(start, sep, end);

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

    stringifer.on('data', function(data){
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


    parser.on('error', function(data){ console.log(data); });
    stringifer2.on('error', function(data){ console.log(data); });
    parser2.on('error', function(data){ console.log(data); });

    parser.pipe(stringifer2).pipe(parser2).pipe(stringifer);

    for(let i = 0; i < 10; i++){
        for(let j = 0; j < Buffer.byteLength(buffer); j++){
            parser.write(buffer.slice(j, j+1));
        }
        if(i === 0){
            nstring += string;
        } else {
            nstring += sep+string;
        }
    }
    nstring += end;
    parser.end();
```
  
## LICENSE  
  
MIT  
