namespace encoder {

    export const dataFrame = function (self: ObjectWriter, object, keys, types, options = {}) {
        let length = options.length;
        if (object instanceof Stream && object._readableState.objectMode) {
            return (consume_frame_stream.bind(self))(object, keys, types, options);
        }
        this.write(encode_int(encode_flags(VECSXP, { is_object: true, has_attributes: true })));
        this.write(encode_int(keys.length));
        if (length === null || typeof length === "undefined") {
            length = object[keys[0]].length;
        }
        if ((length === null || typeof length === "undefined") && object[keys[0]] instanceof Stream) {
            length = extract_length(object[keys[0]]);
        } else {
            length = Promise.resolve(length);
        }
        length.then((val) => console.log("Writing data frame of length ", val));

        return new Promise(function (resolve, reject) {
            async.eachOfSeries(keys, function (column, idx, callback) {
                writeValue.call(self, object[column], types[idx], options.length).then(callback);
            }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    length.then((length_val) => {
                        let attributes = { "names": keys, "class": ["data.frame"], "row.names": [NA_INT, -1 * length_val] };
                        let attribute_names = ["names", "row.names", "class"];
                        let attribute_types = ["string", "int", "string"];
                        if (options.attributes) {

                            options.attributes.names.forEach((key, idx) => {
                                if (attribute_names.indexOf(key) >= 0) {
                                    return;
                                }
                                attribute_names.push(key);
                                attribute_types.push(options.attributes.types[idx]);
                                attributes[key] = options.attributes.values[key];
                            });
                        }
                        return self.listPairs(attributes, attribute_names, attribute_types);
                    }).then(resolve);
                }
            });
        });
    };
}