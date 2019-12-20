"use strict"

const start = '[',
	  sep = ',',
	  end = ']';

require('mocha');
const Lodash = require('lodash');
let ObjectStream = require('../index.js');

const object = require('../object.json');
let mycompare = function(bool, done){
	if(bool){
		done();
	} else {
		done(new Error('Test failed!'));
	}
}

describe('Performance:', function() {
	this.timeout(30000);
	let nstring = start;
	let rstring = '';
	let parser = new ObjectStream.Parser(start, sep, end);
	let parser2 = new ObjectStream.Parser(start, sep, end);
	let stringifer = new ObjectStream.Stringifer(start, sep, end);
	let stringifer2 = new ObjectStream.Stringifer(start, sep, end);
	let errcount = 0;
	let time1,time2,time3,time4, str;
	let s = true;
	it('performance', function(done){
		stringifer.on('data', function(d){
			time1 = Date.now();
		}).on('error', function(){
			errcount++;
		}).pipe(parser.on('data', function(d){
			time2 = Date.now();
			if((time2 - time1) > 2000){
				s = false;
			}
		})).on('error', function(){
			errcount++;
		}).pipe(stringifer2.on('data', function(d){
			time3 = Date.now();
			if((time3 - time2) > 2000){
				s = false;
			}
		})).on('error', function(){
			errcount++;
		}).pipe(parser2.on('data', function(d){
			time4 = Date.now();
			if((time4 - time3) > 2000){
				s = false;
			}
		})).on('error', function(){
			errcount++;
		}).on('end',function(){
			if((errcount === 0) && (s === true)){
				mycompare(true, done);
			} else {
				mycompare(false, done);
			}
		});

		for(let i = 0; i < 10; i++){
			stringifer.write(object);
		}
		stringifer.end();
	});
});