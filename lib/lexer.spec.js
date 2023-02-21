import { test, Test } from 'tape';
import {
  FX_PREFIX, UNKNOWN,
  OPERATOR, BOOLEAN, ERROR, NUMBER, FUNCTION, WHITESPACE, STRING,
  RANGE, RANGE_BEAM, RANGE_NAMED, RANGE_TERNARY, CONTEXT, CONTEXT_QUOTE, NEWLINE
} from './constants.js';
import { tokenize } from './lexer.js';

Test.prototype.isTokens = function isTokens (expr, result, opts) {
  this.deepEqual(tokenize(expr, { negativeNumbers: false, ...opts }), result, expr);
};
Test.prototype.isTokensNeg = function isTokensNeg (expr, result, opts) {
  this.deepEqual(tokenize(expr, { ...opts, negativeNumbers: true }), result, expr);
};

test('tokenize operators', t => {
  t.isTokens('=1>1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '>' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1>=1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '>=' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1=1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '=' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1<>1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '<>' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1<=1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '<=' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1<1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '<' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1+1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1-1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1*1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '*' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1/1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '/' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1^1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '^' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=1&1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '&' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('="A"="B"', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"A"' },
    { type: OPERATOR, value: '=' },
    { type: STRING, value: '"B"' }
  ]);
  t.isTokens('=A1:INDIRECT("B2",TRUE)', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: FUNCTION, value: 'INDIRECT' },
    { type: OPERATOR, value: '(' },
    { type: STRING, value: '"B2"' },
    { type: OPERATOR, value: ',' },
    { type: BOOLEAN, value: 'TRUE' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=123%', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '123' },
    { type: OPERATOR, value: '%' }
  ]);
  t.isTokens('=Sheet1!A1', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'Sheet1' },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' }
  ], { mergeRanges: false });
  t.isTokens('=Sheet1!A1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'Sheet1!A1' }
  ]);
  t.isTokens('=(A1:C1,A2:C2)', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '(' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'C1' },
    { type: OPERATOR, value: ',' },
    { type: RANGE, value: 'A2' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'C2' },
    { type: OPERATOR, value: ')' }
  ], { mergeRanges: false });
  t.isTokens('=(A1:C1,A2:C2)', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '(' },
    { type: RANGE, value: 'A1:C1' },
    { type: OPERATOR, value: ',' },
    { type: RANGE, value: 'A2:C2' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=(A1:C1 A2:C2)', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '(' },
    { type: RANGE, value: 'A1:C1' },
    { type: WHITESPACE, value: ' ' }, // INTERSECT
    { type: RANGE, value: 'A2:C2' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=(A1:C1  A2:C2)', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '(' },
    { type: RANGE, value: 'A1:C1' },
    { type: WHITESPACE, value: '  ' }, // INTERSECT
    { type: RANGE, value: 'A2:C2' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('={1,2,3}', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ',' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ',' },
    { type: NUMBER, value: '3' },
    { type: OPERATOR, value: '}' }
  ]);
  t.isTokens('={1;2;3}', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ';' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ';' },
    { type: NUMBER, value: '3' },
    { type: OPERATOR, value: '}' }
  ]);
  t.isTokens('={1,2;3}', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ',' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ';' },
    { type: NUMBER, value: '3' },
    { type: OPERATOR, value: '}' }
  ]);
  t.isTokens('={"A",33;TRUE,123}', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: STRING, value: '"A"' },
    { type: OPERATOR, value: ',' },
    { type: NUMBER, value: '33' },
    { type: OPERATOR, value: ';' },
    { type: BOOLEAN, value: 'TRUE' },
    { type: OPERATOR, value: ',' },
    { type: NUMBER, value: '123' },
    { type: OPERATOR, value: '}' }
  ]);
  t.isTokens('={A1:B2}', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: RANGE, value: 'A1:B2' },
    { type: OPERATOR, value: '}' }
  ]);
  t.isTokens('={A1:B2,C3:D4}', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: RANGE, value: 'A1:B2' },
    { type: OPERATOR, value: ',' },
    { type: RANGE, value: 'C3:D4' },
    { type: OPERATOR, value: '}' }
  ]);
  t.end();
});

