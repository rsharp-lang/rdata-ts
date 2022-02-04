class LengthRewriter extends Transform {

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


class KeyExtractor extends Transform {

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


class ByteWriter extends Transform {

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


class ObjectCounter extends Transform {

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