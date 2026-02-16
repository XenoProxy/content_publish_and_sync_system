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

add_action('init', function () {

    if (!function_exists('register_block_type')) {
        return;
    }

    $plugin_url  = plugin_dir_url(__FILE__);
    $plugin_path = plugin_dir_path(__FILE__);

    wp_register_script(
        'csm-block-js',
        $plugin_url . 'block/index.js',
        ['wp-blocks', 'wp-element', 'wp-components'],
        filemtime($plugin_path . 'block/index.js')
    );    

    wp_register_style(
        'csm-block-css',
        $plugin_url . 'block/style.css',
        [],
        filemtime($plugin_path . 'block/style.css')
    );

    register_block_type('csm/content-sync-preview', [
        'editor_script' => 'csm-block-js',
        'editor_style'  => 'csm-block-css',
    ]);
});