test('tokenize functions', t => {
  t.isTokens('=TODAY()', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'TODAY' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=ToDaY()', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'ToDaY' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=SUM(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=N()', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'N' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=@SUM(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '@' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=SUM(1, 2)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ',' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=SUM(1, SUM(2, 3))', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ',' },
    { type: WHITESPACE, value: ' ' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ',' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '3' },
    { type: OPERATOR, value: ')' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=INDIRECT("A1",TRUE)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'INDIRECT' },
    { type: OPERATOR, value: '(' },
    { type: STRING, value: '"A1"' },
    { type: OPERATOR, value: ',' },
    { type: BOOLEAN, value: 'TRUE' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=BINOM.DIST.RANGE(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'BINOM.DIST.RANGE' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=OCT2BIN(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'OCT2BIN' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=TEST_FUNC(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'TEST_FUNC' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=_xlfn.FOO(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: '_xlfn.FOO' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=_FOO(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: '_FOO' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=\\FOO(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: '\\FOO' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=9FOO(1)', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '9' },
    { type: FUNCTION, value: 'FOO' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.end();
});

test('tokenize numbers', t => {
  t.isTokens('=0', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '0' }
  ]);
  t.isTokens('=+0', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '0' }
  ]);
  t.isTokens('=+1', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokens('=-0', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '0' }
  ]);
  t.isTokens('=1123', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1123' }
  ]);
  t.isTokens('=-1123', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1123' }
  ]);
  t.isTokens('=1.5', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1.5' }
  ]);
  t.isTokens('=-1.5', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1.5' }
  ]);
  t.isTokens('=1234.5678', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1234.5678' }
  ]);
  t.isTokens('=-1234.5678', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1234.5678' }
  ]);
  t.isTokens('=1E-1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1E-1' }
  ]);
  t.isTokens('=1.5E-10', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1.5E-10' }
  ]);
  t.isTokens('=1.55E+100', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1.55E+100' }
  ]);
  t.isTokens('=1.55e+100', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1.55e+100' }
  ]);
  t.end();
});

