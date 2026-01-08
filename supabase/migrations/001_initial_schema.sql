-- ============================================================
-- AI Market Intelligence Agent - Initial Schema
-- Sprint 1: POC Foundation
-- Created by: Schema-State (State Engineer)
-- ============================================================

-- Agent execution logs (created first due to FK dependency)
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('collector', 'analyzer', 'reporter')),
  input_params JSONB,
  output_summary JSONB,
  token_usage JSONB,
  duration_ms INTEGER,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Raw signals from collection
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('bookmaker', 'publisher', 'app', 'channel')),
  geo TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  evidence JSONB NOT NULL,
  preliminary_score INTEGER CHECK (preliminary_score BETWEEN 0 AND 10),
  source_urls TEXT[],
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  agent_run_id UUID REFERENCES agent_runs(id)
);

-- AI-analyzed signals with scores
CREATE TABLE analyzed_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  final_score INTEGER CHECK (final_score BETWEEN 0 AND 14),
  score_breakdown JSONB NOT NULL,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  risk_flags JSONB,
  recommended_actions TEXT[],
  ai_reasoning TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  content_markdown TEXT NOT NULL,
  content_html TEXT,
  summary_stats JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  is_useful BOOLEAN NOT NULL,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for common queries
-- ============================================================

-- Signals: filter by geo, entity_type, collected_at
CREATE INDEX idx_signals_geo ON signals(geo);
CREATE INDEX idx_signals_entity_type ON signals(entity_type);
CREATE INDEX idx_signals_collected_at ON signals(collected_at DESC);
CREATE INDEX idx_signals_entity_name ON signals(entity_name);

-- Analyzed signals: filter by priority, score
CREATE INDEX idx_analyzed_signals_priority ON analyzed_signals(priority);
CREATE INDEX idx_analyzed_signals_final_score ON analyzed_signals(final_score DESC);
CREATE INDEX idx_analyzed_signals_analyzed_at ON analyzed_signals(analyzed_at DESC);

-- Feedback: filter by signal_id, user_email
CREATE INDEX idx_feedback_signal_id ON feedback(signal_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- Reports: filter by cycle dates
CREATE INDEX idx_reports_cycle_dates ON reports(cycle_start, cycle_end);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Agent runs: filter by type, status
CREATE INDEX idx_agent_runs_type ON agent_runs(agent_type);
CREATE INDEX idx_agent_runs_started_at ON agent_runs(started_at DESC);
