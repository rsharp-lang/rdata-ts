namespace encoder {

    export const packed_version = function (v, p, s) {
        return s + (p * 256) + (v * 65536);
    };

    export const encode_int = function (value) {
        let buf = new Buffer(4);
        buf.writeInt32BE(value);
        return buf;
    };

    export const encode_real = function (value) {
        let buf = new Buffer(8);
        buf.writeDoubleBE(value);
        return buf;
    };

    export const encode_flags = function (base_type: number, options = { is_object: false, has_attributes: false, has_tag: false }) {
        let flags = base_type;

        if (options.is_object) {
            flags |= IS_OBJECT_BIT_MASK;
        }

        if (options.has_attributes) {
            flags |= HAS_ATTR_BIT_MASK;
        }

        if (options.has_tag) {
            flags |= HAS_TAG_BIT_MASK;
        }

        return flags;
    };

    export const stringScalar = function (string) {
        // NA val - 0000 0009 ffff ffff
        let type = encode_int(CHARSXP | (ASCII_MASK << 12));
        if (string === null) {
            type = encode_int(CHARSXP);
            return Buffer.concat([type, encode_int(NA_STRING)]);
        }
        let bytes = new Buffer(string);
        let length = encode_int(bytes.length);
        return Buffer.concat([type, length, bytes]);
    };

    export const realScalar = function (real) {
        if (real === null) {
            return NA_REAL;
        }
        return encode_real(real);
    };

    export const intScalar = function (int) {
        if (int === null) {
            int = NA_INT;
        }
        if (!Number.isFinite(int)) {
            int = NA_INT;
        }
        return encode_int(int);
    };

    export const logicalScalar = function (bool) {
        if (bool === null) {
            return encode_int(NA_INT);
        }
        return encode_int(bool ? 1 : 0);
    };

    export const extract_length = function (stream) {
        return new Promise((resolve, reject) => {
            stream.on("error", reject);
            stream.once("data", (dat) => {
                if (dat.length < 8) {
                    reject(new Error("Didn't read enough bytes in"));
                } else {
                    resolve(dat.readInt32BE(4));
                }
            });
            stream.pause();
        });
    };
}