test('tokenize negative numbers', t => {
  t.isTokensNeg('=-0', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '-0' }
  ]);
  t.isTokensNeg('=-1123', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '-1123' }
  ]);
  t.isTokensNeg('=-1.5', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '-1.5' }
  ]);
  t.isTokensNeg('=-1234.5678', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '-1234.5678' }
  ]);
  t.isTokensNeg('=1E-1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1E-1' }
  ]);
  t.isTokensNeg('=-1E-1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '-1E-1' }
  ]);
  t.isTokensNeg('=1.5E-10', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1.5E-10' }
  ]);
  t.isTokensNeg('=-1.5E-10', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '-1.5E-10' }
  ]);
  t.isTokensNeg('-1', [
    { type: NUMBER, value: '-1' }
  ]);

  //
  t.isTokensNeg('=1-1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('1--1', [
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '-1' }
  ]);
  t.isTokensNeg('1 - -1', [
    { type: NUMBER, value: '1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '-1' }
  ]);
  t.isTokensNeg('1 - - 1', [
    { type: NUMBER, value: '1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('1 \n  - \n  -1', [
    { type: NUMBER, value: '1' },
    { type: WHITESPACE, value: ' ' },
    { type: NEWLINE, value: '\n' },
    { type: WHITESPACE, value: '  ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: ' ' },
    { type: NEWLINE, value: '\n' },
    { type: WHITESPACE, value: '  ' },
    { type: NUMBER, value: '-1' }
  ]);
  t.isTokensNeg('-(-1)', [
    { type: OPERATOR, value: '-' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '-1' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokensNeg('-( -1 )', [
    { type: OPERATOR, value: '-' },
    { type: OPERATOR, value: '(' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '-1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: ')' }
  ]);

  t.isTokensNeg('=true-1', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'true' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=true -1', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'true' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=true - 1', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'true' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=#VALUE!-1', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#VALUE!' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=#VALUE! -1', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#VALUE!' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=SUM(-1) -1', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '-1' },
    { type: OPERATOR, value: ')' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=SUM( -1)-1', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '-1' },
    { type: OPERATOR, value: ')' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=A1-1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=A1 -1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=foo-1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'foo' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=foo -1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'foo' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('="true"-1', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"true"' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('="true" -1', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"true"' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);

  t.isTokensNeg('=SUM(1)-1', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ')' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('={1, 2, 3}-4', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '{' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ',' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ',' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '3' },
    { type: OPERATOR, value: '}' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '4' }
  ]);
  t.isTokensNeg('=10%-1', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '10' },
    { type: OPERATOR, value: '%' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.isTokensNeg('=A1#-1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: '#' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' }
  ]);
  t.end();
});

test('tokenize simple equations', t => {
  t.isTokens('=1 + 2', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '+' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '2' }
  ]);
  t.isTokens('=1+2', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '2' }
  ]);
  t.isTokens('=1.1+2.2', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1.1' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '2.2' }
  ]);
  t.isTokens('=(1 + 2) - 3', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '+' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ')' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '3' }
  ]);
  t.isTokens('    =     (     1.1+2  )   -       3  ', [
    { type: WHITESPACE, value: '    ' },
    { type: OPERATOR, value: '=' }, // FX_PREFIX?
    { type: WHITESPACE, value: '     ' },
    { type: OPERATOR, value: '(' },
    { type: WHITESPACE, value: '     ' },
    { type: NUMBER, value: '1.1' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '2' },
    { type: WHITESPACE, value: '  ' },
    { type: OPERATOR, value: ')' },
    { type: WHITESPACE, value: '   ' },
    { type: OPERATOR, value: '-' },
    { type: WHITESPACE, value: '       ' },
    { type: NUMBER, value: '3' },
    { type: WHITESPACE, value: '  ' }
  ]);
  t.isTokens('=1+2*3', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: '*' },
    { type: NUMBER, value: '3' }
  ]);
  t.isTokens('= 1+2*3', [
    { type: FX_PREFIX, value: '=' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '+' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: '*' },
    { type: NUMBER, value: '3' }
  ]);
  t.isTokens('=1%', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '%' }
  ]);
  t.isTokens('=-1%', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '-' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: '%' }
  ]);
  t.isTokens('=-(1 + 2)%', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '-' },
    { type: OPERATOR, value: '(' },
    { type: NUMBER, value: '1' },
    { type: WHITESPACE, value: ' ' },
    { type: OPERATOR, value: '+' },
    { type: WHITESPACE, value: ' ' },
    { type: NUMBER, value: '2' },
    { type: OPERATOR, value: ')' },
    { type: OPERATOR, value: '%' }
  ]);
  t.end();
});

