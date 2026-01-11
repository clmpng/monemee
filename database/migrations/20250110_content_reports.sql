-- =============================================
-- Content Reports Table (DSA Art. 16)
-- Speichert Meldungen über regelwidrige Inhalte
-- =============================================

-- Haupt-Tabelle für Content Reports
CREATE TABLE IF NOT EXISTS content_reports (
  id SERIAL PRIMARY KEY,

  -- Report Details
  report_id VARCHAR(20) UNIQUE NOT NULL, -- Öffentliche Report-ID (z.B. "RPT-A1B2C3")
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_url TEXT NOT NULL, -- Original-URL/ID wie eingegeben

  -- Meldegrund
  reason VARCHAR(50) NOT NULL, -- 'copyright', 'fraud', 'illegal', 'harmful', 'hate', 'privacy', 'other'
  description TEXT NOT NULL,

  -- Reporter Info (optional)
  reporter_email VARCHAR(255),
  reporter_name VARCHAR(255),
  reporter_ip VARCHAR(45), -- IPv4 or IPv6

  -- Status Management
  status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'in_review', 'resolved', 'rejected'
  priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Resolution
  resolution_action VARCHAR(50), -- 'removed', 'warning', 'no_action', 'escalated'
  resolution_note TEXT,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- LLM-Automatisierung
  auto_reviewed BOOLEAN DEFAULT FALSE,
  auto_review_result JSONB, -- Speichert LLM-Antwort
  auto_review_confidence DECIMAL(3,2), -- 0.00 - 1.00
  auto_review_at TIMESTAMP WITH TIME ZONE,

  -- Benachrichtigungen
  reporter_notified BOOLEAN DEFAULT FALSE,
  seller_notified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_product_id ON content_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_priority ON content_reports(priority);
CREATE INDEX IF NOT EXISTS idx_content_reports_reason ON content_reports(reason);

-- =============================================
-- LLM Auto-Review Konfiguration
-- Speichert Einstellungen für automatische Prüfung
-- =============================================

CREATE TABLE IF NOT EXISTS report_auto_review_config (
  id SERIAL PRIMARY KEY,

  -- Aktivierungsstatus
  enabled BOOLEAN DEFAULT FALSE,

  -- LLM-Konfiguration
  llm_provider VARCHAR(50) DEFAULT 'openai', -- 'openai', 'anthropic', 'custom'
  llm_model VARCHAR(100) DEFAULT 'gpt-4-turbo',
  llm_api_key_encrypted TEXT, -- Verschlüsselter API Key

  -- Prompts
  system_prompt TEXT DEFAULT 'Du bist ein Content-Moderator für eine Plattform für digitale Produkte. Analysiere die folgende Meldung und den gemeldeten Inhalt.',
  review_prompt TEXT DEFAULT 'Bewerte ob der gemeldete Inhalt gegen die Inhaltsrichtlinien verstößt. Antworte mit einem JSON-Objekt: {"violation": true/false, "confidence": 0.0-1.0, "category": "...", "reasoning": "..."}',

  -- Auto-Aktionen
  auto_resolve_threshold DECIMAL(3,2) DEFAULT 0.95, -- Confidence-Level für automatische Aktion
  auto_escalate_categories TEXT[] DEFAULT ARRAY['illegal', 'hate'], -- Immer eskalieren

  -- Rate Limiting
  max_reviews_per_hour INTEGER DEFAULT 100,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Standard-Konfiguration einfügen
INSERT INTO report_auto_review_config (enabled, system_prompt, review_prompt)
VALUES (
  FALSE,
  'Du bist ein Content-Moderator für MoneMee, eine Plattform für digitale Produkte (E-Books, Kurse, Templates). Deine Aufgabe ist es, gemeldete Inhalte auf Verstöße gegen die Inhaltsrichtlinien zu prüfen.

Verbotene Inhalte:
- Urheberrechtsverletzungen
- Betrug und Täuschung
- Illegale Inhalte
- Schadsoftware
- Hassrede und Diskriminierung
- Verletzung der Privatsphäre',
  'Analysiere die folgende Meldung und bewerte, ob ein Verstoß vorliegt.

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
}'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- Views für Dashboard und Statistiken
-- =============================================

-- Aktive Reports (nicht abgeschlossen)
CREATE OR REPLACE VIEW active_reports AS
SELECT
  cr.*,
  p.title as product_title,
  p.thumbnail_url as product_thumbnail,
  u.username as seller_username,
  u.email as seller_email
FROM content_reports cr
LEFT JOIN products p ON cr.product_id = p.id
LEFT JOIN users u ON p.user_id = u.id
WHERE cr.status IN ('pending', 'in_review')
ORDER BY
  CASE cr.priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END,
  cr.created_at ASC;

-- Report-Statistiken
CREATE OR REPLACE VIEW report_statistics AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'in_review') as in_review_count,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours
FROM content_reports;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_content_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_content_reports_updated ON content_reports;
CREATE TRIGGER trigger_content_reports_updated
BEFORE UPDATE ON content_reports
FOR EACH ROW
EXECUTE PROCEDURE update_content_reports_timestamp();

DROP TRIGGER IF EXISTS trigger_report_config_updated ON report_auto_review_config;
CREATE TRIGGER trigger_report_config_updated
BEFORE UPDATE ON report_auto_review_config
FOR EACH ROW
EXECUTE PROCEDURE update_content_reports_timestamp();
