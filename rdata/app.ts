'use strict';

/*jshint esversion: 6, node:true, unused:false, varstmt:true */

const archiver = require('archiver');
const zlib = require('zlib');
const fs = require('fs');
const async = require("async");
const Stream = require("stream");
const temp = require("temp");
const Transform = require("stream").Transform;
const inherits = require("util").inherits;
const Null = Symbol("Null value");

temp.track();