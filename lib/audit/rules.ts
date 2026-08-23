export interface AuditIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  line?: number;
  snippet?: string;
  title: string;
  description: string;
  recommendation: string;
}

export function runStaticRules(code: string, language: string = 'solidity'): AuditIssue[] {
  const lines = code.split('\n');
  const issues: AuditIssue[] = [];
  let count = 1;

  const isSolidity = language.toLowerCase() === 'solidity' || code.includes('pragma solidity') || code.includes('contract ');

  if (isSolidity) {
    const isGuarded = code.includes('nonReentrant') || code.includes('ReentrancyGuard');

    // 1. Reentrancy Vulnerability
    let externalCallLine = -1;
    let snippet = '';
    lines.forEach((line, idx) => {
      if (line.includes('.call{') || line.includes('.call(') || line.includes('.transfer(')) {
        externalCallLine = idx + 1;
        snippet = line.trim();
      }
    });

    if (externalCallLine !== -1) {
      let stateUpdateAfterCall = false;
      for (let i = externalCallLine; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('}') && line.trim() === '}') break;
        if (line.includes('=') && !line.includes('==') && !line.includes('require(')) {
          if (line.includes('balances[') || line.includes('balance') || line.includes('pending') || line.includes('withdrawn')) {
            stateUpdateAfterCall = true;
            break;
          }
        }
      }

      if (stateUpdateAfterCall && !isGuarded) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'CRITICAL',
          category: 'Reentrancy Risk',
          line: externalCallLine,
          snippet,
          title: 'Reentrancy Vulnerability in State Modification',
          description: 'External low-level call precedes state updates (balances modification). An attacker contract can recursively re-enter withdraw() and drain contract funds.',
          recommendation: 'Apply the Checks-Effects-Interactions pattern by updating state before external calls, and inherit OpenZeppelin ReentrancyGuard.',
        });
      }
    }

    // 2. Unrestricted / Phishing-Prone Authentication (tx.origin)
    lines.forEach((line, idx) => {
      if (line.includes('tx.origin')) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'HIGH',
          category: 'Access Control',
          line: idx + 1,
          snippet: line.trim(),
          title: 'Dangerous Authentication using tx.origin',
          description: 'Using tx.origin for authorization allows phishing attacks where an intermediate malicious contract triggers calls on behalf of the victim.',
          recommendation: 'Replace tx.origin with msg.sender to verify the immediate caller.',
        });
      }
    });

    // 3. Unchecked Low-Level Call Return Values
    lines.forEach((line, idx) => {
      if (line.includes('.call(') || line.includes('.call{')) {
        const trimmed = line.trim();
        if (!trimmed.includes('bool ') && !trimmed.includes('require(') && !trimmed.includes('if (')) {
          issues.push({
            id: `VULN-00${count++}`,
            severity: 'HIGH',
            category: 'Unsafe External Call',
            line: idx + 1,
            snippet: trimmed,
            title: 'Unchecked Low-Level Call Return Value',
            description: 'Low-level .call() return boolean is ignored. If the transfer fails silently, state continues as if funds were transferred.',
            recommendation: 'Capture the return value with (bool success, ) = ... and assert require(success, "Transfer failed").',
          });
        }
      }
    });

    // 4. Missing Zero-Address Validation
    lines.forEach((line, idx) => {
      if (line.includes('address ') && (line.includes('setOwner') || line.includes('transferOwnership') || line.includes('setReceiver'))) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'MEDIUM',
          category: 'Input Validation',
          line: idx + 1,
          snippet: line.trim(),
          title: 'Missing Zero-Address Validation on Critical Setter',
          description: 'Address parameters passed to privileged functions are not validated against address(0).',
          recommendation: 'Add require(newAddress != address(0), "Zero address not allowed"); before updating storage.',
        });
      }
    });

    // 5. Integer Arithmetic / Unchecked Overflow Indicators
    if (code.includes('pragma solidity ^0.7') || code.includes('pragma solidity ^0.6') || code.includes('pragma solidity ^0.5')) {
      if (!code.includes('SafeMath')) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'HIGH',
          category: 'Arithmetic Safety',
          title: 'Missing SafeMath on Legacy Solidity Compiler',
          description: 'Solidity versions <0.8.0 do not check for arithmetic overflow/underflow by default.',
          recommendation: 'Upgrade to Solidity ^0.8.20 or use OpenZeppelin SafeMath library.',
        });
      }
    }

  } else {
    // Web2 / API Backend Security Rules
    lines.forEach((line, idx) => {
      // Hardcoded secrets
      if (/(api[_-]?key|secret|password|private[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_\-]{10,}["']/i.test(line)) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'CRITICAL',
          category: 'Hardcoded Secrets',
          line: idx + 1,
          snippet: line.trim(),
          title: 'Hardcoded Plaintext Secret Detected',
          description: 'Sensitive credentials or cryptographic secrets embedded directly in source code.',
          recommendation: 'Extract secrets to environment variables (process.env) and store in a secure vault.',
        });
      }

      // Arbitrary Code Execution
      if (/\b(eval|exec|Function)\s*\(/.test(line)) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'CRITICAL',
          category: 'Code Injection',
          line: idx + 1,
          snippet: line.trim(),
          title: 'Dynamic Code Execution Risk (eval/exec)',
          description: 'Direct invocation of dynamic execution functions permits arbitrary remote code execution.',
          recommendation: 'Remove eval/exec and use structured parsing or safe AST interpreters.',
        });
      }

      // SQL Injection
      if (/(SELECT|INSERT|UPDATE|DELETE).*\+\s*req\.(query|body|params)/i.test(line) || /\$\{req\.(query|body|params)\}/.test(line)) {
        issues.push({
          id: `VULN-00${count++}`,
          severity: 'HIGH',
          category: 'SQL Injection',
          line: idx + 1,
          snippet: line.trim(),
          title: 'SQL Injection via Direct Parameter Concatenation',
          description: 'User input from request parameters is concatenated directly into SQL queries.',
          recommendation: 'Use parameterized queries or an ORM with automatic escaping.',
        });
      }
    });
  }

  return issues;
}
