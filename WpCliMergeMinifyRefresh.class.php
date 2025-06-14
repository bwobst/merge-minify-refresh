<?php
/**
 * WP-CLI command to minify all merged assets.
 *
 * Syntax:
 *   wp --allow-root mmr minify
 *
 * For Bedrock sites, append /wp to the path argument.
 */

if (defined('WP_CLI') && WP_CLI) {
    class WpCliMergeMinifyRefresh
    {
        public function __construct()
        {
            // example constructor called when plugin loads
        }

        public function minify()
        {
            try {
                WP_CLI::log('Minifying all merged assets...');
                do_action('mmr_minify');
                WP_CLI::success('Done.');
            } catch (exception $e) {
                WP_CLI::error($e->getMessage());
            }
        }
    }

    WP_CLI::add_command('mmr', 'WpCliMergeMinifyRefresh');
}
