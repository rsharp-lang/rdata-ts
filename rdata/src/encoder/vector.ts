namespace encoder {

    export const write_vector = function (self: ObjectWriter, vector, method) {
        if (vector instanceof Stream && vector._readableState.objectMode) {
            let byte_pipe = vector.pipe(new transforms.ByteWriter(method.bind(self)));
            byte_pipe.pipe(self.stream, { end: false });
            return new Promise(function (resolve) {
                // We want to specifically end
                // the promise once we have no more
                // readable elements left in the queue
                byte_pipe.on("end", resolve);
            });
        } else {
            return new Promise(function (resolve, reject) {
                async.eachOfSeries(vector, function (el, idx, callback) {
                    self.write(method(el));
                    process.nextTick(callback);
                }, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }).catch(function (err) {
                console.log(err);
            });
        }

    };
}