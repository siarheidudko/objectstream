"use strict"

require('mocha');
let ObjectStream = require('../../lib/index.js');
let mycompare = function(bool, done){
	if(bool){
		done();
	} else {
		done(new Error('Test failed!'));
	}
}

describe('Stringifer: Data event:', function() {
	let stringifer = new ObjectStream.Stringifer();
	it('stringifer.on("data", f(d){})', function(done){
		stringifer.once('error', function(_e){
			mycompare(false, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(true, done);
		}).once('finish', function(_d){
			mycompare(false, done);
		}).once('end', function(_d){
			mycompare(false, done);
		});
		stringifer.write({"a":1});
	});
});

describe('Stringifer: Error event:', function() {
	let stringifer = new ObjectStream.Stringifer();
	it('stringifer.on("error", f(e){})', function(done){
		stringifer.once('error', function(_e){
			mycompare(true, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(false, done);
		}).once('finish', function(_d){
			mycompare(false, done);
		}).once('end', function(_d){
			mycompare(false, done);
		});
		stringifer.write('}');
	});
});

describe('Stringifer: Finish event:', function() {
	let stringifer = new ObjectStream.Stringifer();
	it('stringifer.on("finish", f(d){})', function(done){
		stringifer.once('error', function(_e){
			mycompare(false, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(false, done);
		}).once('finish', function(_d){
			mycompare(true, done);
		}).once('end', function(_d){
			//mycompare(false, done);
		});
		stringifer.end();
	});
});

describe('Stringifer: End event:', function() {
	let stringifer = new ObjectStream.Stringifer();
	it('stringifer.on("end", f(d){})', function(done){
		stringifer.once('error', function(_e){
			mycompare(false, done);
		}).once('data', function(_d){
			if(_d)
				mycompare(false, done);
		}).once('finish', function(_d){
			//mycompare(true, done);
		}).once('end', function(_d){
			mycompare(true, done);
		});
		stringifer.end();
	});
});