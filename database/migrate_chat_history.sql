-- BloomMama: Chat history persistence
USE bloommama;

CREATE TABLE IF NOT EXISTS chat_messages (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED                    NOT NULL,
    role         ENUM('user', 'assistant')       NOT NULL,
    text         TEXT                            NOT NULL,
    is_emergency BOOLEAN                         NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP                       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_user_date (user_id, created_at)
);
