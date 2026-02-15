<?php

if (defined('WP_CLI') && WP_CLI) {

    class CSM_CLI_Command {

        /**
         * Sync content from external API.
         * If you'd like to continue as root, run this adding flag:  --allow-root
         *
         * ## OPTIONS
         *
         * [--force]
         * : Force update existing records.
         *
         * ## EXAMPLES
         *
         *     wp content-sync sync
         *     wp content-sync sync --force
         */
        public function sync($args, $assoc_args)
        {
            $force = isset($assoc_args['force']);

            $sync = new CSM_Sync();
            $result = $sync->sync($force);

            if ($result) {
                WP_CLI::success('Content synced successfully.');
            } else {
                WP_CLI::error('Sync failed.');
            }
        }
    }

    WP_CLI::add_command('content-sync', 'CSM_CLI_Command');
}
