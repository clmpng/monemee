import express from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { broadcastEvent } from '../services/websocket.service.js';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Projekt-Pfade
const projectRoot = path.resolve(__dirname, '../../../../');
const projectPaths = {
  client: path.join(projectRoot, 'client'),
  server: path.join(projectRoot, 'server'),
  'mission-control': path.join(projectRoot, 'mission-control/tests')
};

const router = express.Router();

// Test Results Storage (in-memory)
let testHistory = [];
let runningTests = new Map(); // Aktive Test-Runs

// POST /api/tests/run
router.post('/run', async (req, res, next) => {
  try {
    const { type = 'all', project = 'all', watch = false } = req.body;

    // Validiere Test-Type
    const validTypes = ['all', 'unit', 'integration'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid test type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validiere Project
    const validProjects = ['all', 'client', 'server', 'mission-control'];
    if (!validProjects.includes(project)) {
      return res.status(400).json({
        success: false,
        message: `Invalid project. Must be one of: ${validProjects.join(', ')}`
      });
    }

    const runId = Date.now().toString();

    // Response sofort senden
    res.json({
      success: true,
      message: `Tests started (${type}) for ${project}`,
      runId,
      watching: watch
    });

    // Broadcast Start
    broadcastEvent.testResult({
      runId,
      status: 'running',
      type,
      project,
      startTime: new Date().toISOString()
    });

    // Führe Tests aus
    const results = await runTestsForProjects(runId, type, project, watch);

    // Speichere Ergebnis
    const testResult = {
      runId,
      type,
      project,
      status: results.success ? 'passed' : 'failed',
      summary: results.summary,
      projects: results.projects,
      coverage: results.coverage,
      duration: results.duration,
      timestamp: new Date().toISOString(),
      errors: results.errors
    };

    testHistory.unshift(testResult);
    if (testHistory.length > 100) testHistory.pop();

    // Broadcast Result
    broadcastEvent.testResult(testResult);

  } catch (error) {
    next(error);
  }
});

// GET /api/tests/history
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const project = req.query.project;

  let filtered = testHistory;
  if (project && project !== 'all') {
    filtered = testHistory.filter(r => r.project === project || r.project === 'all');
  }

  res.json({
    success: true,
    data: filtered.slice(0, limit)
  });
});

