const NILSXP = 0;    /* nil = NULL */
const SYMSXP = 1;    /* symbols */
const LISTSXP = 2;    /* lists of dotted pairs */
const CLOSXP = 3;    /* closures */
const ENVSXP = 4;    /* environments */
const PROMSXP = 5;    /* promises: [un]evaluated closure arguments */
const LANGSXP = 6;    /* language constructs (special lists) */
const SPECIALSXP = 7;    /* special forms */
const BUILTINSXP = 8;    /* builtin non-special forms */
const CHARSXP = 9;    /* "scalar" string type (internal only)*/
const LGLSXP = 10;    /* logical vectors */
const INTSXP = 13;    /* integer vectors */
const REALSXP = 14;    /* real variables */
const CPLXSXP = 15;    /* complex variables */
const STRSXP = 16;    /* string vectors */
const DOTSXP = 17;    /* dot-dot-dot object */
const ANYSXP = 18;    /* make "any" args work.
           Used in specifying types for symbol
           registration to mean anything is okay  */
const VECSXP = 19;   /* generic vectors */
const EXPRSXP = 20;   /* expressions vectors */
const BCODESXP = 21;   /* byte code */
const EXTPTRSXP = 22;   /* external pointer */
const RAWSXP = 24;   /* raw bytes */
const S4SXP = 25;   /* S4, non-vector */
const FUNSXP = 99;   /* Closure or Builtin or Special */

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
// This is a special R constant value
const NA_REAL = new Buffer("7ff00000000007a2", "hex");
