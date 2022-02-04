namespace encoder.save {

    export const writeHeader = function (vm: ObjectWriter) {
        vm.write(new Buffer("RDX2\nX\n"));
        vm.write(encode_int(2));
        vm.write(encode_int(packed_version(3, 0, 0)));
        vm.write(encode_int(packed_version(2, 3, 0)));

        return Promise.resolve();
    };

    export const writeValue = function (self: ObjectWriter, value, type, length) {
        // When we pass a buffer stream to the writeValue, we assume
        // that we are taking a stream of encoded bytes
        // If we wish to rewrite the length portion of the
        // written out bytes, (i.e. the length is defined)
        // we should modify the stream of bytes on the fly
        if (value instanceof Stream.Readable && !value._readableState.objectMode) {
            let target_stream = value;

            if (typeof length !== "undefined") {
                target_stream = value.pipe(new transforms.LengthRewriter(length));
            }
            target_stream.pipe(self.stream, { end: false });

            return new Promise(function (resolve, reject) {
                target_stream.on("end", resolve);
                value.on("error", reject);
            });
        }

        let value_written = null;

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
}