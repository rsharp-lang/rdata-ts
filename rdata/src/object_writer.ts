function ObjectWriter(stream, options) {
  options = options || {};
  if (options.gzip) {
    let gz = zlib.createGzip();
    gz.pipe(stream);
    this.stream = gz;
  } else {
    this.stream = stream;
  }
}

ObjectWriter.prototype.write = function (buffer) {
  this.stream.write(buffer);
};

ObjectWriter.prototype.finish = function () {
  let self = this;
  return new Promise(function (resolve, reject) {
    self.stream.on("close", resolve);
    self.stream.on("finish", resolve);
    self.stream.on("error", reject);
    self.stream.end();
  });
};

