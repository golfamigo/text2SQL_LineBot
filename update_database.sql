--- START OF FILE update_database.sql ---
-- 添加時區設定到商家表
ALTER TABLE n8n_booking_businesses
ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Taipei';

-- 為時段表添加分鐘表示
ALTER TABLE n8n_booking_time_periods
ADD COLUMN IF NOT EXISTS start_minutes integer,
ADD COLUMN IF NOT EXISTS end_minutes integer;

-- 更新現有數據
UPDATE n8n_booking_time_periods
SET start_minutes = EXTRACT(HOUR FROM start_time) * 60 + EXTRACT(MINUTE FROM start_time),
    end_minutes = EXTRACT(HOUR FROM end_time) * 60 + EXTRACT(MINUTE FROM end_time);

-- 添加檢查約束
ALTER TABLE n8n_booking_time_periods
ADD CONSTRAINT minutes_range_check 
CHECK (start_minutes >= 0 AND start_minutes < 1440 AND end_minutes > 0 AND end_minutes <= 1440);
--- END OF FILE update_database.sql ---