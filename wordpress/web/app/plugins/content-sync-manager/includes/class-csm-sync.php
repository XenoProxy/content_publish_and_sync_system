<?php

class CSM_Sync
{
    private $api_url = 'https://jsonplaceholder.typicode.com/posts';

    public function sync($force = false)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . CSM_TABLE;

        $response = $this->fetch_with_retry();

        if (is_wp_error($response)) {
            error_log('CSM Sync error: ' . $response->get_error_message());
            return false;
        }

        $posts = json_decode(wp_remote_retrieve_body($response), true);

        if (!is_array($posts)) {
            return false;
        }

        foreach ($posts as $post) {

            $exists = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT id FROM $table_name WHERE external_id = %d",
                    $post['id']
                )
            );

            if ($exists && !$force) {
                continue;
            }

            $wpdb->replace(
                $table_name,
                [
                    'external_id' => $post['id'],
                    'user_id'     => $post['userId'],
                    'author_name' => 'User ' . $post['userId'],
                    'title'       => $post['title'],
                    'body'        => $post['body'],
                    'status'      => 'draft',
                    'synced_at'   => current_time('mysql'),
                    'created_at'  => current_time('mysql')
                ],
                [
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s'
                ]
            );
        }

        return true;
    }

    private function fetch_with_retry($attempts = 3)
    {
        $delay = 1;

        for ($i = 0; $i < $attempts; $i++) {

            $response = wp_remote_get($this->api_url);

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                return $response;
            }

            sleep($delay);
            $delay *= 2;
        }

        return new WP_Error('api_failed', 'Failed to fetch API after retries');
    }
}
