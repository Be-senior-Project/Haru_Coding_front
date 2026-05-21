import React from 'react';
import {Text, View, useWindowDimensions} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type TokenType = 'keyword' | 'builtin' | 'string' | 'comment' | 'number' | 'operator' | 'blank' | 'text';
type Token = {type: TokenType; value: string};

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword:  '#569CD6',
  builtin:  '#DCDCAA',
  string:   '#CE9178',
  comment:  '#6A9955',
  number:   '#B5CEA8',
  operator: '#D4D4D4',
  blank:    '#FF9966',
  text:     '#D4D4D4',
};

const PY_KEYWORDS = new Set([
  'def','return','if','elif','else','for','while','in','not','and','or',
  'True','False','None','import','from','class','with','as','try','except',
  'pass','break','continue','lambda','yield','del','global','nonlocal',
  'raise','assert','is',
]);

const PY_BUILTINS = new Set([
  'len','range','print','int','str','float','bool','list','dict','set',
  'tuple','isinstance','enumerate','zip','map','filter','sorted','reversed',
  'sum','min','max','abs','round','input','append','popleft','deque',
]);

const JS_KEYWORDS = new Set([
  'function','return','if','else','for','while','in','of','new','const',
  'let','var','true','false','null','undefined','class','extends','import',
  'export','default','this','typeof','instanceof','break','continue','do',
  'switch','case','try','catch','finally','throw','delete','void','async','await',
]);

const JS_BUILTINS = new Set([
  'console','Math','Array','Object','String','Number','Boolean','Set','Map',
  'Promise','JSON','parseInt','parseFloat','isNaN','log','push','pop','shift',
  'unshift','splice','slice','indexOf','includes','length','keys','values',
  'has','get','floor','ceil','round','max','min','abs','size',
]);

function tokenizeLine(line: string, lang: 'python' | 'javascript'): Token[] {
  const keywords = lang === 'python' ? PY_KEYWORDS : JS_KEYWORDS;
  const builtins = lang === 'python' ? PY_BUILTINS : JS_BUILTINS;
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line.slice(i, i + 3) === '___') {
      tokens.push({type: 'blank', value: '___'});
      i += 3;
      continue;
    }
    if (line[i] === '#') {
      tokens.push({type: 'comment', value: line.slice(i)});
      break;
    }
    if (lang === 'javascript' && line.slice(i, i + 2) === '//') {
      tokens.push({type: 'comment', value: line.slice(i)});
      break;
    }
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      if (line.slice(i, i + 3) === q + q + q) {
        const end = line.indexOf(q + q + q, i + 3);
        const endIdx = end === -1 ? line.length : end + 3;
        tokens.push({type: 'string', value: line.slice(i, endIdx)});
        i = endIdx;
      } else {
        let j = i + 1;
        while (j < line.length && line[j] !== q) {
          if (line[j] === '\\') {j++;}
          j++;
        }
        tokens.push({type: 'string', value: line.slice(i, Math.min(j + 1, line.length))});
        i = Math.min(j + 1, line.length);
      }
      continue;
    }
    if (lang === 'javascript' && line[i] === '`') {
      let j = i + 1;
      while (j < line.length && line[j] !== '`') {j++;}
      tokens.push({type: 'string', value: line.slice(i, j + 1)});
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) {j++;}
      tokens.push({type: 'number', value: line.slice(i, j)});
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) {j++;}
      const word = line.slice(i, j);
      if (keywords.has(word)) {
        tokens.push({type: 'keyword', value: word});
      } else if (builtins.has(word)) {
        tokens.push({type: 'builtin', value: word});
      } else {
        tokens.push({type: 'text', value: word});
      }
      i = j;
      continue;
    }
    if (/[+\-*/%=<>!&|^~@]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=<>!&|^~@]/.test(line[j])) {j++;}
      tokens.push({type: 'operator', value: line.slice(i, j)});
      i = j;
      continue;
    }
    tokens.push({type: 'text', value: line[i]});
    i++;
  }

  return tokens;
}

// 한글(CJK)은 영문의 2배 너비로 계산
function measureWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    w += (code >= 0xAC00 && code <= 0xD7FF) || (code >= 0x4E00 && code <= 0x9FFF) ? 2 : 1;
  }
  return w;
}

