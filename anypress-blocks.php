<?php
/**
 * Plugin Name:       AnyPress Blocks
 * Plugin URI:        https://anypress.io/blocks
 * Description:       Interactive blocks for any block theme: a Popup for signups, offers and booking forms, a Carousel for reviews and projects, a Counter that counts up, and a Map of your address.
 * Version:           0.3.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            AnyPress
 * Author URI:        https://anypress.io
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       anypress-blocks
 *
 * @package AnyPress_Blocks
 */

defined( 'ABSPATH' ) || exit;

define( 'ANYPRESS_BLOCKS_VERSION', '0.3.0' );

/**
 * Registers every block in blocks/ from blocks-manifest.php, the blocks' block.json files in one array (bin/build-manifest.php),
 * so WordPress doesn't read and decode each block.json on every request.
 */
function anypress_blocks_register() {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/blocks', __DIR__ . '/blocks-manifest.php' );
}
add_action( 'init', 'anypress_blocks_register' );

require __DIR__ . '/includes/site-details.php';
