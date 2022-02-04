namespace transforms {
    
    export class LengthRewriter extends Transform {

        public written_count: number;
        public length: number;

        public constructor(length, options = { objectMode: false }) {
            super(options);

            options.objectMode = false;

            this.written_count = 0;
            this.length = length;
        }

        _transform(buf, encoding, callback) {
            let written_count = this.written_count;

            if (written_count <= 4) {
                let offset = 4 - written_count;
                if (offset >= 0 && offset < buf.length) {
                    buf.writeInt32BE(this.length || 0, offset);
                }
                written_count += buf.length;
            }

            this.written_count = written_count;
            this.push(buf);

            callback();
        };
    }
}