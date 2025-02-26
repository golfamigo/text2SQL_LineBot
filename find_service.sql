DROP FUNCTION IF EXISTS find_service CASCADE;

--- START OF FILE find_service.sql ---
-- 函數功能：查找服務
-- 參數:
--   p_business_id uuid: 商家 ID
--   p_service_name text: 服務名稱
-- 返回值:
--   TABLE: 包含 service_id (uuid) 和 matched_name (text)
CREATE OR REPLACE FUNCTION find_service(
    p_business_id uuid,
    p_service_name text
) RETURNS TABLE (
    service_id uuid,
    matched_name text
) AS $$
BEGIN
    -- 1. 嘗試完全匹配
    SELECT id, name INTO service_id, matched_name
    FROM n8n_booking_services
    WHERE business_id = p_business_id
      AND LOWER(name) = LOWER(p_service_name)
      AND is_active = true;

    -- 2. 如果沒有完全匹配，嘗試部分匹配
    IF NOT FOUND THEN
        SELECT id, name INTO service_id, matched_name
        FROM n8n_booking_services
        WHERE business_id = p_business_id
          AND is_active = true
          AND (
              LOWER(name) LIKE LOWER('%' || p_service_name || '%')
              OR 
              similarity(LOWER(name), LOWER(p_service_name)) > 0.4
          )
        ORDER BY 
            similarity(LOWER(name), LOWER(p_service_name)) DESC,
            name
        LIMIT 1;
    END IF;

    -- 如果還是沒找到，返回 NULL
    IF NOT FOUND THEN
        service_id := NULL;
        matched_name := NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;
--- END OF FILE find_service.sql ---