test('tokenize R1C1 style references', t => {
  // How R1C1 ranges are merged doesn't make a whole lot of sense.
  // A "unit" in A1 is (A1 or A:A or 1:1), this can be merged as
  // not all of these make sense but are "theoretically possible"
  t.isTokens('=R', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R' }
  ], { r1c1: true });
  t.isTokens('=R:R', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R:R' }
  ], { r1c1: true });

  t.isTokens('=R1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R1' }
  ], { r1c1: true });
  t.isTokens('=R1:R1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R1:R1' }
  ], { r1c1: true });

  t.isTokens('=R[1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R[1]' }
  ], { r1c1: true });
  t.isTokens('=R[1]:R[1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R[1]:R[1]' }
  ], { r1c1: true });

  t.isTokens('=R[-1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R[-1]' }
  ], { r1c1: true });
  t.isTokens('=R[-1]:R[-1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R[-1]:R[-1]' }
  ], { r1c1: true });

  t.isTokens('=C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C' }
  ], { r1c1: true });
  t.isTokens('=C:C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C:C' }
  ], { r1c1: true });

  t.isTokens('=C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C1' }
  ], { r1c1: true });
  t.isTokens('=C1:C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C1:C1' }
  ], { r1c1: true });

  t.isTokens('=C[1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C[1]' }
  ], { r1c1: true });
  t.isTokens('=C[1]:C[1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C[1]:C[1]' }
  ], { r1c1: true });

  t.isTokens('=C[-1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C[-1]' }
  ], { r1c1: true });
  t.isTokens('=C[-1]:C[-1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C[-1]:C[-1]' }
  ], { r1c1: true });

  t.isTokens('=RC', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC' }
  ], { r1c1: true });
  t.isTokens('=RC:RC', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC:RC' }
  ], { r1c1: true });

  t.isTokens('=R1C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R1C1' }
  ], { r1c1: true });
  t.isTokens('=R1C1:R1C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R1C1:R1C1' }
  ], { r1c1: true });

  t.isTokens('=R[2]C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[2]C' }
  ], { r1c1: true });
  t.isTokens('=R[2]C:R[2]C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[2]C:R[2]C' }
  ], { r1c1: true });

  t.isTokens('=R[-2]C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[-2]C' }
  ], { r1c1: true });
  t.isTokens('=R[-2]C:R[-2]C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[-2]C:R[-2]C' }
  ], { r1c1: true });

  t.isTokens('=RC[3]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC[3]' }
  ], { r1c1: true });
  t.isTokens('=RC[3]:RC[3]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC[3]:RC[3]' }
  ], { r1c1: true });

  t.isTokens('=RC[-3]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC[-3]' }
  ], { r1c1: true });
  t.isTokens('=RC[-3]:RC[-3]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC[-3]:RC[-3]' }
  ], { r1c1: true });

  t.isTokens('=R[2]C[2]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[2]C[2]' }
  ], { r1c1: true });
  t.isTokens('=R[2]C[2]:R[2]C[2]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[2]C[2]:R[2]C[2]' }
  ], { r1c1: true });

  t.isTokens('=R[-2]C[-2]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[-2]C[-2]' }
  ], { r1c1: true });
  t.isTokens('=R[-2]C[-2]:R[-1]C[-1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[-2]C[-2]:R[-1]C[-1]' }
  ], { r1c1: true });

  t.isTokens('=[filename]Sheetname!R[-2]C:R[-1]C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: '[filename]Sheetname!R[-2]C:R[-1]C' }
  ], { r1c1: true });

  t.isTokens('=[filename]Sheetname!R[-2]C:R[-1]C', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: '[filename]Sheetname' },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'R[-2]C' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'R[-1]C' }
  ], { mergeRanges: false, r1c1: true });

  t.isTokens('=R[-2]C[-2]:R[-1]C[-1]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R[-2]C[-2]:R[-1]C[-1]' }
  ], { r1c1: true });
  t.isTokens('=R[-2]:R1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R[-2]:R1' }
  ], { r1c1: true });

  // should not be merged
  t.isTokens('=R:C', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_BEAM, value: 'C' }
  ], { r1c1: true });
  t.isTokens('=C[1]:R[-2]', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'C[1]' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_BEAM, value: 'R[-2]' }
  ], { r1c1: true });
  t.isTokens('=R1:RC', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'R1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'RC' }
  ], { r1c1: true });
  t.isTokens('=RC:C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'RC' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_BEAM, value: 'C1' }
  ], { r1c1: true });

  t.end();
});

