declare const archiver: any;
declare const zlib: any;
declare const fs: any;
declare const async: any;
declare const Stream: any;
declare const temp: any;
declare const Transform: any;
declare const inherits: any;
declare const Null: unique symbol;
/**
 * nil = NULL
*/
declare const NILSXP = 0;
/**
 * symbols
*/
declare const SYMSXP = 1;
/**
 * lists of dotted pairs
*/
declare const LISTSXP = 2;
/**
 * closures
*/
declare const CLOSXP = 3;
/**
 * environments
*/
declare const ENVSXP = 4;
/**
 * promises: [un]evaluated closure arguments
*/
declare const PROMSXP = 5;
/**
 * language constructs (special lists)
*/
declare const LANGSXP = 6;
/**
 * special forms
*/
declare const SPECIALSXP = 7;
/**
 * builtin non-special forms
*/
declare const BUILTINSXP = 8;
/**
 * "scalar" string type (internal only)
*/
declare const CHARSXP = 9;
/**
 * logical vectors
*/
declare const LGLSXP = 10;
/**
 * integer vectors
*/
declare const INTSXP = 13;
/**
 * real variables
*/
declare const REALSXP = 14;
/**
 * complex variables
*/
declare const CPLXSXP = 15;
/**
 * string vectors
*/
declare const STRSXP = 16;
/**
 * dot-dot-dot object
*/
declare const DOTSXP = 17;
/**
 * make "any" args work.
 * Used in specifying types for symbol
 * registration to mean anything is okay
*/
declare const ANYSXP = 18;
/**
 * generic vectors
*/
declare const VECSXP = 19;
/**
 * expressions vectors
*/
declare const EXPRSXP = 20;
/**
 * byte code
*/
declare const BCODESXP = 21;
/**
 * external pointer
*/
declare const EXTPTRSXP = 22;
/**
 * raw bytes
*/
declare const RAWSXP = 24;
/**
 * S4, non-vector
*/
declare const S4SXP = 25;
/**
 * Closure or Builtin or Special
*/
declare const FUNSXP = 99;
declare const NILVALUESXP = 254;
declare const REFSXP = 255;
declare const LATIN1_MASK: number;
declare const UTF8_MASK: number;
declare const ASCII_MASK: number;
declare const IS_OBJECT_BIT_MASK: number;
declare const HAS_ATTR_BIT_MASK: number;
declare const HAS_TAG_BIT_MASK: number;
declare const NA_INT: number;
declare const NA_STRING = -1;
/**
 * This is a special R constant value
*/
declare const NA_REAL: Buffer;
declare class ObjectWriter {
    stream: any;
    constructor(stream: any, options?: {
        gzip: boolean;
    });
    write(buffer: any): void;
    write_vector: (vector: any, method: any) => Promise<void | {}>;
    stringVector(vector: any): any;
    realVector(vector: any): any;
    intVector(vector: any): any;
    logicalVector(vector: any): any;
    listPairs(): void;
    environment(): void;
    dataFrame: (object: any, keys: any, types: any, options?: {}) => any;
    writeHeader(): Promise<void>;
    finish(): Promise<{}>;
}
declare namespace package {
    function generate_description(filedata: any, prefix: any): string;
    function create_package(filedata: any, package_info: any): any;
}
declare namespace encoder {
    const dataFrame: (self: ObjectWriter, object: any, keys: any, types: any, options?: {}) => any;
}
declare namespace encoder {
    const packed_version: (v: any, p: any, s: any) => any;
    const encode_int: (value: any) => Buffer;
    const encode_real: (value: any) => Buffer;
    const encode_flags: (base_type: any, options: any) => any;
    const stringScalar: (string: any) => Buffer;
    const realScalar: (real: any) => Buffer;
    const intScalar: (int: any) => Buffer;
    const logicalScalar: (bool: any) => Buffer;
    const symbol: (string: any) => Promise<void>;
    const listPairs: (pairs: any, keys: any, types: any) => Promise<{}>;
    const environment: (pairs: any, types_map: any) => any;
    const consume_frame_stream: (objects: any, keys: any, types: any, options: any) => Promise<any>;
    const extract_length: (stream: any) => Promise<{}>;
}
declare namespace encoder {
    const write_vector: (self: ObjectWriter, vector: any, method: any) => Promise<void | {}>;
}
declare namespace encoder.save {
    const writeHeader: (vm: ObjectWriter) => Promise<void>;
    const writeValue: (self: ObjectWriter, value: any, type: any, length: any) => any;
}
declare namespace transforms {
    class ByteWriter extends Transform {
        constructor(transform: any, options?: {
            objectMode: boolean;
        });
        _transform(obj: any, encoding: any, callback: any): void;
    }
}
declare namespace transforms {
    class KeyExtractor extends Transform {
        constructor(key: any, options?: {
            objectMode: boolean;
        });
        _transform(obj: any, encoding: any, callback: any): void;
    }
}
declare namespace transforms {
    class LengthRewriter extends Transform {
        written_count: number;
        length: number;
        constructor(length: any, options?: {
            objectMode: boolean;
        });
        _transform(buf: any, encoding: any, callback: any): void;
    }
}
declare namespace transforms {
    class ObjectCounter extends Transform {
        total: number;
        constructor(options?: {
            objectMode: boolean;
        });
        _transform(obj: any, encoding: any, callback: any): void;
    }
}
