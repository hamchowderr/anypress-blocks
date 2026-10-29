<?php
/**
 * Plugin Name:       AnyPress Blocks
 * Plugin URI:        https://anypress.io/blocks
 * Description:       Interactive blocks for any block theme: a Popup for signups, offers and booking forms, a Carousel for reviews and projects, a Counter that counts up, and a Map of your address.
 * Version:           0.2.0
 * Requires at least: 6.5
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

define( 'ANYPRESS_BLOCKS_VERSION', '0.2.0' );

/**
 * Registers every block in blocks/ from its block.json.
 */
function anypress_blocks_register() {
	foreach ( glob( __DIR__ . '/blocks/*/block.json' ) as $metadata ) {
		register_block_type( dirname( $metadata ) );
	}
}
add_action( 'init', 'anypress_blocks_register' );
