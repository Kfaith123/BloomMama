-- BloomMama Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS bloommama CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bloommama;

-- -------------------------------------------------------
-- USERS
-- -------------------------------------------------------
CREATE TABLE users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    phone       VARCHAR(20),
    password    VARCHAR(255)        NOT NULL,
    language    ENUM('en', 'rw')    NOT NULL DEFAULT 'en',
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- PREGNANCY PROFILES
-- -------------------------------------------------------
CREATE TABLE pregnancy_profiles (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           INT UNSIGNED        NOT NULL,
    due_date          DATE                NOT NULL,
    pregnancy_week    TINYINT UNSIGNED    NOT NULL DEFAULT 1,
    first_pregnancy   BOOLEAN             NOT NULL DEFAULT FALSE,
    last_period_date  DATE,
    doctor_name       VARCHAR(100),
    clinic_name       VARCHAR(150),
    created_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_week CHECK (pregnancy_week BETWEEN 1 AND 42)
);

-- -------------------------------------------------------
-- HEALTH LOGS
-- -------------------------------------------------------
CREATE TABLE health_logs (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED        NOT NULL,
    weight          DECIMAL(5,2),                           -- kg
    blood_pressure  VARCHAR(10),                            -- e.g. "120/80"
    temperature     DECIMAL(4,1),                          -- Celsius
    mood            ENUM('great','good','okay','low','bad'),
    notes           TEXT,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_health_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_health_user_date (user_id, created_at)
);

-- -------------------------------------------------------
-- KICK COUNTS
-- -------------------------------------------------------
CREATE TABLE kick_counts (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED    NOT NULL,
    kicks       TINYINT UNSIGNED NOT NULL DEFAULT 0,
    session_start TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date        DATE            NOT NULL,
    notes       VARCHAR(255),

    CONSTRAINT fk_kick_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_kick_user_date (user_id, date)
);

-- -------------------------------------------------------
-- REMINDERS
-- -------------------------------------------------------
CREATE TABLE reminders (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED    NOT NULL,
    type        ENUM('medicine', 'appointment', 'water', 'exercise', 'vitamins') NOT NULL,
    title       VARCHAR(150)    NOT NULL,
    time        TIME            NOT NULL,
    repeat_days VARCHAR(20),                               -- e.g. "Mon,Wed,Fri" or "daily"
    status      ENUM('active', 'snoozed', 'dismissed')    NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reminder_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reminder_user_status (user_id, status)
);

-- -------------------------------------------------------
-- WEEKLY CONTENT  (static pregnancy info per week)
-- -------------------------------------------------------
CREATE TABLE weekly_content (
    week            TINYINT UNSIGNED PRIMARY KEY,          -- 1–40
    baby_size       VARCHAR(50),                           -- e.g. "size of a lemon"
    baby_weight_g   SMALLINT UNSIGNED,
    baby_length_cm  DECIMAL(4,1),
    development_en  TEXT,
    development_rw  TEXT,
    tips_en         TEXT,
    tips_rw         TEXT
);

-- -------------------------------------------------------
-- SAMPLE DATA — weekly_content (weeks 1–3 as example)
-- -------------------------------------------------------
INSERT INTO weekly_content (week, baby_size, baby_weight_g, baby_length_cm, development_en, development_rw, tips_en, tips_rw) VALUES
(1,  'poppy seed',  0,   0.1,
 'Fertilization occurs. The embryo implants in the uterus.',
 'Inda itangira. Igi ryafumbira rirambikira mu nda.',
 'Start taking folic acid. Avoid alcohol and smoking.',
 'Tangira gufata folic acid. Irinda inzoga no kunywa sigara.'),

(2,  'sesame seed',  0,   0.2,
 'The neural tube begins to form. Cell division is rapid.',
 'Ubwonko n''umugongo bitangira gufomoka. Selile zigabanika vuba.',
 'Stay hydrated. Eat leafy greens like spinach.',
 'Nywa amazi ahagije. Rya imboga nkibijumba.'),

(3,  'apple seed',   0,   0.3,
 'The heart begins to beat. Basic organs start forming.',
 'Umutima utangira gukina. Ingingo z''ibanze zitangira gufomoka.',
 'Rest when tired. Small meals help with nausea.',
 'Pumzika igihe unanye. Kurya gato gato birinda isesemi.');
