namespace transforms {

    export class KeyExtractor extends Transform {

        public constructor(key, options = { objectMode: true }) {
            super(key, options);
            options.objectMode = true;
            console.log("Extracting key", key);
            this.key = key;
        }

        _transform(obj, encoding, callback) {
            this.push(obj[this.key] || Null);
            callback();
        };
    }
}