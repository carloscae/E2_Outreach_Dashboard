-- Sprint 5: Add signal expiration system
-- Signals can expire based on type (time-sensitive vs informational)

-- Add expiration columns to signals table
ALTER TABLE signals 
ADD COLUMN IF NOT EXISTS signal_category TEXT DEFAULT 'informational',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ttl_days INTEGER;

-- Add constraint for signal_category
ALTER TABLE signals 
DROP CONSTRAINT IF EXISTS signals_signal_category_check;
ALTER TABLE signals 
ADD CONSTRAINT signals_signal_category_check 
CHECK (signal_category IN ('informational', 'time_sensitive'));

-- Add is_archived column for archived signals
ALTER TABLE signals
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create view for active (non-expired) signals
CREATE OR REPLACE VIEW active_signals AS
SELECT * FROM signals
WHERE is_archived = false 
  AND (expires_at IS NULL OR expires_at > NOW());

-- Create view for archived/expired signals  
CREATE OR REPLACE VIEW archived_signals AS
SELECT * FROM signals
WHERE is_archived = true 
   OR (expires_at IS NOT NULL AND expires_at <= NOW());

-- Create index for expiration queries
CREATE INDEX IF NOT EXISTS idx_signals_expires_at ON signals(expires_at);
CREATE INDEX IF NOT EXISTS idx_signals_is_archived ON signals(is_archived);
CREATE INDEX IF NOT EXISTS idx_signals_entity_type ON signals(entity_type);

-- Function to auto-set expiration based on signal type
CREATE OR REPLACE FUNCTION set_signal_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Set TTL based on signal type
  CASE NEW.signal_type
    WHEN 'MARKET_ENTRY' THEN
      NEW.signal_category := 'informational';
      NEW.ttl_days := 90;
    WHEN 'LICENSING' THEN
      NEW.signal_category := 'informational';
      NEW.ttl_days := 60;
    WHEN 'SPONSORSHIP' THEN
      NEW.signal_category := 'informational';
      NEW.ttl_days := 30;
    WHEN 'EXPANSION' THEN
      NEW.signal_category := 'informational';
      NEW.ttl_days := 60;
    WHEN 'TREND_SURGE' THEN
      NEW.signal_category := 'time_sensitive';
      NEW.ttl_days := 7;
    WHEN 'PUBLISHER_OPPORTUNITY' THEN
      NEW.signal_category := 'time_sensitive';
      NEW.ttl_days := 14;
    ELSE
      NEW.signal_category := 'informational';
      NEW.ttl_days := 30;
  END CASE;
  
  -- Calculate expires_at from collected_at + ttl_days
  IF NEW.ttl_days IS NOT NULL THEN
    NEW.expires_at := NEW.collected_at + (NEW.ttl_days || ' days')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set expiration on insert
DROP TRIGGER IF EXISTS trigger_set_signal_expiration ON signals;
CREATE TRIGGER trigger_set_signal_expiration
  BEFORE INSERT ON signals
  FOR EACH ROW
  EXECUTE FUNCTION set_signal_expiration();

-- Comment for documentation
COMMENT ON COLUMN signals.signal_category IS 'informational = long TTL, time_sensitive = short TTL';
COMMENT ON COLUMN signals.expires_at IS 'When this signal expires and moves to archive view';
COMMENT ON COLUMN signals.ttl_days IS 'Time-to-live in days based on signal_type';
COMMENT ON COLUMN signals.is_archived IS 'Manually archived by user or auto-archived after expiration';
