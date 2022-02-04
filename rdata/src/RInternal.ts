
/**
 * nil = NULL
*/
const NILSXP = 0;
/**
 * symbols
*/
const SYMSXP = 1;
/**
 * lists of dotted pairs
*/
const LISTSXP = 2;
/**
 * closures 
*/
const CLOSXP = 3;
/**
 * environments
*/
const ENVSXP = 4;
/**
 * promises: [un]evaluated closure arguments
*/
const PROMSXP = 5;
/**
 * language constructs (special lists) 
*/
const LANGSXP = 6;
/**
 * special forms
*/
const SPECIALSXP = 7;
/**
 * builtin non-special forms 
*/
const BUILTINSXP = 8;
/**
 * "scalar" string type (internal only)
*/
const CHARSXP = 9;
/**
 * logical vectors
*/
const LGLSXP = 10;
/**
 * integer vectors 
*/
const INTSXP = 13;
/**
 * real variables 
*/
const REALSXP = 14;
/**
 * complex variables 
*/
const CPLXSXP = 15;
/**
 * string vectors 
*/
const STRSXP = 16;
/**
 * dot-dot-dot object
*/
const DOTSXP = 17;
/**
 * make "any" args work.
 * Used in specifying types for symbol
 * registration to mean anything is okay  
*/
const ANYSXP = 18;
/**
 * generic vectors 
*/
const VECSXP = 19;
/**
 * expressions vectors 
*/
const EXPRSXP = 20;
/**
 * byte code 
*/
const BCODESXP = 21;
/**
 * external pointer
*/
const EXTPTRSXP = 22;
/**
 * raw bytes 
*/
const RAWSXP = 24;
/**
 * S4, non-vector 
*/
const S4SXP = 25;
/**
 * Closure or Builtin or Special 
*/
const FUNSXP = 99;

const NILVALUESXP = 254;
const REFSXP = 255;

const LATIN1_MASK = (1 << 2);
const UTF8_MASK = (1 << 3);
const ASCII_MASK = (1 << 6);

const IS_OBJECT_BIT_MASK = (1 << 8);
const HAS_ATTR_BIT_MASK = (1 << 9);
const HAS_TAG_BIT_MASK = (1 << 10);

const NA_INT = -1 * Math.pow(2, 31);
const NA_STRING = -1;

/**
 * This is a special R constant value
*/
const NA_REAL = new Buffer("7ff00000000007a2", "hex");
