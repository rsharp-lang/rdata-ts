'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*jshint esversion: 6, node:true, unused:false, varstmt:true */
var archiver = require('archiver');
var zlib = require('zlib');
var fs = require('fs');
var async = require("async");
var Stream = require("stream");
var temp = require("temp");
var Transform = require("stream").Transform;
var inherits = require("util").inherits;
var Null = Symbol("Null value");
temp.track();
function ObjectWriter(stream, options) {
    options = options || {};
    if (options.gzip) {
        var gz = zlib.createGzip();
        gz.pipe(stream);
        this.stream = gz;
    }
    else {
        this.stream = stream;
    }
}
var NILSXP = 0; /* nil = NULL */
var SYMSXP = 1; /* symbols */
var LISTSXP = 2; /* lists of dotted pairs */
var CLOSXP = 3; /* closures */
var ENVSXP = 4; /* environments */
var PROMSXP = 5; /* promises: [un]evaluated closure arguments */
var LANGSXP = 6; /* language constructs (special lists) */
var SPECIALSXP = 7; /* special forms */
var BUILTINSXP = 8; /* builtin non-special forms */
var CHARSXP = 9; /* "scalar" string type (internal only)*/
var LGLSXP = 10; /* logical vectors */
var INTSXP = 13; /* integer vectors */
var REALSXP = 14; /* real variables */
var CPLXSXP = 15; /* complex variables */
var STRSXP = 16; /* string vectors */
var DOTSXP = 17; /* dot-dot-dot object */
var ANYSXP = 18; /* make "any" args work.
           Used in specifying types for symbol
           registration to mean anything is okay  */
