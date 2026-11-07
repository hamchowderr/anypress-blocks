<?php
/**
 * Countdown block: the time left until the block's date, in the site's time zone. The page prints the time left when
 * it was made, and view.js (Interactivity API store anypress/countdown) keeps it ticking. Once the time is up it shows
 * the block's "when it ends" words, or nothing if there are none. A block with no date prints nothing.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_countdown_end = '' !== ( $attributes['date'] ?? '' ) ? date_create_immutable( $attributes['date'], wp_timezone() ) : false;
if ( ! $anypress_blocks_countdown_end ) {
	return;
}

$anypress_blocks_countdown_left    = max( 0, $anypress_blocks_countdown_end->getTimestamp() - time() );
$anypress_blocks_countdown_ended   = trim( (string) ( $attributes['endText'] ?? '' ) );
$anypress_blocks_countdown_seconds = ! empty( $attributes['showSeconds'] ?? true );
if ( 0 === $anypress_blocks_countdown_left && '' === $anypress_blocks_countdown_ended ) {
	return;
}

$anypress_blocks_countdown_units = array(
	'days'    => array( intdiv( $anypress_blocks_countdown_left, 86400 ), __( 'Days', 'anypress-blocks' ) ),
	'hours'   => array( intdiv( $anypress_blocks_countdown_left, 3600 ) % 24, __( 'Hours', 'anypress-blocks' ) ),
	'minutes' => array( intdiv( $anypress_blocks_countdown_left, 60 ) % 60, __( 'Minutes', 'anypress-blocks' ) ),
);
if ( $anypress_blocks_countdown_seconds ) {
	$anypress_blocks_countdown_units['seconds'] = array( $anypress_blocks_countdown_left % 60, __( 'Seconds', 'anypress-blocks' ) );
}

$anypress_blocks_countdown_wrapper = get_block_wrapper_attributes(
	array(
		'class'               => 0 === $anypress_blocks_countdown_left ? 'is-ended' : '',
		'role'                => 'timer',
		/* translators: %s: the date and time the countdown ends. */
		'aria-label'          => sprintf( __( 'Time left until %s', 'anypress-blocks' ), wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $anypress_blocks_countdown_end->getTimestamp() ) ),
		'data-wp-interactive' => 'anypress/countdown',
		'data-wp-context'     => wp_json_encode( array( 'end' => $anypress_blocks_countdown_end->getTimestamp() * 1000 ) ),
		'data-wp-init'        => 'callbacks.tick',
	)
);
?>
<div <?php echo $anypress_blocks_countdown_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<time class="wp-block-anypress-countdown__units" datetime="<?php echo esc_attr( $anypress_blocks_countdown_end->format( DATE_ATOM ) ); ?>">
		<?php foreach ( $anypress_blocks_countdown_units as $anypress_blocks_countdown_key => $anypress_blocks_countdown_unit ) : ?>
		<span class="wp-block-anypress-countdown__unit"><span class="wp-block-anypress-countdown__value" data-unit="<?php echo esc_attr( $anypress_blocks_countdown_key ); ?>"><?php echo esc_html( 'days' === $anypress_blocks_countdown_key ? (string) $anypress_blocks_countdown_unit[0] : str_pad( (string) $anypress_blocks_countdown_unit[0], 2, '0', STR_PAD_LEFT ) ); ?></span><span class="wp-block-anypress-countdown__label"><?php echo esc_html( $anypress_blocks_countdown_unit[1] ); ?></span></span>
		<?php endforeach; ?>
	</time>
	<?php if ( '' !== $anypress_blocks_countdown_ended ) : ?>
	<p class="wp-block-anypress-countdown__ended"><?php echo esc_html( $anypress_blocks_countdown_ended ); ?></p>
	<?php endif; ?>
</div>
