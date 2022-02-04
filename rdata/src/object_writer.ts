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
    writeValue = (value, type, length) => encoder.save.writeValue(this, value, type, length);

    stringVector(vector) {
        let self = this;
        this.write(encoder.encode_int(encoder.encode_flags(STRSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.stringScalar);
    };

    realVector(vector) {
        let self = this;
        this.write(encoder.encode_int(encoder.encode_flags(REALSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.realScalar);
    };

    intVector(vector) {
        let self = this;
        this.write(encoder.encode_int(encoder.encode_flags(INTSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.intScalar);
    };

    logicalVector(vector) {
        let self = this;
        this.write(encoder.encode_int(encoder.encode_flags(LGLSXP)));
        this.write(encoder.encode_int(vector.length || vector.total));
        return this.write_vector.bind(self)(vector, encoder.logicalScalar);
    };

    listPairs(pairs, keys, types) {
        return encoder.listPairs(this, pairs, keys, types);
    };
    environment(pairs, types_map) {
        return encoder.environment(this, pairs, types_map);
    };
    dataFrame = (object, keys, types, options = {}) => encoder.dataFrame(this, object, keys, types, <any>options);

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