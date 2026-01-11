import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '../../services/api';
import { X, Bot, AlertTriangle, Save, Settings } from 'lucide-react';
import styles from '../../styles/pages/ContentReports.module.css';

interface AutoReviewConfigModalProps {
  onClose: () => void;
}

const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'custom', label: 'Custom API' }
];

const DEFAULT_SYSTEM_PROMPT = `Du bist ein Content-Moderator für MoneMee, eine Plattform für digitale Produkte (E-Books, Kurse, Templates). Deine Aufgabe ist es, gemeldete Inhalte auf Verstöße gegen die Inhaltsrichtlinien zu prüfen.

Verbotene Inhalte:
- Urheberrechtsverletzungen
- Betrug und Täuschung
- Illegale Inhalte
- Schadsoftware
- Hassrede und Diskriminierung
- Verletzung der Privatsphäre`;

const DEFAULT_REVIEW_PROMPT = `Analysiere die folgende Meldung und bewerte, ob ein Verstoß vorliegt.

Meldegrund: {{reason}}
Beschreibung des Meldenden: {{description}}
Produkt-URL: {{product_url}}

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt in folgendem Format:
{
  "violation_likely": true/false,
  "confidence": 0.0-1.0,
  "category": "copyright|fraud|illegal|harmful|hate|privacy|other|none",
  "severity": "low|medium|high|critical",
  "reasoning": "Kurze Begründung",
  "recommended_action": "remove|warn|monitor|no_action|manual_review"
}`;

export default function AutoReviewConfigModal({ onClose }: AutoReviewConfigModalProps) {
  const queryClient = useQueryClient();

  const [config, setConfig] = useState({
    enabled: false,
    llm_provider: 'openai',
    llm_model: 'gpt-4-turbo',
    llm_api_key: '',
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    review_prompt: DEFAULT_REVIEW_PROMPT,
    auto_resolve_threshold: 0.95,
    max_reviews_per_hour: 100
  });

  const [hasApiKey, setHasApiKey] = useState(false);

  // Fetch current config
  const { data: configData, isLoading } = useQuery({
    queryKey: ['auto-review-config'],
    queryFn: reportsAPI.getAutoReviewConfig,
    retry: false,
    onError: () => {
      // Config doesn't exist yet, use defaults
    }
  });

  useEffect(() => {
    if (configData?.data) {
      const data = configData.data;
      setConfig({
        enabled: data.enabled || false,
        llm_provider: data.llm_provider || 'openai',
        llm_model: data.llm_model || 'gpt-4-turbo',
        llm_api_key: '', // Never show the actual key
        system_prompt: data.system_prompt || DEFAULT_SYSTEM_PROMPT,
        review_prompt: data.review_prompt || DEFAULT_REVIEW_PROMPT,
        auto_resolve_threshold: data.auto_resolve_threshold || 0.95,
        max_reviews_per_hour: data.max_reviews_per_hour || 100
      });
      setHasApiKey(!!data.llm_api_key_encrypted);
    }
  }, [configData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => reportsAPI.updateAutoReviewConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-review-config'] });
      onClose();
    }
  });

  const handleSave = () => {
    const payload: any = {
      enabled: config.enabled,
      llm_provider: config.llm_provider,
      llm_model: config.llm_model,
      system_prompt: config.system_prompt,
      review_prompt: config.review_prompt,
      auto_resolve_threshold: config.auto_resolve_threshold,
      max_reviews_per_hour: config.max_reviews_per_hour
    };

    // Only include API key if it was changed
    if (config.llm_api_key) {
      payload.llm_api_key = config.llm_api_key;
    }

    updateMutation.mutate(payload);
  };

  const handleChange = (field: string, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ maxWidth: '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Bot size={20} />
            Automatische Bewertung konfigurieren
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner spinner-lg"></div>
            </div>
          ) : (
            <>
              {/* Enable Toggle */}
              <div className={styles.configSection}>
                <div className={styles.configHeader}>
                  <div>
                    <h3 className={styles.configTitle}>Automatische Bewertung</h3>
                    <p className={styles.configDescription}>
                      Nutze KI um eingehende Meldungen automatisch zu analysieren und zu
                      priorisieren.
                    </p>
                  </div>
                  <div
                    className={`${styles.toggle} ${config.enabled ? styles.active : ''}`}
                    onClick={() => handleChange('enabled', !config.enabled)}
                  >
                    <div className={styles.toggleKnob}></div>
                  </div>
                </div>

                {config.enabled && !hasApiKey && !config.llm_api_key && (
                  <div className={styles.warningBox}>
                    <AlertTriangle size={16} />
                    <span>
                      Bitte hinterlege einen API-Key um die automatische Bewertung zu aktivieren.
                    </span>
                  </div>
                )}
              </div>

              {/* LLM Configuration */}
              <div className={styles.configSection}>
                <h3 className={styles.configTitle}>LLM-Konfiguration</h3>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Provider</label>
                  <select
                    value={config.llm_provider}
                    onChange={(e) => handleChange('llm_provider', e.target.value)}
                    className="input"
                  >
                    {LLM_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Modell</label>
                  <input
                    type="text"
                    value={config.llm_model}
                    onChange={(e) => handleChange('llm_model', e.target.value)}
                    placeholder="z.B. gpt-4-turbo, claude-3-opus"
                    className="input"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    API Key {hasApiKey && '(bereits hinterlegt)'}
                  </label>
                  <input
                    type="password"
                    value={config.llm_api_key}
                    onChange={(e) => handleChange('llm_api_key', e.target.value)}
                    placeholder={hasApiKey ? '••••••••••••••••' : 'API Key eingeben'}
                    className="input"
                  />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Der API-Key wird verschlüsselt gespeichert.
                    {hasApiKey && ' Leer lassen um den bestehenden Key zu behalten.'}
                  </p>
                </div>
              </div>

              {/* Prompts */}
              <div className={styles.configSection}>
                <h3 className={styles.configTitle}>Prompts</h3>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>System Prompt</label>
                  <textarea
                    value={config.system_prompt}
                    onChange={(e) => handleChange('system_prompt', e.target.value)}
                    className={`input ${styles.promptTextarea}`}
                    rows={6}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Review Prompt</label>
                  <textarea
                    value={config.review_prompt}
                    onChange={(e) => handleChange('review_prompt', e.target.value)}
                    className={`input ${styles.promptTextarea}`}
                    rows={10}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Verfügbare Variablen: {'{{reason}}'}, {'{{description}}'}, {'{{product_url}}'}
                  </p>
                </div>
              </div>

              {/* Thresholds */}
              <div className={styles.configSection}>
                <h3 className={styles.configTitle}>Schwellwerte</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Auto-Resolve Threshold ({(config.auto_resolve_threshold * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.05"
                      value={config.auto_resolve_threshold}
                      onChange={(e) =>
                        handleChange('auto_resolve_threshold', parseFloat(e.target.value))
                      }
                      className="input"
                      style={{ padding: 0 }}
                    />
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Mindest-Confidence für automatische Aktionen
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Max. Reviews pro Stunde</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={config.max_reviews_per_hour}
                      onChange={(e) =>
                        handleChange('max_reviews_per_hour', parseInt(e.target.value))
                      }
                      className="input"
                    />
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Rate Limit für API-Aufrufe
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className="btn btn-ghost">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className="btn btn-primary"
          >
            <Save size={16} />
            {updateMutation.isPending ? 'Speichern...' : 'Konfiguration speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
