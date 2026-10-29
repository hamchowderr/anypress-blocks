<?php
/**
 * Counter block: prints the final number, so it reads right without JavaScript and for search engines;
 * view.js counts up to it from zero when it scrolls into view.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_counter_number   = (float) ( $attributes['number'] ?? 0 );
$anypress_counter_decimals = min( 3, max( 0, (int) ( $attributes['decimals'] ?? 0 ) ) );
$anypress_counter_duration = min( 10, max( 0, (float) ( $attributes['duration'] ?? 2 ) ) );

$anypress_counter_wrapper = get_block_wrapper_attributes(
	array(
		'data-number'   => (string) $anypress_counter_number,
		'data-decimals' => (string) $anypress_counter_decimals,
		'data-duration' => (string) $anypress_counter_duration,
	)
);
?>
<p <?php echo $anypress_counter_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>><?php echo esc_html( $attributes['prefix'] ?? '' ); ?><span class="wp-block-anypress-counter__number"><?php echo esc_html( number_format_i18n( $anypress_counter_number, $anypress_counter_decimals ) ); ?></span><?php echo esc_html( $attributes['suffix'] ?? '' ); ?></p>
