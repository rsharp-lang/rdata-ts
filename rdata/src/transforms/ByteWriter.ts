namespace transforms {

    export class ByteWriter extends Transform {

        public constructor(transform, options = { objectMode: true }) {
            super(transform, options);
            options.objectMode = true;
            this.transform = transform;
            this._readableState.objectMode = false;
        }

        _transform(obj, encoding, callback) {
            this.push(this.transform(obj === Null ? null : obj));
            callback();
        };
    }
}