var VECSXP = 19; /* generic vectors */
var EXPRSXP = 20; /* expressions vectors */
var BCODESXP = 21; /* byte code */
var EXTPTRSXP = 22; /* external pointer */
var RAWSXP = 24; /* raw bytes */
var S4SXP = 25; /* S4, non-vector */
var FUNSXP = 99; /* Closure or Builtin or Special */
var NILVALUESXP = 254;
var REFSXP = 255;
var LATIN1_MASK = (1 << 2);
var UTF8_MASK = (1 << 3);
var ASCII_MASK = (1 << 6);
var IS_OBJECT_BIT_MASK = (1 << 8);
var HAS_ATTR_BIT_MASK = (1 << 9);
var HAS_TAG_BIT_MASK = (1 << 10);
var NA_INT = -1 * Math.pow(2, 31);
var NA_STRING = -1;
// This is a special R constant value
var NA_REAL = new Buffer("7ff00000000007a2", "hex");
var packed_version = function (v, p, s) {
    return s + (p * 256) + (v * 65536);
};
var encode_int = function (value) {
    var buf = new Buffer(4);
    buf.writeInt32BE(value);
    return buf;
};
var encode_real = function (value) {
    var buf = new Buffer(8);
    buf.writeDoubleBE(value);
    return buf;
};
var encode_flags = function (base_type, options) {
    if (!options) {
        options = {};
    }
    var flags = base_type;
    if (options.is_object) {
        flags |= IS_OBJECT_BIT_MASK;
    }
    if (options.has_attributes) {
        flags |= HAS_ATTR_BIT_MASK;
    }
    if (options.has_tag) {
        flags |= HAS_TAG_BIT_MASK;
    }
    return flags;
};
var writeHeader = function () {
    this.write(new Buffer("RDX2\nX\n"));
    this.write(encode_int(2));
    this.write(encode_int(packed_version(3, 0, 0)));
    this.write(encode_int(packed_version(2, 3, 0)));
    return Promise.resolve();
};
var writeValue = function (value, type, length) {
    var self = this;
    // When we pass a buffer stream to the writeValue, we assume
    // that we are taking a stream of encoded bytes
    // If we wish to rewrite the length portion of the
    // written out bytes, (i.e. the length is defined)
    // we should modify the stream of bytes on the fly
    if (value instanceof Stream.Readable && !value._readableState.objectMode) {
        var target_stream_1 = value;
        if (typeof length !== "undefined") {
            target_stream_1 = value.pipe(new LengthRewriter(length));
        }
        target_stream_1.pipe(self.stream, { end: false });
        return new Promise(function (resolve, reject) {
            target_stream_1.on("end", resolve);
            value.on("error", reject);
        });
    }
    var value_written = null;
    if (type === "string") {
        value_written = this.stringVector(value);
    }
    if (type === "int") {
        value_written = this.intVector(value);
    }
    if (type === "real") {
        value_written = this.realVector(value);
    }
    if (type === "logical") {
        value_written = this.logicalVector(value);
    }
    if (type.type === "dataframe") {
        value_written = this.dataFrame(value, type.keys, type.types, (type.attributes ? { attributes: type.attributes } : {}));
    }
    if (!value_written) {
        value_written = Promise.reject(new Error("No valid data type given"));
    }
    return value_written;
};
var write_vector = function (vector, method) {
    var self = this;
    if (vector instanceof Stream && vector._readableState.objectMode) {
        var byte_pipe_1 = vector.pipe(new ByteWriter(method.bind(self)));
        byte_pipe_1.pipe(this.stream, { end: false });
        return new Promise(function (resolve) {
            // We want to specifically end
            // the promise once we have no more
            // readable elements left in the queue
            byte_pipe_1.on("end", resolve);
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            async.eachOfSeries(vector, function (el, idx, callback) {
                self.write(method(el));
                process.nextTick(callback);
            }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }).catch(function (err) {
            console.log(err);
        });
    }
};
var stringScalar = function (string) {
    // NA val - 0000 0009 ffff ffff
    var type = encode_int(CHARSXP | (ASCII_MASK << 12));
    if (string === null) {
        type = encode_int(CHARSXP);
        return Buffer.concat([type, encode_int(NA_STRING)]);
    }
    var bytes = new Buffer(string);
    var length = encode_int(bytes.length);
    return Buffer.concat([type, length, bytes]);
};
var realScalar = function (real) {
    if (real === null) {
        return NA_REAL;
    }
    return encode_real(real);
};
var intScalar = function (int) {
    if (int === null) {
        int = NA_INT;
    }
    if (!Number.isFinite(int)) {
        int = NA_INT;
    }
    return encode_int(int);
};
var logicalScalar = function (bool) {
    if (bool === null) {
        return encode_int(NA_INT);
    }
    return encode_int(bool ? 1 : 0);
};
var stringVector = function (vector) {
    var self = this;
    this.write(encode_int(encode_flags(STRSXP)));
    this.write(encode_int(vector.length || vector.total));
    return write_vector.bind(self)(vector, stringScalar);
};
var realVector = function (vector) {
    var self = this;
    this.write(encode_int(encode_flags(REALSXP)));
    this.write(encode_int(vector.length || vector.total));
    return write_vector.bind(self)(vector, realScalar);
};
var intVector = function (vector) {
    var self = this;
    this.write(encode_int(encode_flags(INTSXP)));
    this.write(encode_int(vector.length || vector.total));
    return write_vector.bind(self)(vector, intScalar);
};
var logicalVector = function (vector) {
    var self = this;
    this.write(encode_int(encode_flags(LGLSXP)));
    this.write(encode_int(vector.length || vector.total));
    return write_vector.bind(self)(vector, logicalScalar);
};
var symbol = function (string) {
    this.write(encode_int(encode_flags(SYMSXP)));
    this.write(stringScalar(string));
    return Promise.resolve();
};
var listPairs = function (pairs, keys, types) {
    var self = this;
    return new Promise(function (resolve, reject) {
        async.eachOfSeries(keys, function (key, idx, callback) {
            self.write(encode_int(encode_flags(LISTSXP, { has_tag: true })));
            symbol.call(self, key);
            writeValue.call(self, pairs[key], types[idx]).then(callback).catch(callback);
        }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                self.write(encode_int(NILVALUESXP));
                resolve();
            }
        });
    });
};
var environment = function (pairs, types_map) {
    var self = this;
    var keys = Object.keys(pairs);
    var types = keys.map(function (key) { return types_map[key]; });
    return self.listPairs(pairs, keys, types);
};
var consume_frame_stream = function (objects, keys, types, options) {
    var self = this;
    var outputs = keys.map(function (key, idx) {
        var stream = new Stream.PassThrough({ objectMode: true });
        var output = new ObjectWriter(temp.createWriteStream());
        output.path = output.stream.path;
        // The streams we write out have incorrect
        // length values, but they get rewritten
        // once we put the stream back together again
        var promise = writeValue.call(output, stream, types[idx], 0);
        promise.catch(function (err) { return console.log(err); });
        promise.then(function () { return output.stream.end(); });
        output.promise = new Promise(function (resolve, reject) {
            output.stream.on("finish", resolve);
            output.stream.on("error", reject);
        });
        output.instream = stream;
        return output;
    });
    var counter = new ObjectCounter();
    objects.setMaxListeners(2 * outputs.length);
    outputs.forEach(function (output, idx) { (idx === 0 ? objects.pipe(counter) : objects).pipe(new KeyExtractor(keys[idx])).pipe(output.instream); });
    return Promise.all(outputs.map(function (output) { return output.promise; })).then(function () {
        var filenames = outputs.map(function (output) { return output.path; });
        var streams = filenames.map(function (file) { return fs.createReadStream(file); });
        var frame = {};
        keys.forEach(function (key, idx) {
            frame[key] = streams[idx];
        });
        options.length = counter.total;
        return self.dataFrame(frame, keys, types, options);
    });
};
var extract_length = function (stream) {
    return new Promise(function (resolve, reject) {
        stream.on("error", reject);
        stream.once("data", function (dat) {
            if (dat.length < 8) {
                reject(new Error("Didn't read enough bytes in"));
            }
            else {
                resolve(dat.readInt32BE(4));
            }
        });
        stream.pause();
    });
};
var dataFrame = function (object, keys, types, options) {
    var self = this;
    if (!options) {
        options = {};
    }
    var length = options.length;
    if (object instanceof Stream && object._readableState.objectMode) {
        return (consume_frame_stream.bind(self))(object, keys, types, options);
    }
    this.write(encode_int(encode_flags(VECSXP, { is_object: true, has_attributes: true })));
    this.write(encode_int(keys.length));
    if (length === null || typeof length === "undefined") {
        length = object[keys[0]].length;
    }
    if ((length === null || typeof length === "undefined") && object[keys[0]] instanceof Stream) {
        length = extract_length(object[keys[0]]);
    }
    else {
        length = Promise.resolve(length);
    }
    length.then(function (val) { return console.log("Writing data frame of length ", val); });
    return new Promise(function (resolve, reject) {
        async.eachOfSeries(keys, function (column, idx, callback) {
            writeValue.call(self, object[column], types[idx], options.length).then(callback);
        }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                length.then(function (length_val) {
                    var attributes = { "names": keys, "class": ["data.frame"], "row.names": [NA_INT, -1 * length_val] };
                    var attribute_names = ["names", "row.names", "class"];
                    var attribute_types = ["string", "int", "string"];
                    if (options.attributes) {
                        options.attributes.names.forEach(function (key, idx) {
                            if (attribute_names.indexOf(key) >= 0) {
                                return;
                            }
                            attribute_names.push(key);
                            attribute_types.push(options.attributes.types[idx]);
                            attributes[key] = options.attributes.values[key];
                        });
                    }
                    return self.listPairs(attributes, attribute_names, attribute_types);
                }).then(resolve);
            }
        });
    });
};
ObjectWriter.prototype.write = function (buffer) {
    this.stream.write(buffer);
};
ObjectWriter.prototype.finish = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.stream.on("close", resolve);
        self.stream.on("finish", resolve);
        self.stream.on("error", reject);
        self.stream.end();
    });
};
var generate_description = function (filedata, prefix) {
    var title = filedata.title;
    var version = filedata.version;
    if (prefix) {
        prefix = prefix + ".";
    }
    var now = new Date().toISOString().split('T')[0];
    var date = now;
    var description = "Package: " + prefix + title + "\nVersion: " + version + "\nDate: " + date + "\nDepends: R (>= 3.1.0)\nDescription: " + title + "\nTitle: " + title + "\nLazyData: yes\nNeedsCompilation: yes";
    return description;
};
var create_package = function (filedata, package_info) {
    var data_filename = package_info.data_filename;
    var description = package_info.description;
    var package_prefix = package_info.prefix || '';
    var gz = zlib.createGzip();
    var archive = archiver('tar', { store: true });
    archive.pipe(gz);
    archive.append(fs.createReadStream(filedata.path), { name: filedata.title + "/data/" + data_filename + ".rda" });
    archive.append('', { name: filedata.title + "/NAMESPACE" });
    archive.append(generate_description(filedata, package_prefix), { name: filedata.title + "/DESCRIPTION" });
    archive.finalize();
    return gz;
};
var LengthRewriter = /** @class */ (function (_super) {
    __extends(LengthRewriter, _super);
    function LengthRewriter(length, options) {
        if (options === void 0) { options = { objectMode: false }; }
        var _this = _super.call(this, options) || this;
        options.objectMode = false;
        _this.written_count = 0;
        _this.length = length;
        return _this;
    }
    LengthRewriter.prototype._transform = function (buf, encoding, callback) {
        var written_count = this.written_count;
        if (written_count <= 4) {
            var offset = 4 - written_count;
            if (offset >= 0 && offset < buf.length) {
                buf.writeInt32BE(this.length || 0, offset);
            }
            written_count += buf.length;
        }
        this.written_count = written_count;
        this.push(buf);
        callback();
    };
    ;
    return LengthRewriter;
}(Transform));
function KeyExtractor(key, options) {
    if (!(this instanceof KeyExtractor)) {
        return new KeyExtractor(key, options);
    }
    if (!options) {
        options = {};
    }
    options.objectMode = true;
    console.log("Extracting key", key);
    this.key = key;
    Transform.call(this, options);
}
inherits(KeyExtractor, Transform);
KeyExtractor.prototype._transform = function _transform(obj, encoding, callback) {
    this.push(obj[this.key] || Null);
    callback();
};
function ByteWriter(transform, options) {
    if (!(this instanceof ByteWriter)) {
        return new ByteWriter(transform, options);
    }
    if (!options) {
        options = {};
    }
    options.objectMode = true;
    this.transform = transform;
    Transform.call(this, options);
    this._readableState.objectMode = false;
}
inherits(ByteWriter, Transform);
ByteWriter.prototype._transform = function _transform(obj, encoding, callback) {
    this.push(this.transform(obj === Null ? null : obj));
    callback();
};
var ObjectCounter = /** @class */ (function (_super) {
    __extends(ObjectCounter, _super);
    function ObjectCounter(options) {
        if (options === void 0) { options = { objectMode: true }; }
        var _this = _super.call(this, options) || this;
        options.objectMode = true;
        _this.total = 0;
        return _this;
    }
    ObjectCounter.prototype._transform = function (obj, encoding, callback) {
        this.total += 1;
        this.push(obj);
        callback();
    };
    ;
    return ObjectCounter;
}(Transform));
//# sourceMappingURL=rdata.js.map