// 한 줄에서 인라인 주석(# 또는 //) 시작 위치를 반환, 없으면 -1
function findInlineComment(line: string, lang: 'python' | 'javascript'): number {
  let inStr = false;
  let strCh = '';
  for (let i = 0; i < line.length; i++) {
    if (inStr) {
      if (line[i] === strCh) {inStr = false;}
    } else if (line[i] === '"' || line[i] === "'") {
      inStr = true;
      strCh = line[i];
    } else if (lang === 'python' && line[i] === '#') {
      return i;
    } else if (lang === 'javascript' && line.slice(i, i + 2) === '//') {
      return i;
    }
  }
  return -1;
}

// 코드 부분만 줄바꿈 (주석 없는 순수 코드 줄에만 적용)
function wrapCodePart(line: string, maxChars: number): string[] {
  if (measureWidth(line) <= maxChars) {return [line];}

  const leadingSpaces = line.match(/^(\s*)/)?.[1] ?? '';
  const contPrefix = leadingSpaces + '    ';

  const result: string[] = [];
  let chunk = line;
  let first = true;

  while (chunk.length > 0) {
    const prefix = first ? '' : contPrefix;
    const content = first ? chunk : chunk.trimStart();
    const available = maxChars - measureWidth(prefix);

    if (measureWidth(content) <= available) {
      result.push(prefix + content);
      break;
    }

    let breakAt = 0;
    let w = 0;
    for (let i = 0; i < content.length; i++) {
      const cw = measureWidth(content[i]);
      if (w + cw > available) {breakAt = i; break;}
      w += cw;
    }
    if (breakAt === 0) {breakAt = content.length;}
    for (let i = breakAt; i > Math.max(breakAt - 30, 1); i--) {
      if (' ,('.includes(content[i])) {breakAt = i + 1; break;}
    }

    result.push((prefix + content.slice(0, breakAt)).trimEnd());
    chunk = content.slice(breakAt);
    first = false;
  }

  return result;
}

// 줄바꿈 진입점
// - 순수 주석 줄(# 또는 //로 시작): 절대 자르지 않음
// - 인라인 주석 포함 줄: 코드 부분만 자르고, 주석은 별도 줄로 분리
function wrapLine(line: string, maxChars: number, lang: 'python' | 'javascript'): string[] {
  if (/^\s*(#|\/\/)/.test(line)) {return [line];}

  const commentIdx = findInlineComment(line, lang);
  if (commentIdx !== -1) {
    const codePart = line.slice(0, commentIdx).trimEnd();
    const commentPart = line.slice(commentIdx);
    const indent = line.match(/^(\s*)/)?.[1] ?? '';
    const codeLines = wrapCodePart(codePart, maxChars);
    return [...codeLines, indent + commentPart];
  }

  return wrapCodePart(line, maxChars);
}

function detectLanguage(code: string): 'python' | 'javascript' {
  if (/\bdef\b|\bfrom\s+\w+\s+import\b/.test(code)) {return 'python';}
  return 'javascript';
}

export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: 'python' | 'javascript';
}) {
  const {fontScale} = useTheme();
  const {width} = useWindowDimensions();
  const lang = language ?? detectLanguage(code);
  const fontSize = 13 * fontScale;
  const lineHeight = fontSize * 1.75;

  // 모노스페이스 한 글자 너비 ≈ fontSize * 0.605
  // padding 32 (양쪽 16씩) 제외
  const maxChars = Math.floor((width - 32) / (fontSize * 0.605));

  const visualLines = code.split('\n').flatMap(line => wrapLine(line, maxChars, lang));

  return (
    <View style={{backgroundColor: '#1E1E2E', borderRadius: 10, padding: 16, marginBottom: 20}}>
      {visualLines.map((line, lineIdx) => (
        <View key={lineIdx} style={{flexDirection: 'row', flexWrap: 'wrap', minHeight: lineHeight}}>
          {tokenizeLine(line, lang).map((token, tokenIdx) => (
            <Text
              key={tokenIdx}
              style={{
                fontFamily: 'monospace',
                fontSize,
                lineHeight,
                color: TOKEN_COLORS[token.type],
                textDecorationLine: token.type === 'blank' ? 'underline' : 'none',
              }}>
              {token.value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
