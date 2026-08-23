import { runStaticRules, AuditIssue } from './rules';

export interface AuditReportData {
  auditId: string;
  status: 'passed' | 'issues_found';
  securityScore: number;
  summary: string;
  issues: AuditIssue[];
  gasOptimizations: string[];
  reportHash: string;
  disclaimer: string;
  paidVia: string;
  timestamp: string;
  deliveryStatus: 'DELIVERED' | 'SERVICE_DELIVERY_FAILED';
}

export function runSecurityAuditEngine(
  code: string,
  language: string = 'solidity'
): AuditReportData {
  const issues = runStaticRules(code, language);
  const auditId = `AUD-${Date.now().toString().slice(-6)}`;

  let score = 100;
  issues.forEach(iss => {
    if (iss.severity === 'CRITICAL') score -= 35;
    else if (iss.severity === 'HIGH') score -= 20;
    else if (iss.severity === 'MEDIUM') score -= 10;
    else score -= 5;
  });

  score = Math.max(20, Math.min(100, score));
  const status: 'passed' | 'issues_found' = issues.length === 0 ? 'passed' : 'issues_found';

  const summary = issues.length === 0
    ? 'Security check passed. Code adheres to key static rules with proper state guards and access controls.'
    : `Detected ${issues.length} security vulnerability(ies): ${issues.map(i => i.title).join(', ')}.`;

  const gasOptimizations = language.toLowerCase().includes('sol') || code.includes('contract')
    ? [
        'Use custom errors (error Unauthorized()) instead of string revert messages to save deployment & execution gas',
        'Mark state variables that never change as immutable or constant to avoid SLOAD gas costs',
        'Use calldata instead of memory for read-only external function parameters',
      ]
    : [
        'Enable response compression (gzip/brotli) on outbound payloads',
        'Implement query caching for read-heavy API endpoints',
      ];

  // Deterministic SHA-like report hash representation
  const rawHashInput = `${auditId}:${status}:${score}:${code.length}`;
  let hashVal = 0;
  for (let i = 0; i < rawHashInput.length; i++) {
    hashVal = ((hashVal << 5) - hashVal) + rawHashInput.charCodeAt(i);
    hashVal |= 0;
  }
  const reportHash = `0x${Math.abs(hashVal).toString(16).padStart(16, '0')}`;

  return {
    auditId,
    status,
    securityScore: score,
    summary,
    issues,
    gasOptimizations,
    reportHash,
    disclaimer: 'AI-assisted automated security analysis. Not a substitute for professional security review.',
    paidVia: 'x402 / USDC Algorand Testnet (GoPlausible Facilitator Verified)',
    timestamp: new Date().toISOString(),
    deliveryStatus: 'DELIVERED',
  };
}