test('tokenize A1 style references', t => {
  t.isTokens('=A1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' }
  ]);

  t.isTokens('=C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'C1' }
  ]);

  t.isTokens('=R1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'R1' }
  ]);

  t.isTokens('=$A$1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: '$A$1' }
  ]);

  t.isTokens('=A$1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A$1' }
  ]);

  t.isTokens('=$A1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: '$A1' }
  ]);

  t.isTokens('=A10:A20', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A10:A20' }
  ]);

  t.isTokens('=A10:E20', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A10:E20' }
  ]);

  t.isTokens('=A1:C1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1:C1' }
  ]);

  t.isTokens('=5:5', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: '5:5' }
  ]);

  t.isTokens('=15:15', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: '15:15' }
  ]);

  t.isTokens('=H:H', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'H:H' }
  ]);

  t.isTokens('=AA:JJ', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'AA:JJ' }
  ]);

  t.isTokens('=XFD:XFF', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'XFD' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_NAMED, value: 'XFF' }
  ]);

  t.isTokens('=Sheetname!A1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'Sheetname!A1' }
  ]);

  t.isTokens('=Sheetname!A1', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'Sheetname' },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' }
  ], { mergeRanges: false });

  t.isTokens('=Sheet1!A1:B2', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'Sheet1!A1:B2' }
  ]);

  t.isTokens('=Sheet1!A1:B2', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'Sheet1' },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'B2' }
  ], { mergeRanges: false });

  t.isTokens("='Sheet name'!A1:B2", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: "'Sheet name'!A1:B2" }
  ]);

  t.isTokens("='Sheet name'!A1:B2", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'Sheet name'" },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'B2' }
  ], { mergeRanges: false });

  t.isTokens("='Sheets'' name'!A1:B2", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: "'Sheets'' name'!A1:B2" }
  ]);

  t.isTokens("='Sheets'' name'!A1:B2", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'Sheets'' name'" },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'B2' }
  ], { mergeRanges: false });

  t.isTokens('=[filename]Sheetname!A1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: '[filename]Sheetname!A1' }
  ]);

  t.isTokens('=[filename]Sheetname!A1', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: '[filename]Sheetname' },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' }
  ], { mergeRanges: false });

  t.isTokens("='[filename]Sheets'' name'!A1:B2", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: "'[filename]Sheets'' name'!A1:B2" }
  ]);

  t.isTokens("='[filename]Sheets'' name'!A1:B2", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'[filename]Sheets'' name'" },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'B2' }
  ], { mergeRanges: false });

  t.isTokens("='Run forest, run!'!A1", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: '\'Run forest, run!\'!A1' }
  ]);

  t.isTokens("='Run forest, run!'!A1", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'Run forest, run!'" },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' }
  ], { mergeRanges: false });

  t.isTokens("='foo'''!A1", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: "'foo'''!A1" }
  ]);

  t.isTokens("='foo'''!A1", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'foo'''" },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' }
  ], { mergeRanges: false });

  t.isTokens("='foo'''''!A1", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: "'foo'''''!A1" }
  ]);

  t.isTokens("='foo'''''!A1", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'foo'''''" },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'A1' }
  ], { mergeRanges: false });

  t.isTokens('=[15]Sheet32!X4', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: '[15]Sheet32!X4' }
  ]);

  // illegal syntax
  t.isTokens('=[15]!named', [
    { type: FX_PREFIX, value: '=' },
    { type: UNKNOWN, value: '[' },
    { type: NUMBER, value: '15' },
    { type: UNKNOWN, value: ']' },
    { type: OPERATOR, value: '!' },
    { type: RANGE_NAMED, value: 'named' }
  ]);

  t.isTokens('=filename!named', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'filename!named' }
  ]);
  t.isTokens('=filename!named', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'filename' },
    { type: OPERATOR, value: '!' },
    { type: RANGE_NAMED, value: 'named' }
  ], { mergeRanges: false });

  t.isTokens('=[15]Sheet32!X4', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: '[15]Sheet32' },
    { type: OPERATOR, value: '!' },
    { type: RANGE, value: 'X4' }
  ], { mergeRanges: false });

  // largest possible A1 ref (in Excel)
  t.isTokens('=XFD1048576', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'XFD1048576' }
  ]);
  t.isTokens('=XFD1048577', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'XFD1048577' }
  ]);
  t.isTokens('=XFE1048577', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'XFE1048577' }
  ]);
  t.isTokens('=pensioneligibilitypartner1', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'pensioneligibilitypartner1' }
  ]);

  //
  t.isTokens("='D:\\Reports\\Sales.xlsx'!namedrange", [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT_QUOTE, value: "'D:\\Reports\\Sales.xlsx'" },
    { type: OPERATOR, value: '!' },
    { type: RANGE_NAMED, value: 'namedrange' }
  ], { mergeRanges: false });
  t.isTokens("='D:\\Reports\\Sales.xlsx'!namedrange", [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: "'D:\\Reports\\Sales.xlsx'!namedrange" }
  ]);

  t.isTokens('=Sales.xlsx!namedrange', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'Sales.xlsx' },
    { type: OPERATOR, value: '!' },
    { type: RANGE_NAMED, value: 'namedrange' }
  ], { mergeRanges: false });
  t.isTokens('=Sales.xlsx!namedrange', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'Sales.xlsx!namedrange' }
  ]);

  t.isTokens('=Sheet1!A:A', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'Sheet1!A:A' }
  ]);
  t.isTokens('=Sheet1!A:A', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'Sheet1' },
    { type: OPERATOR, value: '!' },
    { type: RANGE_BEAM, value: 'A:A' }
  ], { mergeRanges: false });

  t.isTokens('=Sheet1!A:A:B:B', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_BEAM, value: 'Sheet1!A:A' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_BEAM, value: 'B:B' }
  ]);
  t.isTokens('=Sheet1!A:A:B:B', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: 'Sheet1' },
    { type: OPERATOR, value: '!' },
    { type: RANGE_BEAM, value: 'A:A' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_BEAM, value: 'B:B' }
  ], { mergeRanges: false });

  t.end();
});

test('tokenize errors', t => {
  t.isTokens('=#NAME?', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#NAME?' }
  ]);
  t.isTokens('=#VALUE!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#VALUE!' }
  ]);
  t.isTokens('=#REF!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#REF!' }
  ]);
  t.isTokens('=#DIV/0!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#DIV/0!' }
  ]);
  t.isTokens('=#NULL!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#NULL!' }
  ]);
  t.isTokens('=#NUM!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#NUM!' }
  ]);
  t.isTokens('=#N/A', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#N/A' }
  ]);
  t.isTokens('=#GETTING_DATA', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#GETTING_DATA' }
  ]);
  t.isTokens('=#SPILL!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#SPILL!' }
  ]);
  t.isTokens('=#UNKNOWN!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#UNKNOWN!' }
  ]);
  t.isTokens('=#FIELD!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#FIELD!' }
  ]);
  t.isTokens('=#CALC!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#CALC!' }
  ]);
  t.isTokens('=#SYNTAX?', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#SYNTAX?' }
  ]);
  t.isTokens('=#ERROR!', [
    { type: FX_PREFIX, value: '=' },
    { type: ERROR, value: '#ERROR!' }
  ]);

  // TODO: is this really what should happen?
  t.isTokens('=#NONSENSE!', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '#' },
    { type: CONTEXT, value: 'NONSENSE' },
    { type: OPERATOR, value: '!' }
  ]);

  t.end();
});

test('tokenize booleans', t => {
  t.isTokens('=true', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'true' }
  ]);
  t.isTokens('=tRuE', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'tRuE' }
  ]);
  t.isTokens('=TRUE', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'TRUE' }
  ]);
  t.isTokens('=false', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'false' }
  ]);
  t.isTokens('=fAlSe', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'fAlSe' }
  ]);
  t.isTokens('=FALSE', [
    { type: FX_PREFIX, value: '=' },
    { type: BOOLEAN, value: 'FALSE' }
  ]);
  t.end();
});

test('tokenize strings', t => {
  t.isTokens('=""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '""' }
  ]);
  t.isTokens('=""""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '""""' }
  ]);
  t.isTokens('="data"', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"data"' }
  ]);
  t.isTokens('="data""data"', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"data""data"' }
  ]);
  t.isTokens('="data"&"data"', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"data"' },
    { type: OPERATOR, value: '&' },
    { type: STRING, value: '"data"' }
  ]);
  t.isTokens('="data"&"data"&"data"', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"data"' },
    { type: OPERATOR, value: '&' },
    { type: STRING, value: '"data"' },
    { type: OPERATOR, value: '&' },
    { type: STRING, value: '"data"' }
  ]);
  // we should be able to highlight things that are still being typed
  // so open-ended STRING, PATH_BRACE, and PATH_QUOTE tokens at the
  // end of output are tagged.
  t.isTokens('="incomple', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"incomple', unterminated: true }
  ]);

  t.isTokens('="', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"', unterminated: true }
  ]);
  t.isTokens('=""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '""' }
  ]);
  t.isTokens('="""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"""', unterminated: true }
  ]);
  t.isTokens('=""""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '""""' }
  ]);
  t.isTokens('="""""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"""""', unterminated: true }
  ]);
  t.isTokens('=""""""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '""""""' }
  ]);
  t.isTokens('="aa""ss', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"aa""ss', unterminated: true }
  ]);
  t.isTokens('="aa""ss"', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"aa""ss"' }
  ]);
  t.isTokens('="aa""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"aa""', unterminated: true }
  ]);
  t.isTokens('="aa"""', [
    { type: FX_PREFIX, value: '=' },
    { type: STRING, value: '"aa"""' }
  ]);

  t.end();
});

test('unknowns, named ranges and functions', t => {
  t.isTokens('=foo', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'foo' }
  ]);
  t.isTokens('=_foo', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: '_foo' }
  ]);
  t.isTokens('=\\foo', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: '\\foo' }
  ]);
  t.isTokens('=æði', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'æði' }
  ]);
  t.isTokens('=らーめん', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: 'らーめん' }
  ]);
  t.isTokens('=@foo', [
    { type: FX_PREFIX, value: '=' },
    { type: OPERATOR, value: '@' },
    { type: RANGE_NAMED, value: 'foo' }
  ]);
  t.isTokens('=9æði', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '9' },
    { type: RANGE_NAMED, value: 'æði' }
  ]);
  t.isTokens('=¢mah¢', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_NAMED, value: '¢mah¢' }
  ]);
  t.isTokens('=~mah~', [
    { type: FX_PREFIX, value: '=' },
    { type: UNKNOWN, value: '~mah~' }
  ]);
  t.isTokens('=$foo', [
    { type: FX_PREFIX, value: '=' },
    { type: UNKNOWN, value: '$foo' }
  ]);
  t.isTokens('=$zzzz12', [
    { type: FX_PREFIX, value: '=' },
    { type: UNKNOWN, value: '$zzzz12' }
  ]);
  t.isTokens('=~zzzz12()', [
    { type: FX_PREFIX, value: '=' },
    { type: UNKNOWN, value: '~zzzz12' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ]);
  t.isTokens('=zzzz~12()', [
    { type: FX_PREFIX, value: '=' },
    { type: UNKNOWN, value: 'zzzz~' },
    { type: NUMBER, value: '12' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ]);
  t.end();
});

test('tokenize partial ranges', t => {
  const opts = { allowTernary: true };
  t.isTokens('1:D$1', [
    { type: RANGE_TERNARY, value: '1:D$1' }
  ], opts);

  t.isTokens('1:D$1', [
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'D$1' }
  ]);

  t.isTokens('B2:B', [
    { type: RANGE_TERNARY, value: 'B2:B' }
  ], opts);
  t.isTokens('B2:B', [
    { type: RANGE, value: 'B2' },
    { type: OPERATOR, value: ':' },
    { type: RANGE_NAMED, value: 'B' }
  ]);

  // form 1
  t.isTokens('1:A1', [
    { type: RANGE_TERNARY, value: '1:A1' }
  ], opts);
  t.isTokens('$1:A1', [
    { type: RANGE_TERNARY, value: '$1:A1' }
  ], opts);
  t.isTokens('1:$A1', [
    { type: RANGE_TERNARY, value: '1:$A1' }
  ], opts);
  t.isTokens('1:A$1', [
    { type: RANGE_TERNARY, value: '1:A$1' }
  ], opts);
  t.isTokens('1:$A$1', [
    { type: RANGE_TERNARY, value: '1:$A$1' }
  ], opts);
  t.isTokens('$1:A$1', [
    { type: RANGE_TERNARY, value: '$1:A$1' }
  ], opts);
  t.isTokens('$1:$A1', [
    { type: RANGE_TERNARY, value: '$1:$A1' }
  ], opts);
  t.isTokens('$1:$A$1', [
    { type: RANGE_TERNARY, value: '$1:$A$1' }
  ], opts);

  // form 2
  t.isTokens('A1:1', [
    { type: RANGE_TERNARY, value: 'A1:1' }
  ], opts);
  t.isTokens('A1:$1', [
    { type: RANGE_TERNARY, value: 'A1:$1' }
  ], opts);
  t.isTokens('$A1:1', [
    { type: RANGE_TERNARY, value: '$A1:1' }
  ], opts);
  t.isTokens('A$1:1', [
    { type: RANGE_TERNARY, value: 'A$1:1' }
  ], opts);
  t.isTokens('$A$1:1', [
    { type: RANGE_TERNARY, value: '$A$1:1' }
  ], opts);
  t.isTokens('A$1:$1', [
    { type: RANGE_TERNARY, value: 'A$1:$1' }
  ], opts);
  t.isTokens('$A1:$1', [
    { type: RANGE_TERNARY, value: '$A1:$1' }
  ], opts);
  t.isTokens('$A$1:$1', [
    { type: RANGE_TERNARY, value: '$A$1:$1' }
  ], opts);

  // form 3
  t.isTokens('A:A1', [
    { type: RANGE_TERNARY, value: 'A:A1' }
  ], opts);
  t.isTokens('$A:A1', [
    { type: RANGE_TERNARY, value: '$A:A1' }
  ], opts);
  t.isTokens('A:$A1', [
    { type: RANGE_TERNARY, value: 'A:$A1' }
  ], opts);
  t.isTokens('A:A$1', [
    { type: RANGE_TERNARY, value: 'A:A$1' }
  ], opts);
  t.isTokens('A:$A$1', [
    { type: RANGE_TERNARY, value: 'A:$A$1' }
  ], opts);
  t.isTokens('$A:A$1', [
    { type: RANGE_TERNARY, value: '$A:A$1' }
  ], opts);
  t.isTokens('$A:$A1', [
    { type: RANGE_TERNARY, value: '$A:$A1' }
  ], opts);
  t.isTokens('$A:$A$1', [
    { type: RANGE_TERNARY, value: '$A:$A$1' }
  ], opts);

  // form 4
  t.isTokens('A1:A', [
    { type: RANGE_TERNARY, value: 'A1:A' }
  ], opts);
  t.isTokens('A1:$A', [
    { type: RANGE_TERNARY, value: 'A1:$A' }
  ], opts);
  t.isTokens('$A1:A', [
    { type: RANGE_TERNARY, value: '$A1:A' }
  ], opts);
  t.isTokens('A$1:A', [
    { type: RANGE_TERNARY, value: 'A$1:A' }
  ], opts);
  t.isTokens('$A$1:A', [
    { type: RANGE_TERNARY, value: '$A$1:A' }
  ], opts);
  t.isTokens('A$1:$A', [
    { type: RANGE_TERNARY, value: 'A$1:$A' }
  ], opts);
  t.isTokens('$A1:$A', [
    { type: RANGE_TERNARY, value: '$A1:$A' }
  ], opts);
  t.isTokens('$A$1:$A', [
    { type: RANGE_TERNARY, value: '$A$1:$A' }
  ], opts);

  t.isTokens('=A10:A+B1:2', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE_TERNARY, value: 'A10:A' },
    { type: OPERATOR, value: '+' },
    { type: RANGE_TERNARY, value: 'B1:2' }
  ], opts);
  t.isTokens('=SUM(A:A$10,3:B$2)', [
    { type: FX_PREFIX, value: '=' },
    { type: FUNCTION, value: 'SUM' },
    { type: OPERATOR, value: '(' },
    { type: RANGE_TERNARY, value: 'A:A$10' },
    { type: OPERATOR, value: ',' },
    { type: RANGE_TERNARY, value: '3:B$2' },
    { type: OPERATOR, value: ')' }
  ], opts);
  t.isTokens('$A$10:$12', [
    { type: RANGE_TERNARY, value: '$A$10:$12' }
  ], opts);
  t.isTokens('1:D$1', [
    { type: RANGE_TERNARY, value: '1:D$1' }
  ], opts);
  t.isTokens('=A1:IF()', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: FUNCTION, value: 'IF' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ], opts);
  t.isTokens('=A1:F.DIST()', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: FUNCTION, value: 'F.DIST' },
    { type: OPERATOR, value: '(' },
    { type: OPERATOR, value: ')' }
  ], opts);
  t.isTokens('=1:A1.', [
    { type: FX_PREFIX, value: '=' },
    { type: NUMBER, value: '1' },
    { type: OPERATOR, value: ':' },
    { type: RANGE, value: 'A1' },
    { type: UNKNOWN, value: '.' }
  ], opts);
  t.isTokens('=A1:X$', [
    { type: FX_PREFIX, value: '=' },
    { type: RANGE, value: 'A1' },
    { type: OPERATOR, value: ':' },
    { type: UNKNOWN, value: 'X$' }
  ], opts);

  t.isTokens('=[foo]Bar!A:A1', [
    { type: FX_PREFIX, value: '=' },
    { type: CONTEXT, value: '[foo]Bar' },
    { type: OPERATOR, value: '!' },
    { type: RANGE_TERNARY, value: 'A:A1' }
  ], { mergeRanges: false, allowTernary: true });

  t.end();
});
