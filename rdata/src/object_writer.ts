class ObjectWriter {

    public constructor(public stream, options = { gzip: true }) {
        if (options.gzip) {
            let gz = zlib.createGzip();
            gz.pipe(stream);
            this.stream = gz;
        } else {
            this.stream = stream;
        }
    }

    write(buffer) {
        this.stream.write(buffer);
    };

    write_vector = (vector, method) => encoder.write_vector(this, vector, method);

    stringVector(vector) {
        let self = this;
        this.write(encode_int(encode_flags(STRSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, stringScalar);
    };

    realVector(vector) {
        let self = this;
        this.write(encode_int(encode_flags(REALSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, realScalar);
    };

    intVector(vector) {
        let self = this;
        this.write(encode_int(encode_flags(INTSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, intScalar);
    };

    logicalVector(vector) {
        let self = this;
        this.write(encode_int(encode_flags(LGLSXP)));
        this.write(encode_int(vector.length || vector.total));
        return write_vector.bind(self)(vector, logicalScalar);
    };

    listPairs() { };
    environment() { };
    dataFrame = (object, keys, types, options = {}) => encoder.dataFrame(this, object, keys, types, options);

    writeHeader() {
        return encoder.save.writeHeader(this);
    };

    finish() {
        let self = this;

        return new Promise(function (resolve, reject) {
            self.stream.on("close", resolve);
            self.stream.on("finish", resolve);
            self.stream.on("error", reject);
            self.stream.end();
        });
    };
}