namespace encoder {

    export const symbol = function (vm: ObjectWriter, string) {
        vm.write(encode_int(encode_flags(SYMSXP)));
        vm.write(stringScalar(string));

        return Promise.resolve();
    };

    export const listPairs = function (self: ObjectWriter, pairs, keys, types) {
        return new Promise(function (resolve, reject) {
            async.eachOfSeries(keys, function (key, idx, callback) {
                self.write(encode_int(encode_flags(LISTSXP, { has_tag: true, is_object: false, has_attributes: false })));
                symbol.call(self, key);
                self.writeValue(pairs[key], types[idx]).then(callback).catch(callback);
            }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    self.write(encode_int(NILVALUESXP));
                    resolve(null);
                }
            });
        });
    };

    export const environment = function (self: ObjectWriter, pairs, types_map) {
        let keys = Object.keys(pairs);
        let types = keys.map((key) => types_map[key]);

        return self.listPairs(pairs, keys, types);
    };

    export const consume_frame_stream = function (self: ObjectWriter, objects, keys, types, options) {
        let outputs = keys.map(function (key, idx) {
            let stream = new Stream.PassThrough({ objectMode: true });
            let output = new ObjectWriter(temp.createWriteStream());
            output.path = output.stream.path;
            // The streams we write out have incorrect
            // length values, but they get rewritten
            // once we put the stream back together again
            let promise = self.writeValue(output, stream, types[idx], 0);
            promise.catch((err) => console.log(err));
            promise.then(() => output.stream.end());
            output.promise = new Promise(function (resolve, reject) {
                output.stream.on("finish", resolve);
                output.stream.on("error", reject);
            });
            output.instream = stream;
            return output;
        });
        let counter = new transforms.ObjectCounter();
        objects.setMaxListeners(2 * outputs.length);
        outputs.forEach((output, idx) => {
            (idx === 0 ? objects.pipe(counter) : objects).pipe(new transforms.KeyExtractor(keys[idx])).pipe(output.instream);
        });
        return Promise.all(outputs.map((output) => output.promise)).then(function () {
            let filenames = outputs.map((output) => output.path);
            let streams = filenames.map((file) => fs.createReadStream(file));
            let frame = {};
            keys.forEach(function (key, idx) {
                frame[key] = streams[idx];
            });
            options.length = counter.total;
            return self.dataFrame(frame, keys, types, options);
        });
    };
}