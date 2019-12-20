"use strict"

require('mocha');
let ObjectStream = require('../index.js');
let mycompare = function(bool, done){
	if(bool){
		done();
	} else {
		done(new Error('Test failed!'));
	}
}

describe('Parser: Data event:', function() {
	let parser = new ObjectStream.Parser();
	it('parser.on("data", f(d){})', function(done){
		parser.once('error', function(_e){
			mycompare(false, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(true, done);
		}).once('finish', function(_d){
			mycompare(false, done);
		}).once('end', function(_d){
			mycompare(false, done);
		});
		parser.write('{"a":1}');
	});
});

describe('Parser: Error event:', function() {
	let parser = new ObjectStream.Parser();
	it('parser.on("error", f(e){})', function(done){
		parser.once('error', function(_e){
			mycompare(true, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(false, done);
		}).once('finish', function(_d){
			mycompare(false, done);
		}).once('end', function(_d){
			mycompare(false, done);
		});
		parser.write('}');
	});
});

describe('Parser: Finish event:', function() {
	let parser = new ObjectStream.Parser();
	it('parser.on("finish", f(d){})', function(done){
		parser.once('error', function(_e){
			mycompare(false, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(false, done);
		}).once('finish', function(_d){
			mycompare(true, done);
		}).once('end', function(_d){
			//mycompare(false, done);
		});
		parser.end();
	});
});

describe('Parser: End event:', function() {
	let parser = new ObjectStream.Parser();
	it('parser.on("end", f(d){})', function(done){
		parser.once('error', function(_e){
			mycompare(false, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(false, done);
		}).once('finish', function(_d){
			//mycompare(true, done);
		}).once('end', function(_d){
			mycompare(true, done);
		});
		parser.end();
	});
});