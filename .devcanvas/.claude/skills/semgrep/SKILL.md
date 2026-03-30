---
name: semgrep
description: This skill should be used when the user asks to "run static analysis", "scan code for security issues", "find code patterns", "check for vulnerabilities in code", "run semgrep", "SAST scan", or discusses static application security testing, code pattern matching, or custom lint rules.
version: 1.0.0
---

# Semgrep Skill

Run static application security testing (SAST), find code patterns, and enforce coding standards using Semgrep.

## When to Activate

- User asks to scan code for security vulnerabilities (SAST)
- User wants to find specific code patterns or anti-patterns
- User asks to enforce coding standards or best practices
- User wants to write custom lint rules
- User mentions Semgrep, static analysis, or code pattern matching

## Prerequisites

- **Semgrep** must be installed: `pip install semgrep` or `brew install semgrep`
- Verify with: `semgrep --version`
- Optional: Semgrep App token for managed rules (`SEMGREP_APP_TOKEN`)

## Core Operations

### 1. Scan with Default Rules

```bash
# Scan current directory with auto-detected language rules
semgrep scan --config auto .

# Scan with specific output format
semgrep scan --config auto --json .

# Scan specific files or directories
semgrep scan --config auto src/

# Scan with severity filter
semgrep scan --config auto --severity ERROR .
```

### 2. Scan with Specific Rulesets

```bash
# OWASP Top 10 rules
semgrep scan --config "p/owasp-top-ten" .

# Language-specific security rules
semgrep scan --config "p/python" .
semgrep scan --config "p/javascript" .
semgrep scan --config "p/typescript" .
semgrep scan --config "p/golang" .
semgrep scan --config "p/java" .
semgrep scan --config "p/ruby" .

# Security-focused rulesets
semgrep scan --config "p/security-audit" .
semgrep scan --config "p/secrets" .
semgrep scan --config "p/sql-injection" .
semgrep scan --config "p/xss" .

# Multiple rulesets
semgrep scan --config "p/owasp-top-ten" --config "p/secrets" .

# CI-focused (returns non-zero exit code on findings)
semgrep scan --config auto --error .
```

### 3. Custom Rule Scanning

```bash
# Scan with a local rule file
semgrep scan --config ./rules/custom-rules.yml .

# Scan with inline rule
semgrep scan --pattern '$X == None' --lang python .

# Scan with pattern and replacement (autofix preview)
semgrep scan --pattern '$X == None' --replacement '$X is None' --lang python --autofix --dryrun .
```

### 4. Writing Custom Rules

Custom rules use YAML format:

```yaml
rules:
  - id: no-hardcoded-secrets
    patterns:
      - pattern: |
          $KEY = "..."
      - metavariable-regex:
          metavariable: $KEY
          regex: (password|secret|api_key|token|auth)
    message: "Hardcoded secret detected in variable '$KEY'"
    languages: [python, javascript, typescript]
    severity: ERROR
    metadata:
      category: security
      cwe: ["CWE-798: Use of Hard-coded Credentials"]

  - id: sql-injection-risk
    patterns:
      - pattern: |
          cursor.execute(f"...", ...)
      - pattern-not: |
          cursor.execute("...", $PARAMS)
    message: "Potential SQL injection via f-string in query"
    languages: [python]
    severity: ERROR
    metadata:
      category: security
      cwe: ["CWE-89: SQL Injection"]
```

### 5. Pattern Syntax Reference

| Pattern | Description |
|---|---|
| `$X` | Matches any expression (metavariable) |
| `$...X` | Matches zero or more arguments/statements |
| `...` | Ellipsis — matches any sequence |
| `"..."` | Matches any string literal |
| `pattern` | Must match |
| `pattern-not` | Must not match |
| `pattern-either` | Match any of the sub-patterns |
| `pattern-inside` | Must be inside this pattern |
| `pattern-not-inside` | Must not be inside this pattern |
| `metavariable-regex` | Regex constraint on metavariable |
| `metavariable-comparison` | Comparison constraint on metavariable |

## Common Options

| Flag | Description |
|---|---|
| `--config` | Rule configuration (auto, p/ruleset, file path) |
| `--json` | Output in JSON format |
| `--sarif` | Output in SARIF format (for GitHub integration) |
| `--severity` | Filter: INFO, WARNING, ERROR |
| `--error` | Exit with non-zero code on findings |
| `--autofix` | Apply suggested fixes |
| `--dryrun` | Show what autofix would change without applying |
| `--exclude` | Glob patterns to exclude |
| `--include` | Glob patterns to include |
| `--max-target-bytes` | Skip files larger than this |
| `--timeout` | Per-rule timeout in seconds |
| `--verbose` | Verbose output |

## Workflow

### 1. Quick Security Scan

1. Run `semgrep scan --config auto --severity ERROR .`
2. Review findings grouped by rule category
3. For each finding, assess:
   - Is it a true positive or false positive?
   - What is the fix?
   - Is there an autofix available?
4. Apply fixes or document accepted risks

### 2. Comprehensive Security Audit

1. Run `semgrep scan --config "p/owasp-top-ten" --config "p/secrets" --json . > semgrep-results.json`
2. Parse JSON results and categorize by CWE
3. Cross-reference with project's threat model
4. Generate report with:
   - Finding summary by severity
   - Affected files and line numbers
   - Recommended fixes with code examples
   - False positive analysis

### 3. Custom Rule Development

1. Identify the code pattern to detect/prevent
2. Write the rule using Semgrep pattern syntax
3. Test with `semgrep scan --config rule.yml --verbose .`
4. Iterate on the pattern to reduce false positives
5. Add metadata (CWE, category, confidence)
6. Save to project's `.semgrep/` or `rules/` directory

### 4. CI/CD Integration

1. Run `semgrep scan --config auto --error --sarif --output semgrep.sarif .`
2. Upload SARIF to GitHub Security tab
3. Fail pipeline on ERROR severity findings
4. Track findings over time with Semgrep App

## Interpreting Results

### Severity Levels
- **ERROR**: High-confidence security issues. Fix before merging.
- **WARNING**: Potential issues that need review. May be false positives.
- **INFO**: Best practice suggestions and code quality findings.

### Common Finding Categories
- **security**: Vulnerabilities (injection, XSS, SSRF, etc.)
- **correctness**: Bugs and logic errors
- **best-practice**: Code quality and maintainability
- **performance**: Performance anti-patterns

## Ignoring Findings

```python
# nosemgrep: rule-id
vulnerable_code_here()

# nosemgrep
ignore_all_rules_for_this_line()
```

Or in `.semgrepignore`:
```
# Ignore test files
tests/
*_test.py
*.test.js

# Ignore vendored code
vendor/
node_modules/
```

## Output

- Findings table grouped by severity and category
- Affected file paths and line numbers
- Rule descriptions and remediation guidance
- Autofix suggestions where available
- Summary statistics (total findings, by severity, by category)
