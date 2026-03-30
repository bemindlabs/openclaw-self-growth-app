---
name: trivy
description: This skill should be used when the user asks to "scan for vulnerabilities", "check container security", "scan Docker image", "audit dependencies", "scan IaC", "check Kubernetes manifests", "run trivy", or discusses container security, infrastructure-as-code security, or vulnerability scanning.
version: 1.0.0
---

# Trivy Skill

Run security vulnerability scans on container images, filesystems, IaC configurations, and code repositories using Trivy.

## When to Activate

- User asks to scan a Docker image or container for vulnerabilities
- User wants to audit project dependencies for known CVEs
- User asks to scan Terraform, Kubernetes, CloudFormation, or other IaC files
- User wants a security assessment of the current project
- User mentions CVE scanning, SBOM generation, or compliance checking

## Prerequisites

- **Trivy** must be installed: `brew install trivy` (macOS) or see https://aquasecurity.github.io/trivy
- Verify with: `trivy --version`

## Core Scan Types

### 1. Container Image Scan

```bash
# Scan a Docker image for OS and library vulnerabilities
trivy image <IMAGE_NAME>:<TAG>

# Scan with severity filter
trivy image --severity HIGH,CRITICAL <IMAGE_NAME>:<TAG>

# Scan with JSON output for parsing
trivy image --format json --output results.json <IMAGE_NAME>:<TAG>

# Scan and fail on critical vulnerabilities (for CI/CD)
trivy image --exit-code 1 --severity CRITICAL <IMAGE_NAME>:<TAG>

# Scan local image (not pulled from registry)
trivy image --input <TAR_FILE>
```

### 2. Filesystem/Dependency Scan

```bash
# Scan current project for dependency vulnerabilities
trivy filesystem .

# Scan specific directory
trivy filesystem --severity HIGH,CRITICAL /path/to/project

# Scan only for specific types
trivy filesystem --scanners vuln .

# Include dev dependencies
trivy filesystem --include-dev-deps .
```

Supported package managers: npm, pip, Go modules, Maven, Gradle, Cargo, Composer, NuGet, Bundler, and more.

### 3. Infrastructure-as-Code (IaC) Scan

```bash
# Scan Terraform files for misconfigurations
trivy config .

# Scan Kubernetes manifests
trivy config --severity HIGH,CRITICAL ./k8s/

# Scan specific file types
trivy config --file-patterns "*.tf" .

# Scan Helm charts
trivy config ./charts/

# Scan with specific policy
trivy config --policy ./custom-policies .
```

Supported IaC: Terraform, CloudFormation, Kubernetes, Dockerfile, Docker Compose, Helm, Ansible.

### 4. Repository Scan

```bash
# Scan a remote git repository
trivy repo https://github.com/org/repo

# Scan specific branch
trivy repo --branch develop https://github.com/org/repo
```

### 5. SBOM (Software Bill of Materials)

```bash
# Generate SBOM in CycloneDX format
trivy image --format cyclonedx --output sbom.json <IMAGE_NAME>:<TAG>

# Generate SBOM in SPDX format
trivy image --format spdx-json --output sbom.json <IMAGE_NAME>:<TAG>

# Scan an existing SBOM
trivy sbom ./sbom.json
```

## Common Options

| Flag | Description |
|---|---|
| `--severity` | Filter by severity: UNKNOWN, LOW, MEDIUM, HIGH, CRITICAL |
| `--format` | Output format: table (default), json, sarif, cyclonedx, spdx-json |
| `--output` | Write results to file |
| `--exit-code` | Exit code when vulnerabilities found (useful for CI) |
| `--ignore-unfixed` | Skip vulnerabilities without a fix available |
| `--ignorefile` | Path to `.trivyignore` file |
| `--scanners` | Comma-separated: vuln, misconfig, secret, license |
| `--timeout` | Scan timeout (default 5m0s) |
| `--skip-dirs` | Directories to skip |
| `--skip-files` | Files to skip |

## Workflow

### 1. Quick Project Assessment

1. Run `trivy filesystem --severity HIGH,CRITICAL .` to scan dependencies
2. Run `trivy config .` to scan any IaC files
3. Summarize findings grouped by severity

### 2. Container Security Audit

1. Identify the Dockerfile or image reference
2. Run `trivy image --format json` for detailed analysis
3. Parse results and categorize:
   - OS-level vulnerabilities (base image)
   - Application dependency vulnerabilities
   - Misconfigurations in Dockerfile
4. Recommend remediation (base image update, dependency patches)

### 3. CI/CD Gate Check

1. Run scans with `--exit-code 1 --severity CRITICAL,HIGH`
2. Generate SARIF output for GitHub Security tab integration
3. Report pass/fail with summary of findings

## Interpreting Results

### Severity Levels
- **CRITICAL**: Actively exploited or trivially exploitable. Fix immediately.
- **HIGH**: Serious vulnerabilities. Fix in current sprint.
- **MEDIUM**: Moderate risk. Plan remediation.
- **LOW**: Minor issues. Fix opportunistically.

### Remediation Priority
1. Vulnerabilities with known exploits (check CISA KEV)
2. Vulnerabilities with available fixes (`FixedVersion` populated)
3. Vulnerabilities in directly imported dependencies
4. Transitive dependency vulnerabilities

## .trivyignore File

Create a `.trivyignore` file to suppress known-accepted vulnerabilities:

```
# Accepted risk: no fix available, mitigated by network policy
CVE-2023-XXXXX

# False positive for our use case
CVE-2024-YYYYY
```

## Output

- Vulnerability summary table grouped by severity
- Actionable remediation steps for critical/high findings
- Specific version upgrade recommendations
- IaC misconfiguration details with fix suggestions
