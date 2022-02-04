declare const archiver: any;
declare const zlib: any;
declare const fs: any;
declare const async: any;
declare const Stream: any;
declare const temp: any;
declare const Transform: any;
declare const inherits: any;
declare const Null: unique symbol;
declare function ObjectWriter(stream: any, options: any): void;
declare const NILSXP = 0;
declare const SYMSXP = 1;
declare const LISTSXP = 2;
declare const CLOSXP = 3;
declare const ENVSXP = 4;
declare const PROMSXP = 5;
declare const LANGSXP = 6;
declare const SPECIALSXP = 7;
declare const BUILTINSXP = 8;
declare const CHARSXP = 9;
declare const LGLSXP = 10;
declare const INTSXP = 13;
declare const REALSXP = 14;
declare const CPLXSXP = 15;
declare const STRSXP = 16;
declare const DOTSXP = 17;
declare const ANYSXP = 18;
declare const VECSXP = 19;
declare const EXPRSXP = 20;
declare const BCODESXP = 21;
declare const EXTPTRSXP = 22;
declare const RAWSXP = 24;
declare const S4SXP = 25;
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
declare const NA_REAL: Buffer;
declare let packed_version: (v: any, p: any, s: any) => any;
declare let encode_int: (value: any) => Buffer;
declare const encode_real: (value: any) => Buffer;
declare let encode_flags: (base_type: any, options: any) => any;
declare const writeHeader: () => Promise<void>;
declare const writeValue: (value: any, type: any, length: any) => any;
declare const write_vector: (vector: any, method: any) => Promise<void | {}>;
declare const stringScalar: (string: any) => Buffer;
declare const realScalar: (real: any) => Buffer;
declare const intScalar: (int: any) => Buffer;
declare const logicalScalar: (bool: any) => Buffer;
declare const stringVector: (vector: any) => any;
declare const realVector: (vector: any) => any;
declare const intVector: (vector: any) => any;
declare const logicalVector: (vector: any) => any;
declare const symbol: (string: any) => Promise<void>;
declare const listPairs: (pairs: any, keys: any, types: any) => Promise<{}>;
declare const environment: (pairs: any, types_map: any) => any;
declare const consume_frame_stream: (objects: any, keys: any, types: any, options: any) => Promise<any>;
declare const extract_length: (stream: any) => Promise<{}>;
declare const dataFrame: (object: any, keys: any, types: any, options: any) => any;
declare namespace package {
    function generate_description(filedata: any, prefix: any): string;
    function create_package(filedata: any, package_info: any): any;
}
declare class LengthRewriter extends Transform {
    written_count: number;
    length: number;
    constructor(length: any, options?: {
        objectMode: boolean;
    });
    _transform(buf: any, encoding: any, callback: any): void;
}
declare class KeyExtractor extends Transform {
    constructor(key: any, options?: {
        objectMode: boolean;
    });
    _transform(obj: any, encoding: any, callback: any): void;
}
declare class ByteWriter extends Transform {
    constructor(transform: any, options?: {
        objectMode: boolean;
    });
    _transform(obj: any, encoding: any, callback: any): void;
}
declare class ObjectCounter extends Transform {
    total: number;
    constructor(options?: {
        objectMode: boolean;
    });
    _transform(obj: any, encoding: any, callback: any): void;
}
