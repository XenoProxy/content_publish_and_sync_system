(function (blocks, element, components) {

    const { registerBlockType } = blocks;
    const { createElement: el, useState, useEffect } = element;
    const { Button, Spinner } = components;

    registerBlockType('csm/content-sync-preview', {
        title: 'Content Sync Preview',
        icon: 'list-view',
        category: 'widgets',

        edit: function () {

            const [posts, setPosts] = useState([]);
            const [loading, setLoading] = useState(true);

            const fetchPosts = () => {
                setLoading(true);

                fetch('/wp-json/content-sync/v1/posts?status=draft')
                    .then(res => res.json())
                    .then(data => {
                        setPosts(data.data || []);
                        setLoading(false);
                    });
            };

            const publishPost = (id) => {

                fetch('/wp-json/content-sync/v1/publish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpApiSettings.nonce
                    },
                    body: JSON.stringify({ id })
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Request failed');
                    }
                    return res.json();
                })
                .then(() => {
                    fetchPosts();
                })
                .catch(err => {
                    console.error(err);
                });
            };            

            useEffect(() => {
                fetchPosts();
            }, []);

            if (loading) {
                return el(Spinner);
            }

            if (!posts.length) {
                return el('div', {}, 'No draft posts found');
            }

            return el(
                'div',
                { style: { padding: '10px' } },
                posts.map(post =>
                    el(
                        'div',
                        {
                            key: post.id,
                            style: {
                                borderBottom: '1px solid #ddd',
                                marginBottom: '10px',
                                paddingBottom: '10px'
                            }
                        },
                        el('strong', {}, post.title),
                        el('p', {}, post.body.substring(0, 80) + '...'),
                        el(
                            Button,
                            {
                                isPrimary: true,
                                onClick: () => publishPost(post.id)
                            },
                            'Publish'
                        )
                    )
                )
            );
        },

        save: function () {
            return null;
        }
    });

})(window.wp.blocks, window.wp.element, window.wp.components);
