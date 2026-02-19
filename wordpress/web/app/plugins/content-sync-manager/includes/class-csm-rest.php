<?php

class CSM_REST
{
    const REST_NAMESPACE = 'content-sync/v1';

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes()
    {
        register_rest_route(self::REST_NAMESPACE, '/posts', [
            'methods'  => 'GET',
            'callback' => [$this, 'get_posts'],
            'permission_callback' => '__return_true',
            'args' => $this->get_args(),
        ]);

        register_rest_route(self::REST_NAMESPACE, '/publish', [
            'methods'  => 'POST',
            'callback' => [$this, 'publish_post'],
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
            'args' => [
                'id' => [
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ]
            ]
        ]);

        register_rest_route(self::REST_NAMESPACE, '/posts/(?P<id>\d+)', [
            'methods'  => 'GET',
            'callback' => [$this, 'get_single_post'],
            'permission_callback' => '__return_true',
        ]);
    }

    private function get_args()
    {
        return [
            'id' => [
                'sanitize_callback' => 'absint',
            ],
            'page' => [
                'default' => 1,
                'sanitize_callback' => 'absint',
            ],
            'per_page' => [
                'default' => 10,
                'sanitize_callback' => 'absint',
            ],
            'user_id' => [
                'sanitize_callback' => 'absint',
            ],
            'status' => [
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'orderby' => [
                'default' => 'id',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'order' => [
                'default' => 'desc',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'search' => [
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];
    }

    private function check_rate_limit()
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = 'csm_rate_' . md5($ip);

        $count = get_transient($key);

        if ($count === false) {
            set_transient($key, 1, MINUTE_IN_SECONDS);
            return true;
        }

        if ($count >= 120) {
            return false;
        }

        set_transient($key, $count + 1, MINUTE_IN_SECONDS);
        return true;
    }

    public function get_posts($request)
    {
        if (!$this->check_rate_limit()) {
            return new WP_Error(
                'rate_limited',
                'Too many requests',
                ['status' => 429]
            );
        }

        global $wpdb;
        $table = $wpdb->prefix . CSM_TABLE;

        $page     = max(1, (int)$request['page']);
        $per_page = min(50, max(1, (int)$request['per_page']));
        $offset   = ($page - 1) * $per_page;

        $where = 'WHERE 1=1';
        $params = [];

        if (!empty($request['id'])) {
            $where .= ' AND id = %d';
            $params[] = $request['id'];
        }

        if (!empty($request['user_id'])) {
            $where .= ' AND user_id = %d';
            $params[] = $request['user_id'];
        }

        if (!empty($request['status']) && in_array($request['status'], ['draft', 'published'])) {
            $where .= ' AND status = %s';
            $params[] = $request['status'];
        }

        if (!empty($request['search'])) {
            $where .= ' AND title LIKE %s';
            $params[] = '%' . $wpdb->esc_like($request['search']) . '%';
        }

        $allowed_orderby = ['id', 'synced_at', 'published_at'];
        $orderby = in_array($request['orderby'], $allowed_orderby)
            ? $request['orderby']
            : 'id';

        $order = strtolower($request['order']) === 'asc' ? 'ASC' : 'DESC';

        $cache_key = 'csm_posts_' . md5(serialize($request->get_params()));
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        $sql = $wpdb->prepare(
            "SELECT * FROM $table
              $where
              ORDER BY $orderby $order
              LIMIT %d OFFSET %d",
            array_merge($params, [$per_page, $offset])
        );

        $items = $wpdb->get_results($sql, ARRAY_A);

        $total = (int)$wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM $table $where", $params)
        );

        $response = [
            'data' => $items,
            'meta' => [
                'page' => $page,
                'per_page' => $per_page,
                'total' => $total,
                'total_pages' => ceil($total / $per_page),
            ],
        ];

        set_transient($cache_key, $response, 5 * MINUTE_IN_SECONDS);

        return $response;
    }

    public function get_single_post($request) {
        global $wpdb;

        $id = intval($request['id']);

        $post = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}content_sync_posts WHERE id = %d AND status = 'published'",
                $id
            ),
            ARRAY_A
        );
    
        if (!$post) {
            return new WP_Error('not_found', 'Post not found', ['status' => 404]);
        }
    
        return [
            'success' => true,
            'data'    => $post
        ];
    }

    public function publish_post($request)
    {
        global $wpdb;
        $table = $wpdb->prefix . CSM_TABLE;

        $id = absint($request['id']);

        if (!$id) {
            return new WP_Error('invalid_id', 'Invalid ID', ['status' => 400]);
        }

        $updated = $wpdb->update(
            $table,
            ['status' => 'published', 'published_at' => current_time('mysql')],
            ['id' => $id],
            ['%s', '%s'],
            ['%d']
        );

        if ($updated === false) {
            return new WP_Error('db_error', 'Database update failed', ['status' => 500]);
        }

        global $wpdb;
        $keys = $wpdb->get_col("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE '_transient_csm_posts_%'");
        foreach ($keys as $key) {
            $transient = str_replace('_transient_', '', $key);
            delete_transient($transient);
        }

        return [
            'success' => true,
            'id' => $id,
            'status' => 'published'
        ];
    }
}
