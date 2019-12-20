
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

[See docs](https://github.com/siarheidudko/out/module-sergdudko_objectstream.html)

## Use
    
```
	let ObjectStream = require('@sergdudko/objectstream');
	let Stringifer = new ObjectStream.Stringifer();
	let Parser = new ObjectStream.Parser();
	
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

## TEST  
```
	let ObjectStream = require('@sergdudko/objectstream');

    const start = '[',
          sep = ',',
          end = ']';
          
    let objectstream = {
        Stringifer: new ObjectStream.Stringifer(start, sep, end),
        Parser: new ObjectStream.Parser(start, sep, end),
        Stringifer2: new ObjectStream.Stringifer(start, sep, end),
        Parser2: new ObjectStream.Parser(start, sep, end)
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

    for(let i = 0; i < 10; i++){
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
```
  
## LICENSE  
  
MIT  
