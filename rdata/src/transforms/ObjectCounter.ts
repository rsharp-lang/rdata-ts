namespace transforms {

    export class ObjectCounter extends Transform {

        public total: number;

        public constructor(options = { objectMode: true }) {
            super(options);
            options.objectMode = true;
            this.total = 0;
        }

        _transform(obj, encoding, callback) {
            this.total += 1;
            this.push(obj);
            callback();
        };
    }
}



