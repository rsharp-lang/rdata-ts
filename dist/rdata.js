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
/**
 * nil = NULL
*/
var NILSXP = 0;
/**
 * symbols
*/
var SYMSXP = 1;
/**
 * lists of dotted pairs
*/
var LISTSXP = 2;
/**
 * closures
*/
var CLOSXP = 3;
/**
 * environments
*/
var ENVSXP = 4;
/**
 * promises: [un]evaluated closure arguments
*/
var PROMSXP = 5;
/**
 * language constructs (special lists)
*/
var LANGSXP = 6;
/**
 * special forms
*/
var SPECIALSXP = 7;
/**
 * builtin non-special forms
*/
var BUILTINSXP = 8;
/**
 * "scalar" string type (internal only)
*/
var CHARSXP = 9;
/**
 * logical vectors
*/
var LGLSXP = 10;
/**
 * integer vectors
*/
var INTSXP = 13;
/**
 * real variables
*/
var REALSXP = 14;
/**
 * complex variables
*/
var CPLXSXP = 15;
/**
 * string vectors
*/
var STRSXP = 16;
/**
 * dot-dot-dot object
*/
var DOTSXP = 17;
/**
 * make "any" args work.
 * Used in specifying types for symbol
 * registration to mean anything is okay
*/
var ANYSXP = 18;
/**
 * generic vectors
*/
var VECSXP = 19;
/**
 * expressions vectors
*/
var EXPRSXP = 20;
/**
 * byte code
*/
var BCODESXP = 21;
/**
 * external pointer
*/
var EXTPTRSXP = 22;
/**
 * raw bytes
*/
var RAWSXP = 24;
/**
 * S4, non-vector
*/
var S4SXP = 25;
/**
 * Closure or Builtin or Special
*/
var FUNSXP = 99;
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
/**
 * This is a special R constant value
*/
var NA_REAL = new Buffer("7ff00000000007a2", "hex");
var ObjectWriter = /** @class */ (function () {
    function ObjectWriter(stream, options) {
        if (options === void 0) { options = { gzip: true }; }
        var _this = this;
        this.stream = stream;
        this.write_vector = function (vector, method) { return encoder.write_vector(_this, vector, method); };
        this.writeValue = function (value, type, length) { return encoder.save.writeValue(_this, value, type, length); };
        this.dataFrame = function (object, keys, types, options) {
            if (options === void 0) { options = {}; }
            return encoder.dataFrame(_this, object, keys, types, options);
        };
        if (options.gzip) {
            var gz = zlib.createGzip();
            gz.pipe(stream);
            this.stream = gz;
        }
        else {
            this.stream = stream;
        }
    }
    ObjectWriter.prototype.write = function (buffer) {
        this.stream.write(buffer);
    };
    ;
    ObjectWriter.prototype.stringVector = function (vector) {
        var self = this;
        this.write(encoder.encode_int(encoder.encode_flags(STRSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.stringScalar);
    };
    ;
    ObjectWriter.prototype.realVector = function (vector) {
        var self = this;
        this.write(encoder.encode_int(encoder.encode_flags(REALSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.realScalar);
    };
    ;
    ObjectWriter.prototype.intVector = function (vector) {
        var self = this;
        this.write(encoder.encode_int(encoder.encode_flags(INTSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.intScalar);
    };
    ;
    ObjectWriter.prototype.logicalVector = function (vector) {
        var self = this;
        this.write(encoder.encode_int(encoder.encode_flags(LGLSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.logicalScalar);
    };
    ;
    ObjectWriter.prototype.listPairs = function (pairs, keys, types) {
        return encoder.listPairs(this, pairs, keys, types);
    };
    ;
    ObjectWriter.prototype.environment = function (pairs, types_map) {
        return encoder.environment(this, pairs, types_map);
    };
    ;
    ObjectWriter.prototype.writeHeader = function () {
        return encoder.save.writeHeader(this);
    };
    ;
    ObjectWriter.prototype.finish = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.stream.on("close", resolve);
            self.stream.on("finish", resolve);
            self.stream.on("error", reject);
            self.stream.end();
        });
    };
    ;
    return ObjectWriter;
}());
var package;
(function (package) {
    function generate_description(filedata, prefix) {
        var title = filedata.title;
        var version = filedata.version;
        if (prefix) {
            prefix = prefix + ".";
        }
        var now = new Date().toISOString().split('T')[0];
        var date = now;
        var description = "Package: " + prefix + title + "\nVersion: " + version + "\nDate: " + date + "\nDepends: R (>= 3.1.0)\nDescription: " + title + "\nTitle: " + title + "\nLazyData: yes\nNeedsCompilation: yes";
        return description;
    }
    package.generate_description = generate_description;
    ;
    function create_package(filedata, package_info) {
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
    }
    package.create_package = create_package;
    ;
})(package || (package = {}));
var encoder;
(function (encoder) {
    encoder.dataFrame = function (self, object, keys, types, options) {
        if (options === void 0) { options = { length: 0, attributes: {} }; }
        var length = options.length;
        if (object instanceof Stream && object._readableState.objectMode) {
            return (encoder.consume_frame_stream.bind(self))(object, keys, types, options);
        }
        this.write(encoder.encode_int(encoder.encode_flags(VECSXP, { is_object: true, has_attributes: true, has_tag: false })));
        this.write(encoder.encode_int(keys.length));
        if (length === null || typeof length === "undefined") {
            length = object[keys[0]].length;
        }
        if ((length === null || typeof length === "undefined") && object[keys[0]] instanceof Stream) {
            length = encoder.extract_length(object[keys[0]]);
        }
        else {
            length = Promise.resolve(length);
        }
        length.then(function (val) { return console.log("Writing data frame of length ", val); });
        return new Promise(function (resolve, reject) {
            async.eachOfSeries(keys, function (column, idx, callback) {
                self.writeValue(object[column], types[idx], options.length).then(callback);
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
})(encoder || (encoder = {}));
var encoder;
(function (encoder) {
    encoder.symbol = function (vm, string) {
        vm.write(encoder.encode_int(encoder.encode_flags(SYMSXP)));
        vm.write(encoder.stringScalar(string));
        return Promise.resolve();
    };
    encoder.listPairs = function (self, pairs, keys, types) {
        return new Promise(function (resolve, reject) {
            async.eachOfSeries(keys, function (key, idx, callback) {
                self.write(encoder.encode_int(encoder.encode_flags(LISTSXP, { has_tag: true, is_object: false, has_attributes: false })));
                encoder.symbol.call(self, key);
                self.writeValue(pairs[key], types[idx]).then(callback).catch(callback);
            }, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    self.write(encoder.encode_int(NILVALUESXP));
                    resolve(null);
                }
            });
        });
    };
    encoder.environment = function (self, pairs, types_map) {
        var keys = Object.keys(pairs);
        var types = keys.map(function (key) { return types_map[key]; });
        return self.listPairs(pairs, keys, types);
    };
    encoder.consume_frame_stream = function (self, objects, keys, types, options) {
        var outputs = keys.map(function (key, idx) {
            var stream = new Stream.PassThrough({ objectMode: true });
            var output = new ObjectWriter(temp.createWriteStream());
            output.path = output.stream.path;
            // The streams we write out have incorrect
            // length values, but they get rewritten
            // once we put the stream back together again
            var promise = self.writeValue(output, stream, types[idx], 0);
            promise.catch(function (err) { return console.log(err); });
            promise.then(function () { return output.stream.end(); });
            output.promise = new Promise(function (resolve, reject) {
                output.stream.on("finish", resolve);
                output.stream.on("error", reject);
            });
            output.instream = stream;
            return output;
        });
        var counter = new transforms.ObjectCounter();
        objects.setMaxListeners(2 * outputs.length);
        outputs.forEach(function (output, idx) {
            (idx === 0 ? objects.pipe(counter) : objects).pipe(new transforms.KeyExtractor(keys[idx])).pipe(output.instream);
        });
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
})(encoder || (encoder = {}));
var encoder;
(function (encoder) {
    encoder.packed_version = function (v, p, s) {
        return s + (p * 256) + (v * 65536);
    };
    encoder.encode_int = function (value) {
        var buf = new Buffer(4);
        buf.writeInt32BE(value);
        return buf;
    };
    encoder.encode_real = function (value) {
        var buf = new Buffer(8);
        buf.writeDoubleBE(value);
        return buf;
    };
    encoder.encode_flags = function (base_type, options) {
        if (options === void 0) { options = { is_object: false, has_attributes: false, has_tag: false }; }
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
    encoder.stringScalar = function (string) {
        // NA val - 0000 0009 ffff ffff
        var type = encoder.encode_int(CHARSXP | (ASCII_MASK << 12));
        if (string === null) {
            type = encoder.encode_int(CHARSXP);
            return Buffer.concat([type, encoder.encode_int(NA_STRING)]);
        }
        var bytes = new Buffer(string);
        var length = encoder.encode_int(bytes.length);
        return Buffer.concat([type, length, bytes]);
    };
    encoder.realScalar = function (real) {
        if (real === null) {
            return NA_REAL;
        }
        return encoder.encode_real(real);
    };
    encoder.intScalar = function (int) {
        if (int === null) {
            int = NA_INT;
        }
        if (!Number.isFinite(int)) {
            int = NA_INT;
        }
        return encoder.encode_int(int);
    };
    encoder.logicalScalar = function (bool) {
        if (bool === null) {
            return encoder.encode_int(NA_INT);
        }
        return encoder.encode_int(bool ? 1 : 0);
    };
    encoder.extract_length = function (stream) {
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
})(encoder || (encoder = {}));
var encoder;
(function (encoder) {
    encoder.write_vector = function (self, vector, method) {
        if (vector instanceof Stream && vector._readableState.objectMode) {
            var byte_pipe_1 = vector.pipe(new transforms.ByteWriter(method.bind(self)));
            byte_pipe_1.pipe(self.stream, { end: false });
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
                        resolve(null);
                    }
                });
            }).catch(function (err) {
                console.log(err);
            });
        }
    };
})(encoder || (encoder = {}));
var encoder;
(function (encoder) {
    var save;
    (function (save) {
        save.writeHeader = function (vm) {
            vm.write(new Buffer("RDX2\nX\n"));
            vm.write(encoder.encode_int(2));
            vm.write(encoder.encode_int(encoder.packed_version(3, 0, 0)));
            vm.write(encoder.encode_int(encoder.packed_version(2, 3, 0)));
            return Promise.resolve();
        };
        save.writeValue = function (self, value, type, length) {
            // When we pass a buffer stream to the writeValue, we assume
            // that we are taking a stream of encoded bytes
            // If we wish to rewrite the length portion of the
            // written out bytes, (i.e. the length is defined)
            // we should modify the stream of bytes on the fly
            if (value instanceof Stream.Readable && !value._readableState.objectMode) {
                var target_stream_1 = value;
                if (typeof length !== "undefined") {
                    target_stream_1 = value.pipe(new transforms.LengthRewriter(length));
                }
                target_stream_1.pipe(self.stream, { end: false });
                return new Promise(function (resolve, reject) {
                    target_stream_1.on("end", resolve);
                    value.on("error", reject);
                });
            }
            var value_written = null;
            if (type === "string") {
                value_written = self.stringVector(value);
            }
            if (type === "int") {
                value_written = self.intVector(value);
            }
            if (type === "real") {
                value_written = self.realVector(value);
            }
            if (type === "logical") {
                value_written = self.logicalVector(value);
            }
            if (type.type === "dataframe") {
                value_written = self.dataFrame(value, type.keys, type.types, (type.attributes ? { attributes: type.attributes } : {}));
            }
            if (!value_written) {
                value_written = Promise.reject(new Error("No valid data type given"));
            }
            return value_written;
        };
    })(save = encoder.save || (encoder.save = {}));
})(encoder || (encoder = {}));
var transforms;
(function (transforms) {
    var ByteWriter = /** @class */ (function (_super) {
        __extends(ByteWriter, _super);
        function ByteWriter(transform, options) {
            if (options === void 0) { options = { objectMode: true }; }
            var _this = _super.call(this, transform, options) || this;
            options.objectMode = true;
            _this.transform = transform;
            _this._readableState.objectMode = false;
            return _this;
        }
        ByteWriter.prototype._transform = function (obj, encoding, callback) {
            this.push(this.transform(obj === Null ? null : obj));
            callback();
        };
        ;
        return ByteWriter;
    }(Transform));
    transforms.ByteWriter = ByteWriter;
})(transforms || (transforms = {}));
var transforms;
(function (transforms) {
    var KeyExtractor = /** @class */ (function (_super) {
        __extends(KeyExtractor, _super);
        function KeyExtractor(key, options) {
            if (options === void 0) { options = { objectMode: true }; }
            var _this = _super.call(this, key, options) || this;
            options.objectMode = true;
            console.log("Extracting key", key);
            _this.key = key;
            return _this;
        }
        KeyExtractor.prototype._transform = function (obj, encoding, callback) {
            this.push(obj[this.key] || Null);
            callback();
        };
        ;
        return KeyExtractor;
    }(Transform));
    transforms.KeyExtractor = KeyExtractor;
})(transforms || (transforms = {}));
var transforms;
(function (transforms) {
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
    transforms.LengthRewriter = LengthRewriter;
})(transforms || (transforms = {}));
var transforms;
(function (transforms) {
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
    transforms.ObjectCounter = ObjectCounter;
})(transforms || (transforms = {}));
//# sourceMappingURL=rdata.js.map