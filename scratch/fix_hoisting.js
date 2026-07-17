const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walkDir(dir, callback) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full, callback);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      callback(full);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (let pass = 0; pass < 10; pass++) {
    const newContent = processContent(content);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    } else {
      break;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', filePath.replace(__dirname + '/', ''));
  }
}

function processContent(content) {
  const lines = content.split('\n');

  // Build map of const arrow fn declarations: fnName -> {startLine, endLine}
  const fnDeclarations = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?\(/);
    if (m) {
      const fnName = m[1];
      let depth = 0, started = false, endLine = i;
      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { depth++; started = true; }
          if (ch === '}') depth--;
        }
        if (started && depth === 0) { endLine = j; break; }
      }
      if (lines[endLine] && (lines[endLine].trim() === '};' || lines[endLine].endsWith('};'))) {
        fnDeclarations.set(fnName, { startLine: i, endLine });
      }
    }
  }

  // Find useEffect blocks
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes('useEffect(')) continue;
    let depth = 0, started = false, useEffectEnd = i;
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '(') { depth++; started = true; }
        if (ch === ')') depth--;
      }
      if (started && depth === 0) { useEffectEnd = j; break; }
    }

    const useEffectBlock = lines.slice(i, useEffectEnd + 1).join('\n');
    const callPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\(\)/g;
    let callMatch;
    while ((callMatch = callPattern.exec(useEffectBlock)) !== null) {
      const calledFn = callMatch[1];
      if (['useEffect', 'useState', 'useRef', 'useCallback', 'useMemo'].includes(calledFn)) continue;
      const fnDecl = fnDeclarations.get(calledFn);
      if (!fnDecl || fnDecl.startLine <= useEffectEnd) continue;

      // Move fn declaration before useEffect
      const fnLines = lines.splice(fnDecl.startLine, fnDecl.endLine - fnDecl.startLine + 1);
      lines.splice(i, 0, ...fnLines, '');
      return lines.join('\n');
    }
  }

  return content;
}

walkDir(srcDir, fixFile);
console.log('Done!');
