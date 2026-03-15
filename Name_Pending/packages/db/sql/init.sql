-- Automatically created schema for Name_Pending

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS market_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  timeframe text NOT NULL,
  ts timestamptz NOT NULL,
  open numeric(20,8) NOT NULL,
  high numeric(20,8) NOT NULL,
  low numeric(20,8) NOT NULL,
  close numeric(20,8) NOT NULL,
  volume numeric(30,10) NOT NULL,
  source text NOT NULL,
  ingested_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS market_candles_symbol_tf_ts_uq ON market_candles (symbol, timeframe, ts);
CREATE INDEX IF NOT EXISTS market_candles_symbol_ts_idx ON market_candles (symbol, ts);

CREATE TABLE IF NOT EXISTS news_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_id text NOT NULL,
  published_at timestamptz NOT NULL,
  title text NOT NULL,
  summary text,
  url text NOT NULL,
  symbols jsonb NOT NULL DEFAULT '[]',
  sentiment numeric(5,2),
  impact_score integer,
  raw jsonb NOT NULL,
  ingested_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS news_events_source_external_id_uq ON news_events (source, external_id);
CREATE INDEX IF NOT EXISTS news_events_published_at_idx ON news_events (published_at);

CREATE TABLE IF NOT EXISTS derived_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  timeframe text NOT NULL,
  ts timestamptz NOT NULL,
  feature text NOT NULL,
  value numeric(30,16) NOT NULL,
  source text NOT NULL DEFAULT 'engine',
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS derived_features_symbol_tf_ts_feature_uq ON derived_features (symbol, timeframe, ts, feature);
CREATE INDEX IF NOT EXISTS derived_features_symbol_ts_idx ON derived_features (symbol, ts);

CREATE TABLE IF NOT EXISTS ingestion_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  stream_key text NOT NULL,
  cursor text,
  last_success_at timestamptz,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  error text,
  healthy boolean NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS ingestion_checkpoints_source_stream_uq ON ingestion_checkpoints (source, stream_key);
