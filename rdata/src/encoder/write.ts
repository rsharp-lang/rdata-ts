namespace encoder.save {

    export const writeHeader = function () {
        this.write(new Buffer("RDX2\nX\n"));
        this.write(encode_int(2));
        this.write(encode_int(packed_version(3, 0, 0)));
        this.write(encode_int(packed_version(2, 3, 0)));
        return Promise.resolve();
    };

    export const writeValue = function (value, type, length) {
        let self = this;
        // When we pass a buffer stream to the writeValue, we assume
        // that we are taking a stream of encoded bytes
        // If we wish to rewrite the length portion of the
        // written out bytes, (i.e. the length is defined)
        // we should modify the stream of bytes on the fly
        if (value instanceof Stream.Readable && !value._readableState.objectMode) {
            let target_stream = value;

            if (typeof length !== "undefined") {
                target_stream = value.pipe(new LengthRewriter(length));
            }
            target_stream.pipe(self.stream, { end: false });

            return new Promise(function (resolve, reject) {
                target_stream.on("end", resolve);
                value.on("error", reject);
            });
        }

        let value_written = null;

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

    export const write_vector = function (vector, method) {
        let self = this;
        if (vector instanceof Stream && vector._readableState.objectMode) {
            let byte_pipe = vector.pipe(new ByteWriter(method.bind(self)));
            byte_pipe.pipe(this.stream, { end: false });
            return new Promise(function (resolve) {
                // We want to specifically end
                // the promise once we have no more
                // readable elements left in the queue
                byte_pipe.on("end", resolve);
            });
        } else {
            return new Promise(function (resolve, reject) {
                async.eachOfSeries(vector, function (el, idx, callback) {
                    self.write(method(el));
                    process.nextTick(callback);
                }, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }).catch(function (err) {
                console.log(err);
            });
        }

    };

}