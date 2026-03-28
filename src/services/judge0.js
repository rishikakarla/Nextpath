// Judge0 CE integration
// Default: public free CE instance (https://ce.judge0.com)
// With VITE_JUDGE0_KEY set: uses RapidAPI Judge0 CE endpoint
const RAPIDAPI_KEY = import.meta.env.VITE_JUDGE0_KEY || ''
const USE_RAPIDAPI = !!RAPIDAPI_KEY

const CE_BASE = 'https://ce.judge0.com'
const RAPIDAPI_BASE = 'https://judge0-ce.p.rapidapi.com'

export const LANGUAGES = [
  { id: 71, name: 'Python 3',     ext: 'py',   template: 'import sys\ninput = sys.stdin.readline\n\n# Write your solution here\n' },
  { id: 63, name: 'JavaScript',   ext: 'js',   template: 'const lines = require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");\nlet idx = 0;\nconst input = () => lines[idx++];\n\n// Write your solution here\n' },
  { id: 54, name: 'C++ 17',       ext: 'cpp',  template: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 62, name: 'Java',         ext: 'java', template: 'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your solution here\n    }\n}\n' },
  { id: 50, name: 'C',            ext: 'c',    template: '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 60, name: 'Go',           ext: 'go',   template: 'package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    _ = reader\n    // Write your solution here\n    fmt.Println()\n}\n' },
  { id: 51, name: 'C#',           ext: 'cs',   template: 'using System;\nusing System.IO;\n\nclass Solution {\n    static void Main(string[] args) {\n        // Write your solution here\n        Console.WriteLine();\n    }\n}\n' },
  { id: 73, name: 'Rust',         ext: 'rs',   template: 'use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    // Write your solution here\n}\n' },
  { id: 74, name: 'TypeScript',   ext: 'ts',   template: 'import * as fs from "fs";\nconst lines = fs.readFileSync("/dev/stdin","utf8").trim().split("\\n");\nlet idx = 0;\nconst input = (): string => lines[idx++];\n\n// Write your solution here\n' },
  { id: 72, name: 'Ruby',         ext: 'rb',   template: '# Write your solution here\n\n' },
  { id: 68, name: 'PHP',          ext: 'php',  template: '<?php\n// Write your solution here\n?>\n' },
  { id: 46, name: 'Bash',         ext: 'sh',   template: '#!/bin/bash\n# Write your solution here\n' },
]

function headers() {
  const h = { 'Content-Type': 'application/json' }
  if (USE_RAPIDAPI) {
    h['X-RapidAPI-Key']  = RAPIDAPI_KEY
    h['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com'
  }
  return h
}

function base() {
  return USE_RAPIDAPI ? RAPIDAPI_BASE : CE_BASE
}

// Safe base64 encode — handles unicode via TextEncoder
function b64encode(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin)
}

// Safe base64 decode — handles unicode via TextDecoder
function b64decode(val) {
  if (!val) return val
  try {
    const bin = atob(val)
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return val
  }
}

// Java (62): Judge0 always compiles as Main.java — rename any public class to Main
function normalizeJava(code, languageId) {
  if (languageId !== 62) return code
  return code.replace(/public\s+class\s+(\w+)/, (match, name) =>
    name === 'Main' ? match : `public class Main`
  )
}

export async function submitCode(sourceCode, languageId, stdin = '') {
  sourceCode = normalizeJava(sourceCode, languageId)
  const res = await fetch(`${base()}/submissions?base64_encoded=true&wait=false`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      source_code: b64encode(sourceCode),
      language_id: languageId,
      stdin: b64encode(stdin),
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Submission failed (${res.status}): ${text}`)
  }
  const { token } = await res.json()
  return token
}

export async function getResult(token) {
  const res = await fetch(
    `${base()}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory`,
    { headers: USE_RAPIDAPI ? headers() : {} }
  )
  if (!res.ok) throw new Error(`Failed to fetch result (${res.status})`)
  const data = await res.json()
  return {
    ...data,
    stdout: b64decode(data.stdout),
    stderr: b64decode(data.stderr),
    compile_output: b64decode(data.compile_output),
  }
}

// Submits code and polls until execution completes.
// onStatus(msg) is called with status updates while waiting.
export async function runCode(sourceCode, languageId, stdin = '', onStatus) {
  if (onStatus) onStatus('Submitting...')
  const token = await submitCode(sourceCode, languageId, stdin)

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000))
    const result = await getResult(token)
    const id = result.status?.id
    // id 1 = In Queue, id 2 = Processing — keep polling
    if (id !== 1 && id !== 2) return result
    if (onStatus) onStatus(result.status?.description || 'Processing...')
  }
  throw new Error('Execution timed out. Please try again.')
}