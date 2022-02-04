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