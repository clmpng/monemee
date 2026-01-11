import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsAPI } from '../services/api';
import {
  Play,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileCode,
  Server,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import styles from '../styles/pages/common.module.css';

interface TestRun {
  runId: string;
  type: string;
  project: string;
  status: 'running' | 'passed' | 'failed' | 'error';
  summary?: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
  projects?: Record<string, ProjectResult>;
  duration?: number;
  timestamp: string;
  errors?: Array<{ project: string; error: string }>;
}

interface TestItem {
  status: 'passed' | 'failed' | 'skipped';
  suite?: string;
  name: string;
}

interface FailedTest {
  suite?: string;
  name: string;
  error?: string;
}

interface ProjectResult {
  success: boolean;
  passed: number;
  failed: number;
  skipped?: number;
  total: number;
  duration?: number;
  tests?: TestItem[];
  failedTests?: FailedTest[];
  output?: string;
  error?: string;
}

interface ProjectInfo {
  name: string;
  path: string;
  hasTests: boolean;
  scripts?: {
    test?: string;
    testUnit?: string;
    testIntegration?: string;
    testCoverage?: string;
  };
}

const projectIcons: Record<string, JSX.Element> = {
  client: <Globe size={18} />,
  server: <Server size={18} />,
  'mission-control': <FileCode size={18} />
};

const projectLabels: Record<string, string> = {
  client: 'Client (React)',
  server: 'Server (Express)',
  'mission-control': 'Mission Control Tests'
};

export default function Tests() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  // Queries
  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ['test-status'],
    queryFn: testsAPI.getStatus,
    refetchInterval: 3000
  });

  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ['test-history', selectedProject],
    queryFn: () => testsAPI.getHistory(30, selectedProject !== 'all' ? selectedProject : undefined)
  });

  const { data: projectsData } = useQuery({
    queryKey: ['test-projects'],
    queryFn: testsAPI.getProjects
  });

  // Mutations
  const runTests = useMutation({
    mutationFn: () => testsAPI.run(selectedType, false, selectedProject),
    onSuccess: () => {
      setTimeout(() => {
        refetchStatus();
        refetchHistory();
      }, 1000);
    }
  });

  const stopTests = useMutation({
    mutationFn: () => testsAPI.stop(),
    onSuccess: () => {
      refetchStatus();
    }
  });

  const latestRun = status?.data?.latestRun as TestRun | null;
  const stats = status?.data?.stats;
  const projects = projectsData?.data as ProjectInfo[] | undefined;
  const isRunning = status?.data?.runningTests?.length > 0 || runTests.isPending;

  // Trend Icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={16} style={{ color: 'var(--color-success-light)' }} />;
      case 'declining':
        return <TrendingDown size={16} style={{ color: 'var(--color-danger-light)' }} />;
      default:
        return <Minus size={16} style={{ color: 'var(--color-text-muted)' }} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Test Center</h1>
          <p className={styles.subtitle}>Automatisierte Tests für alle Projekte verwalten</p>
        </div>
        <button
          onClick={() => {
            refetchStatus();
            refetchHistory();
          }}
          className="btn btn-ghost"
          title="Aktualisieren"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Test Controls */}
      <div className="card">
        <h2 className={styles.sectionTitle}>Tests ausführen</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--spacing-md)', alignItems: 'end' }}>
          {/* Project Selection */}
          <div>
            <label className={styles.filterLabel} style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>
              Projekt
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="input"
              disabled={isRunning}
            >
              <option value="all">Alle Projekte</option>
              <option value="client">Client (React)</option>
              <option value="server">Server (Express)</option>
              <option value="mission-control">Mission Control</option>
            </select>
          </div>

          {/* Test Type Selection */}
          <div>
            <label className={styles.filterLabel} style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>
              Test-Typ
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
              disabled={isRunning}
            >
              <option value="all">Alle Tests</option>
              <option value="unit">Unit Tests</option>
              <option value="integration">Integration Tests</option>
            </select>
          </div>

          {/* Run/Stop Button */}
          {isRunning ? (
            <button onClick={() => stopTests.mutate()} className="btn btn-danger">
              <Square size={18} />
              Stoppen
            </button>
          ) : (
            <button onClick={() => runTests.mutate()} disabled={runTests.isPending} className="btn btn-primary">
              <Play size={18} />
              Tests starten
            </button>
          )}
        </div>

        {/* Running Status */}
        {isRunning && latestRun?.status === 'running' && (
          <div className="alert alert-info" style={{ marginTop: 'var(--spacing-md)' }}>
            <div className="flex items-center gap-sm">
              <span className="spinner spinner-sm"></span>
              <span>
                Tests laufen{latestRun.project !== 'all' && ` für ${projectLabels[latestRun.project] || latestRun.project}`}...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Project Status Cards */}
      {projects && projects.length > 0 && (
        <div className={styles.statsGrid}>
          {projects.map((project) => (
            <div key={project.name} className="card-compact">
              <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                {projectIcons[project.name]}
                <span style={{ fontWeight: 600 }}>{projectLabels[project.name] || project.name}</span>
              </div>
              <div className="flex items-center gap-xs">
                {project.hasTests ? (
                  <span className="badge badge-success">Tests verfügbar</span>
                ) : (
                  <span className="badge badge-warning">Keine Tests</span>
                )}
              </div>
              {project.scripts?.test && (
                <p className={styles.statSubtext} style={{ marginTop: 'var(--spacing-xs)' }}>
                  <code style={{ fontSize: '11px' }}>{project.scripts.test}</code>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Latest Run Summary */}
      {latestRun && latestRun.status !== 'running' && (
        <div className="card">
          <h2 className={styles.sectionTitle}>Letzter Test-Lauf</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
            <div>
              <p className={styles.statLabel}>Status</p>
              <span
                className={`badge ${
                  latestRun.status === 'passed'
                    ? 'badge-success'
                    : latestRun.status === 'failed'
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
                style={{ marginTop: 'var(--spacing-xs)', display: 'inline-block' }}
              >
                {latestRun.status === 'passed' ? 'Bestanden' : latestRun.status === 'failed' ? 'Fehlgeschlagen' : 'Fehler'}
              </span>
            </div>

            <div>
              <p className={styles.statLabel}>Bestanden</p>
              <p className={`${styles.statValueSmall} ${styles.statValueSuccess}`}>{latestRun.summary?.passed || 0}</p>
              <p className={styles.statSubtext}>von {latestRun.summary?.total || 0} Tests</p>
            </div>

            <div>
              <p className={styles.statLabel}>Fehlgeschlagen</p>
              <p className={`${styles.statValueSmall} ${styles.statValueDanger}`}>{latestRun.summary?.failed || 0}</p>
            </div>

            <div>
              <p className={styles.statLabel}>Dauer</p>
              <p className={styles.statValueSmall}>{latestRun.duration?.toFixed(1) || 0}s</p>
            </div>
          </div>

          {/* Project Breakdown */}
          {latestRun.projects && Object.keys(latestRun.projects).length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-lg)' }}>
              <p className={styles.filterLabel} style={{ marginBottom: 'var(--spacing-md)' }}>Ergebnisse pro Projekt</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {Object.entries(latestRun.projects).map(([projName, projResult]) => (
                  <div
                    key={projName}
                    className="flex items-center justify-between"
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div className="flex items-center gap-sm">
                      {projectIcons[projName]}
                      <span>{projectLabels[projName] || projName}</span>
                    </div>
                    <div className="flex items-center gap-md">
                      <span style={{ color: projResult.success ? 'var(--color-success-light)' : 'var(--color-danger-light)' }}>
                        {projResult.passed}/{projResult.total} bestanden
                      </span>
                      {projResult.success ? (
                        <CheckCircle size={18} style={{ color: 'var(--color-success-light)' }} />
                      ) : (
                        <XCircle size={18} style={{ color: 'var(--color-danger-light)' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall Statistics */}
      {stats && (
        <div className="card">
          <h2 className={styles.sectionTitle}>
            <BarChart3 size={20} style={{ marginRight: 'var(--spacing-sm)' }} />
            Statistiken
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
            <div>
              <p className={styles.statLabel}>Erfolgsrate</p>
              <p className={`${styles.statValue} ${stats.successRate >= 80 ? styles.statValueSuccess : stats.successRate >= 50 ? '' : styles.statValueDanger}`}>
                {stats.successRate}%
              </p>
            </div>
            <div>
              <p className={styles.statLabel}>Durchschn. Dauer</p>
              <p className={styles.statValue}>{stats.avgDuration}s</p>
            </div>
            <div>
              <p className={styles.statLabel}>Ø Tests pro Lauf</p>
              <p className={styles.statValue}>{stats.totalTests}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Trend</p>
              <div className="flex items-center gap-sm" style={{ marginTop: 'var(--spacing-xs)' }}>
                {getTrendIcon(stats.trend)}
                <span style={{ textTransform: 'capitalize' }}>
                  {stats.trend === 'improving' ? 'Steigend' : stats.trend === 'declining' ? 'Fallend' : 'Stabil'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test History */}
      <div className="card">
        <h2 className={styles.sectionTitle}>Test-Historie</h2>

        {!history?.data || history.data.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Noch keine Tests ausgeführt</p>
            <p className={styles.statSubtext}>Starte deinen ersten Test-Lauf oben</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {(history.data as TestRun[]).map((run) => (
              <div key={run.runId}>
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderRadius: expandedRun === run.runId ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onClick={() => setExpandedRun(expandedRun === run.runId ? null : run.runId)}
                >
                  <div className="flex items-center gap-md">
                    {run.status === 'passed' ? (
                      <CheckCircle style={{ color: 'var(--color-success-light)' }} size={24} />
                    ) : run.status === 'failed' ? (
                      <XCircle style={{ color: 'var(--color-danger-light)' }} size={24} />
                    ) : run.status === 'running' ? (
                      <RefreshCw style={{ color: 'var(--color-primary-light)' }} size={24} className="spin" />
                    ) : (
                      <AlertTriangle style={{ color: 'var(--color-warning-light)' }} size={24} />
                    )}

                    <div>
                      <p style={{ fontWeight: 500 }}>
                        {run.type.toUpperCase()} Tests
                        {run.project !== 'all' && ` - ${projectLabels[run.project] || run.project}`}
                      </p>
                      <p className={styles.infoText}>{new Date(run.timestamp).toLocaleString('de-DE')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-md">
                    {run.summary && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                          <span style={{ color: 'var(--color-success-light)' }}>{run.summary.passed}</span>
                          {' / '}
                          <span style={{ color: run.summary.failed > 0 ? 'var(--color-danger-light)' : 'var(--color-text-secondary)' }}>
                            {run.summary.failed}
                          </span>
                          {' / '}
                          {run.summary.total}
                        </p>
                        <p className={styles.statSubtext}>{run.duration?.toFixed(1)}s</p>
                      </div>
                    )}
                    {expandedRun === run.runId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRun === run.runId && run.projects && (
                  <div
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                      borderTop: '1px solid var(--color-border)'
                    }}
                  >
                    {Object.entries(run.projects).map(([projName, projResult]) => (
                      <div
                        key={projName}
                        style={{
                          marginBottom: 'var(--spacing-lg)',
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--color-bg-primary)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${projResult.success ? 'var(--color-success-light)' : 'var(--color-danger-light)'}20`
                        }}
                      >
                        {/* Project Header */}
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                          <div className="flex items-center gap-sm">
                            {projectIcons[projName]}
                            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>
                              {projectLabels[projName] || projName}
                            </span>
                          </div>
                          <div className="flex items-center gap-sm">
                            <span className={styles.statSubtext}>
                              {projResult.duration?.toFixed(1)}s
                            </span>
                            <span className={`badge ${projResult.success ? 'badge-success' : 'badge-danger'}`}>
                              {projResult.passed}/{projResult.total} bestanden
                            </span>
                          </div>
                        </div>

                        {/* Test List */}
                        {projResult.tests && projResult.tests.length > 0 && (
                          <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            {/* Group tests by suite */}
                            {(() => {
                              const suites = new Map<string, TestItem[]>();
                              projResult.tests.forEach(test => {
                                const suite = test.suite || 'Tests';
                                if (!suites.has(suite)) suites.set(suite, []);
                                suites.get(suite)!.push(test);
                              });

                              return Array.from(suites.entries()).map(([suite, tests]) => (
                                <div key={suite} style={{ marginBottom: 'var(--spacing-md)' }}>
                                  <p style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 600,
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: 'var(--spacing-xs)',
                                    paddingLeft: 'var(--spacing-xs)'
                                  }}>
                                    {suite}
                                  </p>
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: 'var(--spacing-xs)'
                                  }}>
                                    {tests.map((test, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-sm"
                                        style={{
                                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                                          borderRadius: 'var(--radius-xs)',
                                          fontSize: 'var(--font-size-sm)'
                                        }}
                                      >
                                        {test.status === 'passed' ? (
                                          <CheckCircle size={14} style={{ color: 'var(--color-success-light)', flexShrink: 0 }} />
                                        ) : test.status === 'failed' ? (
                                          <XCircle size={14} style={{ color: 'var(--color-danger-light)', flexShrink: 0 }} />
                                        ) : (
                                          <Clock size={14} style={{ color: 'var(--color-warning-light)', flexShrink: 0 }} />
                                        )}
                                        <span style={{
                                          color: test.status === 'failed' ? 'var(--color-danger-light)' : 'var(--color-text-primary)'
                                        }}>
                                          {test.name}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        )}

                        {/* Failed Tests with Error Messages */}
                        {projResult.failedTests && projResult.failedTests.length > 0 && (
                          <div style={{ marginTop: 'var(--spacing-md)' }}>
                            <p style={{
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 600,
                              color: 'var(--color-danger-light)',
                              marginBottom: 'var(--spacing-sm)'
                            }}>
                              Fehlermeldungen
                            </p>
                            {projResult.failedTests.filter(t => t.error).map((test, idx) => (
                              <div
                                key={idx}
                                style={{
                                  marginBottom: 'var(--spacing-sm)',
                                  padding: 'var(--spacing-sm)',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  borderRadius: 'var(--radius-sm)',
                                  borderLeft: '3px solid var(--color-danger-light)'
                                }}
                              >
                                <p style={{
                                  fontSize: 'var(--font-size-sm)',
                                  fontWeight: 500,
                                  color: 'var(--color-danger-light)',
                                  marginBottom: 'var(--spacing-xs)'
                                }}>
                                  {test.suite && `${test.suite} › `}{test.name}
                                </p>
                                <pre style={{
                                  fontSize: '11px',
                                  color: 'var(--color-text-secondary)',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  margin: 0,
                                  fontFamily: 'monospace'
                                }}>
                                  {test.error}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* General Error */}
                        {projResult.error && !projResult.failedTests?.length && (
                          <pre
                            style={{
                              marginTop: 'var(--spacing-sm)',
                              padding: 'var(--spacing-sm)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--color-danger-light)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px',
                              overflow: 'auto',
                              maxHeight: '200px'
                            }}
                          >
                            {projResult.error}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
