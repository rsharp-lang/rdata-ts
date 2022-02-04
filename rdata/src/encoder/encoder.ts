namespace encoder {

    let packed_version = function (v, p, s) {
        return s + (p * 256) + (v * 65536);
    };

    let encode_int = function (value) {
        let buf = new Buffer(4);
        buf.writeInt32BE(value);
        return buf;
    };

    const encode_real = function (value) {
        let buf = new Buffer(8);
        buf.writeDoubleBE(value);
        return buf;
    };

    let encode_flags = function (base_type, options) {
        if (!options) {
            options = {};
        }
        let flags = base_type;
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

    const stringScalar = function (string) {
        // NA val - 0000 0009 ffff ffff
        let type = encode_int(CHARSXP | (ASCII_MASK << 12));
        if (string === null) {
            type = encode_int(CHARSXP);
            return Buffer.concat([type, encode_int(NA_STRING)]);
        }
        let bytes = new Buffer(string);
        let length = encode_int(bytes.length);
        return Buffer.concat([type, length, bytes]);
    };

    const realScalar = function (real) {
        if (real === null) {
            return NA_REAL;
        }
        return encode_real(real);
    };

    const intScalar = function (int) {
        if (int === null) {
            int = NA_INT;
        }
        if (!Number.isFinite(int)) {
            int = NA_INT;
        }
        return encode_int(int);
    };

    const logicalScalar = function (bool) {
        if (bool === null) {
            return encode_int(NA_INT);
        }
        return encode_int(bool ? 1 : 0);
    };

    const stringVector = function (vector) {
        let self = this;
        this.write(encode_int(encode_flags(STRSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, stringScalar);
    };

    const realVector = function (vector) {
        let self = this;
        this.write(encode_int(encode_flags(REALSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, realScalar);
    };

    const intVector = function (vector) {
        let self = this;
        this.write(encode_int(encode_flags(INTSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, intScalar);
    };

    const logicalVector = function (vector) {
        let self = this;
        this.write(encode_int(encode_flags(LGLSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, logicalScalar);
    };

    const symbol = function (string) {
        this.write(encode_int(encode_flags(SYMSXP)));
        this.write(stringScalar(string));
        return Promise.resolve();
    };

    const listPairs = function (pairs, keys, types) {
        let self = this;
        return new Promise(function (resolve, reject) {
            async.eachOfSeries(keys, function (key, idx, callback) {
                self.write(encode_int(encode_flags(LISTSXP, { has_tag: true })));
                symbol.call(self, key);
                writeValue.call(self, pairs[key], types[idx]).then(callback).catch(callback);
            }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    self.write(encode_int(NILVALUESXP));
                    resolve();
                }
            });
        });
    };

    const environment = function (pairs, types_map) {
        let self = this;
        let keys = Object.keys(pairs);
        let types = keys.map((key) => types_map[key]);
        return self.listPairs(pairs, keys, types);
    };

    const consume_frame_stream = function (objects, keys, types, options) {
        let self = this;
        let outputs = keys.map(function (key, idx) {
            let stream = new Stream.PassThrough({ objectMode: true });
            let output = new ObjectWriter(temp.createWriteStream());
            output.path = output.stream.path;
            // The streams we write out have incorrect
            // length values, but they get rewritten
            // once we put the stream back together again
            let promise = writeValue.call(output, stream, types[idx], 0);
            promise.catch((err) => console.log(err));
            promise.then(() => output.stream.end());
            output.promise = new Promise(function (resolve, reject) {
                output.stream.on("finish", resolve);
                output.stream.on("error", reject);
            });
            output.instream = stream;
            return output;
        });
        let counter = new ObjectCounter();
        objects.setMaxListeners(2 * outputs.length);
        outputs.forEach((output, idx) => { (idx === 0 ? objects.pipe(counter) : objects).pipe(new KeyExtractor(keys[idx])).pipe(output.instream); });
        return Promise.all(outputs.map((output) => output.promise)).then(function () {
            let filenames = outputs.map((output) => output.path);
            let streams = filenames.map((file) => fs.createReadStream(file));
            let frame = {};
            keys.forEach(function (key, idx) {
                frame[key] = streams[idx];
            });
            options.length = counter.total;
            return self.dataFrame(frame, keys, types, options);
        });
    };

    const extract_length = function (stream) {
        return new Promise((resolve, reject) => {
            stream.on("error", reject);
            stream.once("data", (dat) => {
                if (dat.length < 8) {
                    reject(new Error("Didn't read enough bytes in"));
                } else {
                    resolve(dat.readInt32BE(4));
                }
            });
            stream.pause();
        });
    };
}