// GET /api/tests/history/:runId
router.get('/history/:runId', (req, res) => {
  const { runId } = req.params;
  const result = testHistory.find(r => r.runId === runId);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Test run not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

// GET /api/tests/status
router.get('/status', (req, res) => {
  const latestRun = testHistory[0];

  res.json({
    success: true,
    data: {
      latestRun: latestRun || null,
      totalRuns: testHistory.length,
      runningTests: Array.from(runningTests.keys()),
      stats: calculateStats(testHistory),
      projects: {
        client: { available: true, path: projectPaths.client },
        server: { available: true, path: projectPaths.server },
        'mission-control': { available: true, path: projectPaths['mission-control'] }
      }
    }
  });
});

// POST /api/tests/coverage
router.post('/coverage', async (req, res, next) => {
  try {
    const { project = 'all' } = req.body;
    const coverage = {};

    const projects = project === 'all'
      ? ['client', 'server', 'mission-control']
      : [project];

    for (const proj of projects) {
      try {
        const coveragePath = path.join(projectPaths[proj], 'coverage/coverage-summary.json');
        const data = await fs.readFile(coveragePath, 'utf-8');
        coverage[proj] = JSON.parse(data);
      } catch {
        coverage[proj] = null;
      }
    }

    res.json({
      success: true,
      data: coverage
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tests/projects
router.get('/projects', async (req, res) => {
  const projects = [];

  for (const [name, projectPath] of Object.entries(projectPaths)) {
    try {
      const pkgPath = name === 'mission-control'
        ? path.join(projectPath, 'package.json')
        : path.join(projectPath, 'package.json');

      const pkgData = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(pkgData);

      projects.push({
        name,
        path: projectPath,
        hasTests: !!(pkg.scripts?.test || pkg.scripts?.['test:unit']),
        scripts: {
          test: pkg.scripts?.test,
          testUnit: pkg.scripts?.['test:unit'],
          testIntegration: pkg.scripts?.['test:integration'],
          testCoverage: pkg.scripts?.['test:coverage']
        }
      });
    } catch {
      projects.push({
        name,
        path: projectPath,
        hasTests: false,
        error: 'package.json not found'
      });
    }
  }

  res.json({
    success: true,
    data: projects
  });
});

// POST /api/tests/stop
router.post('/stop', (req, res) => {
  const { runId } = req.body;

  if (runId && runningTests.has(runId)) {
    const process = runningTests.get(runId);
    process.kill('SIGTERM');
    runningTests.delete(runId);

    res.json({ success: true, message: 'Test run stopped' });
  } else {
    // Stop all running tests
    for (const [id, process] of runningTests) {
      process.kill('SIGTERM');
    }
    runningTests.clear();

    res.json({ success: true, message: 'All test runs stopped' });
  }
});

// Helper: Run tests for one or more projects
async function runTestsForProjects(runId, type, project, watch) {
  const startTime = Date.now();
  const projectResults = {};
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalTests = 0;
  const errors = [];

  const projects = project === 'all'
    ? ['client', 'server', 'mission-control']
    : [project];

  for (const proj of projects) {
    const projectPath = projectPaths[proj];

    try {
      // Bestimme npm Script
      let command = 'npm test -- --watchAll=false';
      if (proj === 'server' || proj === 'mission-control') {
        command = 'npm test';
        if (type === 'unit') command = 'npm run test:unit';
        if (type === 'integration') command = 'npm run test:integration';
      } else if (proj === 'client') {
        command = 'CI=true npm test';
        // Client hat keine separaten unit/integration scripts (noch)
      }

      // Broadcast project start
      broadcastEvent.testResult({
        runId,
        status: 'running',
        currentProject: proj,
        message: `Running ${type} tests for ${proj}...`
      });

      const { stdout, stderr } = await execAsync(command, {
        cwd: projectPath,
        timeout: 300000, // 5 Minuten
        env: { ...process.env, CI: 'true', FORCE_COLOR: '0' }
      });

      const result = parseJestOutput(stdout);
      projectResults[proj] = {
        success: result.success,
        ...result.summary,
        duration: result.duration,
        tests: result.testSuites,      // Einzelne Tests
        failedTests: result.failedTests, // Fehlgeschlagene Tests mit Errors
        output: stdout.slice(-5000) // Letzte 5000 Zeichen
      };

      totalPassed += result.summary.passed || 0;
      totalFailed += result.summary.failed || 0;
      totalSkipped += result.summary.skipped || 0;
      totalTests += result.summary.total || 0;

    } catch (error) {
      const output = error.stdout || error.message;
      const result = parseJestOutput(output);

      projectResults[proj] = {
        success: false,
        ...result.summary,
        tests: result.testSuites,
        failedTests: result.failedTests,
        error: error.message,
        output: output?.slice(-5000)
      };

      totalFailed += result.summary.failed || 1;
      totalTests += result.summary.total || 1;
      errors.push({ project: proj, error: error.message });
    }
  }

  return {
    success: totalFailed === 0,
    summary: {
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      total: totalTests
    },
    projects: projectResults,
    duration: (Date.now() - startTime) / 1000,
    errors: errors.length > 0 ? errors : null
  };
}

// Helper: Parse Jest Output
function parseJestOutput(output) {
  const result = {
    success: false,
    summary: { passed: 0, failed: 0, skipped: 0, total: 0 },
    duration: 0,
    testSuites: [],  // Detaillierte Test-Suites
    failedTests: []  // Liste der fehlgeschlagenen Tests
  };

  if (!output) return result;

  try {
    // Standard Jest Output: "Tests: X passed, Y total"
    const testsMatch = output.match(/Tests:\s+(?:(\d+)\s+failed,\s+)?(?:(\d+)\s+skipped,\s+)?(\d+)\s+passed,\s+(\d+)\s+total/);
    if (testsMatch) {
      result.summary = {
        failed: parseInt(testsMatch[1] || '0'),
        skipped: parseInt(testsMatch[2] || '0'),
        passed: parseInt(testsMatch[3] || '0'),
        total: parseInt(testsMatch[4] || '0')
      };
      result.success = result.summary.failed === 0;
    }

    // Alternative: "X passing" format
    const passMatch = output.match(/(\d+)\s+passing/);
    const failMatch = output.match(/(\d+)\s+failing/);
    if (passMatch && !testsMatch) {
      result.summary.passed = parseInt(passMatch[1]);
      result.summary.failed = failMatch ? parseInt(failMatch[1]) : 0;
      result.summary.total = result.summary.passed + result.summary.failed;
      result.success = result.summary.failed === 0;
    }

    // Duration
    const durationMatch = output.match(/Time:\s+([\d.]+)\s*s/);
    if (durationMatch) {
      result.duration = parseFloat(durationMatch[1]);
    }

    // Parse individual test suites (PASS/FAIL filename)
    const suiteRegex = /(PASS|FAIL)\s+([^\n]+\.(?:test|spec)\.[jt]sx?)/g;
    let suiteMatch;
    while ((suiteMatch = suiteRegex.exec(output)) !== null) {
      result.testSuites.push({
        status: suiteMatch[1].toLowerCase(),
        file: suiteMatch[2].trim()
      });
    }

    // Parse individual test results (✓ or ✕ followed by test name)
    const lines = output.split('\n');
    let currentSuite = '';
    let currentDescribe = '';

    for (const line of lines) {
      // Detect describe blocks
      const describeMatch = line.match(/^\s{2,4}([A-Za-zÄÖÜäöüß][\w\s\(\)→\-äöüÄÖÜß]+)$/);
      if (describeMatch && !line.includes('✓') && !line.includes('✕') && !line.includes('○')) {
        currentDescribe = describeMatch[1].trim();
      }

      // Detect passing tests (✓)
      const passTestMatch = line.match(/✓\s+(.+?)(?:\s+\(\d+\s*m?s\))?$/);
      if (passTestMatch) {
        const testName = passTestMatch[1].trim();
        result.testSuites.push({
          status: 'passed',
          suite: currentDescribe,
          name: testName
        });
      }

      // Detect failing tests (✕)
      const failTestMatch = line.match(/✕\s+(.+?)(?:\s+\(\d+\s*m?s\))?$/);
      if (failTestMatch) {
        const testName = failTestMatch[1].trim();
        result.failedTests.push({
          suite: currentDescribe,
          name: testName
        });
        result.testSuites.push({
          status: 'failed',
          suite: currentDescribe,
          name: testName
        });
      }

      // Detect skipped tests (○)
      const skipTestMatch = line.match(/○\s+(.+?)$/);
      if (skipTestMatch) {
        const testName = skipTestMatch[1].trim();
        result.testSuites.push({
          status: 'skipped',
          suite: currentDescribe,
          name: testName
        });
      }
    }

    // Parse error messages for failed tests
    const errorBlocks = output.match(/● [\s\S]*?(?=\n\n● |\nTest Suites:|\n\nTest Suites:)/g);
    if (errorBlocks) {
      for (const block of errorBlocks) {
        const titleMatch = block.match(/● (.+)/);
        if (titleMatch) {
          const existingFailed = result.failedTests.find(t =>
            titleMatch[1].includes(t.name) || titleMatch[1].includes(t.suite)
          );
          if (existingFailed) {
            // Extract error message (first few lines after the title)
            const errorLines = block.split('\n').slice(1, 10).join('\n').trim();
            existingFailed.error = errorLines.substring(0, 500);
          } else {
            result.failedTests.push({
              name: titleMatch[1],
              error: block.substring(0, 500)
            });
          }
        }
      }
    }

    // Check for "PASS" or "FAIL" markers
    if (output.includes('PASS') && !output.includes('FAIL')) {
      result.success = true;
      if (result.summary.total === 0) {
        const passCount = (output.match(/PASS/g) || []).length;
        result.summary.passed = passCount;
        result.summary.total = passCount;
      }
    }

    // Dedupe testSuites - keep only individual tests, not file entries
    result.testSuites = result.testSuites.filter(t => t.name);

  } catch (error) {
    console.error('Error parsing Jest output:', error);
  }

  return result;
}

// Helper: Calculate Stats
function calculateStats(history) {
  if (history.length === 0) {
    return {
      successRate: 0,
      avgDuration: 0,
      totalTests: 0,
      trend: 'stable'
    };
  }

  const passed = history.filter(r => r.status === 'passed').length;
  const totalDuration = history.reduce((sum, r) => sum + (r.duration || 0), 0);
  const totalTests = history.reduce((sum, r) => sum + (r.summary?.total || 0), 0);

  // Trend berechnen (letzte 5 vs vorherige 5)
  let trend = 'stable';
  if (history.length >= 10) {
    const recent = history.slice(0, 5).filter(r => r.status === 'passed').length;
    const older = history.slice(5, 10).filter(r => r.status === 'passed').length;
    if (recent > older) trend = 'improving';
    else if (recent < older) trend = 'declining';
  }

  return {
    successRate: Math.round((passed / history.length) * 100),
    avgDuration: Math.round(totalDuration / history.length * 100) / 100,
    totalTests: Math.round(totalTests / history.length),
    trend
  };
}

export default router;
