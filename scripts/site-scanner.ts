/**
 * Site Scanner - Comprehensive Code Quality & Error Detection
 * Scans the codebase for common issues, missing error handling, and potential bugs
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScanResult {
    file: string;
    line: number;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestion: string;
}

const results: ScanResult[] = [];

// Patterns to detect
const patterns = {
    // Missing try-catch in async functions
    missingTryCatch: {
        regex: /async\s+function\s+\w+[^{]*\{(?:(?!try|catch).)*\}/g,
        severity: 'high' as const,
        message: 'Async function without try-catch block',
        suggestion: 'Wrap async code in try-catch to handle errors'
    },

    // Console.log in production code
    consoleLog: {
        regex: /console\.log\(/g,
        severity: 'low' as const,
        message: 'Console.log found (should use logger)',
        suggestion: 'Replace with proper logging using logger utility'
    },

    // Empty catch blocks
    emptyCatch: {
        regex: /catch\s*\([^)]*\)\s*\{\s*\}/g,
        severity: 'high' as const,
        message: 'Empty catch block',
        suggestion: 'Handle errors properly or at least log them'
    },

    // Unhandled promise rejections
    unhandledPromise: {
        regex: /\.then\([^)]+\)(?!\s*\.catch)/g,
        severity: 'medium' as const,
        message: 'Promise without .catch()',
        suggestion: 'Add .catch() handler or use async/await with try-catch'
    },

    // Eval usage (security risk)
    evalUsage: {
        regex: /\beval\s*\(/g,
        severity: 'critical' as const,
        message: 'eval() usage detected (security risk)',
        suggestion: 'Avoid eval() - use safer alternatives'
    },

    // TODO/FIXME comments
    todoComments: {
        regex: /\/\/\s*(TODO|FIXME|HACK|XXX):/gi,
        severity: 'low' as const,
        message: 'TODO/FIXME comment found',
        suggestion: 'Address technical debt'
    },

    // Hardcoded credentials (potential)
    hardcodedCreds: {
        regex: /(password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
        severity: 'critical' as const,
        message: 'Potential hardcoded credentials',
        suggestion: 'Move sensitive data to environment variables'
    },

    // Missing error messages in responses
    emptyErrorResponse: {
        regex: /return\s+NextResponse\.json\(\s*\{\s*error\s*:\s*['"]['"]?\s*\}/g,
        severity: 'medium' as const,
        message: 'Empty error message in API response',
        suggestion: 'Provide descriptive error messages'
    },

    // Unchecked null/undefined
    potentialNullError: {
        regex: /\w+\.\w+(?!\?\.)/g, // This is simplified
        severity: 'low' as const,
        message: 'Potential null/undefined access',
        suggestion: 'Use optional chaining (?.) or null checks'
    }
};

function scanFile(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Scan for each pattern
        for (const [patternName, pattern] of Object.entries(patterns)) {
            let match;
            while ((match = pattern.regex.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split('\n').length;

                // Skip if in node_modules or .next
                if (filePath.includes('node_modules') || filePath.includes('.next')) {
                    continue;
                }

                results.push({
                    file: filePath,
                    line: lineNumber,
                    issue: pattern.message,
                    severity: pattern.severity,
                    suggestion: pattern.suggestion
                });
            }
        }

    } catch (error) {
        console.error(`Error scanning ${filePath}:`, error);
    }
}

function scanDirectory(dir: string, extensions: string[] = ['.ts', '.tsx', '.js', '.jsx']): void {
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            // Skip certain directories
            if (entry.isDirectory()) {
                if (['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
                    continue;
                }
                scanDirectory(fullPath, extensions);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (extensions.includes(ext)) {
                    scanFile(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error);
    }
}

function generateReport(): string {
    const grouped = results.reduce((acc, result) => {
        if (!acc[result.severity]) {
            acc[result.severity] = [];
        }
        acc[result.severity].push(result);
        return acc;
    }, {} as Record<string, ScanResult[]>);

    let report = '# Site Scan Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Total Issues Found: ${results.length}\n\n`;

    // Summary by severity
    report += '## Summary by Severity\n\n';
    const severityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    for (const severity of severityOrder) {
        const count = grouped[severity]?.length || 0;
        const emoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        }[severity];
        report += `${emoji} **${severity.toUpperCase()}**: ${count} issues\n`;
    }
    report += '\n';

    // Detailed issues
    report += '## Detailed Issues\n\n';

    for (const severity of severityOrder) {
        const issues = grouped[severity];
        if (!issues || issues.length === 0) continue;

        report += `### ${severity.toUpperCase()} Severity\n\n`;

        for (const issue of issues) {
            report += `**File**: \`${issue.file}\` (Line ${issue.line})\n`;
            report += `**Issue**: ${issue.issue}\n`;
            report += `**Suggestion**: ${issue.suggestion}\n\n`;
        }
    }

    // Recommendations
    report += '## Recommendations\n\n';
    report += '1. **Critical Issues**: Address immediately - these pose security risks\n';
    report += '2. **High Severity**: Should be fixed before deployment\n';
    report += '3. **Medium Severity**: Plan to fix in next sprint\n';
    report += '4. **Low Severity**: Address as time permits\n\n';

    return report;
}

// Main execution
function main() {
    console.log('🔍 Starting site scan...\n');

    const projectRoot = process.cwd();
    const directories = [
        path.join(projectRoot, 'app'),
        path.join(projectRoot, 'components'),
        path.join(projectRoot, 'lib'),
        path.join(projectRoot, 'utils')
    ];

    for (const dir of directories) {
        if (fs.existsSync(dir)) {
            console.log(`Scanning: ${dir}`);
            scanDirectory(dir);
        }
    }

    console.log(`\n✅ Scan complete! Found ${results.length} issues.\n`);

    const report = generateReport();
    const reportPath = path.join(projectRoot, 'SITE_SCAN_REPORT.md');
    fs.writeFileSync(reportPath, report);

    console.log(`📝 Report saved to: ${reportPath}\n`);
    console.log('Summary:');
    const grouped = results.reduce((acc, result) => {
        acc[result.severity] = (acc[result.severity] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('  🔴 Critical:', grouped.critical || 0);
    console.log('  🟠 High:', grouped.high || 0);
    console.log('  🟡 Medium:', grouped.medium || 0);
    console.log('  🟢 Low:', grouped.low || 0);
}

// Run if executed directly
if (require.main === module) {
    main();
}

export { scanDirectory, scanFile, generateReport };
