<?php
/**
 * Plugin Name: Content Sync Manager
 * Description: Syncs external content into a custom table and exposes REST API.
 * Version: 1.0.0
 * Author: Iryna
 */

if (!defined('ABSPATH')) {
    exit;
}

define('CSM_TABLE', 'content_sync_posts');

require_once plugin_dir_path(__FILE__) . 'includes/class-csm-database.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-csm-sync.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-csm-rest.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-csm-cli.php';


register_activation_hook(__FILE__, function () {

    CSM_Database::create_table();

    if (!wp_next_scheduled('csm_cron_sync')) {
        wp_schedule_event(time(), 'every_15_minutes', 'csm_cron_sync');
    }
});

register_deactivation_hook(__FILE__, function () {
    $timestamp = wp_next_scheduled('csm_cron_sync');
    if ($timestamp) {
        wp_unschedule_event($timestamp, 'csm_cron_sync');
    }
});

add_filter('cron_schedules', function ($schedules) {
    $schedules['every_15_minutes'] = [
        'interval' => 900,
        'display'  => 'Every 15 Minutes'
    ];
    return $schedules;
});

add_action('csm_cron_sync', function () {
    $sync = new CSM_Sync();
    $sync->sync();
});

new CSM_REST();
