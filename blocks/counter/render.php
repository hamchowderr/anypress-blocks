<?php
/**
 * Counter block: prints the final number, so it reads right without JavaScript and for search engines;
 * view.js (Interactivity API store anypress/counter) counts up to it from zero when it scrolls into view.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_counter_number   = (float) ( $attributes['number'] ?? 0 );
$anypress_blocks_counter_decimals = min( 3, max( 0, (int) ( $attributes['decimals'] ?? 0 ) ) );
$anypress_blocks_counter_duration = min( 10, max( 0, (float) ( $attributes['duration'] ?? 2 ) ) );

$anypress_blocks_counter_wrapper = get_block_wrapper_attributes(
	array(
		'data-wp-interactive' => 'anypress/counter',
		'data-wp-context'     => wp_json_encode(
			array(
				'number'   => $anypress_blocks_counter_number,
				'decimals' => $anypress_blocks_counter_decimals,
				'duration' => $anypress_blocks_counter_duration,
			)
		),
		'data-wp-init'        => 'callbacks.countWhenSeen',
	)
);
?>
<p <?php echo $anypress_blocks_counter_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>><?php echo esc_html( $attributes['prefix'] ?? '' ); ?><span class="wp-block-anypress-counter__number"><?php echo esc_html( number_format_i18n( $anypress_blocks_counter_number, $anypress_blocks_counter_decimals ) ); ?></span><?php echo esc_html( $attributes['suffix'] ?? '' ); ?></p>
