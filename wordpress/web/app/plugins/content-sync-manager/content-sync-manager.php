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
// require_once plugin_dir_path(__FILE__) . 'includes/class-csm-sync.php';
// require_once plugin_dir_path(__FILE__) . 'includes/class-csm-rest.php';

register_activation_hook(__FILE__, ['CSM_Database', 'create_table']);

// add_action('init', function () {
//     new CSM_Sync();
//     new CSM_REST();
// });
