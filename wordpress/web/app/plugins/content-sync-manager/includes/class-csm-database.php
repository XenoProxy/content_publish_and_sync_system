<?php

class CSM_Database
{
    public static function create_table()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . CSM_TABLE;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            external_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,            
            author_name VARCHAR(255) NOT NULL,
            title TEXT NOT NULL,
            body LONGTEXT NOT NULL,
            synced_at DATETIME NOT NULL,
            status VARCHAR(20) DEFAULT 'draft',
            created_at DATETIME,
            published_at DATETIME NULL,
            PRIMARY KEY (id),
            UNIQUE KEY external_id (external_id),
            KEY user_id (user_id),
            KEY synced_at (synced_at)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }
}
