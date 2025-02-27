# AI Agent 職責劃分方案 (AI Agent Responsibility Division Plan)

**目標：**  將 database function 的操作權力分給不同的 AI agent 負責，並使用語意分析 AI 根據使用者角色和意圖分配路由，以提升系統的可維護性和安全性。

**AI Agent 類別：**

## 1. 客戶服務 AI Agent (Customer Service AI Agent)

*   **使用者角色：** 客戶 (Customer)
*   **職責範圍：** 處理所有客戶相關的操作，例如：
    *   **預約服務：** 建立預約、取消預約、查詢預約詳情、查詢預約紀錄
    *   **查詢服務：** 查詢服務項目、查詢服務時段、查詢服務空位
*   **相關 SQL 檔案:**
    *   `create_booking.sql`
    *   `cancel_booking.sql`
    *   `get_booking_details.sql`
    *   `get_bookings_by_customer_email.sql`
    *   `get_bookings_by_customer_phone.sql`
    *   `find_service.sql`
    *   `get_all_services.sql`
    *   `get_period_availability.sql`
    *   `get_period_availability_by_date.sql`
    *   `get_period_availability_by_service.sql`
    *   `get_period_availability_with_staff.sql`
    *   `get_service_booking_settings.sql`
    *   `timezone_utils.sql`

## 2. 員工管理 AI Agent (Staff Management AI Agent)

*   **使用者角色：** 員工 (Staff)
*   **職責範圍：** 處理所有員工相關的操作，例如：
    *   **排班管理：** 查詢個人排班表、設定個人可用時間
    *   **服務管理：** 查詢個人提供的服務項目
    *   **預約管理 (部分)：** 查詢個人相關的預約 (例如，今日預約)
*   **相關 SQL 檔案:**
    *   `get_staff_schedule.sql`
    *   `set_staff_availability.sql`
    *   `get_staff_availability_by_date.sql`
    *   `get_staff_services.sql`
    *   `get_staff_by_service.sql`
    *   `assign_service_to_staff.sql`

## 3. 商家管理 AI Agent (Business Management AI Agent)

*   **使用者角色：** 商家管理者 (Business Manager)
*   **職責範圍：** 處理所有商家管理相關的操作，擁有最高權限，可以管理服務、時段、員工、預約設定、系統設定等。
*   **相關 SQL 檔案:**  **所有 SQL 檔案**，包括但不限於上述兩個 AI Agent 負責的檔案，以及：
    *   `create_service.sql`, `update_service.sql`, `delete_service.sql`
    *   `create_period.sql`, `update_period.sql`, `delete_period.sql`
    *   `create_service_period_restriction.sql`, `delete_service_period_restriction.sql`, `get_service_period_restrictions.sql`, `update-service-period-restriction.sql`
    *   `create_staff.sql`, `update_staff.sql`, `get_all_staff.sql`
    *   `update_business_booking_settings.sql`, `get_service_booking_settings.sql`
    *   `get_detailed_availability.sql`
    *   `update_booking.sql`

**語意分析 AI 路由分配策略 (更新):**

1.  **使用者角色識別：**  語意分析 AI 需要識別使用者角色 (客戶、員工、商家管理者)。
2.  **意圖識別 (基於角色):**  針對不同的使用者角色，語意分析 AI 需要識別不同的意圖，例如：
    *   **客戶：**  預約服務、查詢服務、查詢空位
    *   **員工：**  查詢排班、設定可用時間
    *   **商家管理者：**  管理服務、管理員工、管理時段、查看報表、設定系統
3.  **路由規則配置:**  根據使用者角色和意圖配置路由規則，將使用者請求路由到對應的 AI Agent。

**總結:**

本方案基於使用者角色劃分了三個 AI Agent 的職責，並更新了語意分析 AI 的路由分配策略。 這個方案更符合實際應用場景，有助於提升系統的可維護性和安全性。