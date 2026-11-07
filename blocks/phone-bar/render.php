<?php
/**
 * Phone Bar block: Call and Book buttons fixed to the bottom of the screen. The phone number is the block's own, or the
 * one in Site details. A bar with neither a number nor a booking link prints nothing. No JavaScript.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_bar_phone = trim( (string) ( $attributes['phone'] ?? '' ) );
if ( '' === $anypress_blocks_bar_phone ) {
	$anypress_blocks_bar_phone = trim( (string) ( ( (array) get_option( 'anypress_site_details', array() ) )['phone'] ?? '' ) );
}
$anypress_blocks_bar_digits = preg_replace( '/[^0-9+]/', '', $anypress_blocks_bar_phone );
$anypress_blocks_bar_book   = trim( (string) ( $attributes['bookUrl'] ?? '' ) );
if ( '' === $anypress_blocks_bar_digits && '' === $anypress_blocks_bar_book ) {
	return;
}

$anypress_blocks_bar_call_label = '' !== ( $attributes['callLabel'] ?? '' ) ? $attributes['callLabel'] : __( 'Call now', 'anypress-blocks' );
$anypress_blocks_bar_book_label = '' !== ( $attributes['bookLabel'] ?? '' ) ? $attributes['bookLabel'] : __( 'Book online', 'anypress-blocks' );
$anypress_blocks_bar_phones     = 'all' !== ( $attributes['showOn'] ?? 'phones' );

$anypress_blocks_bar_wrapper = get_block_wrapper_attributes(
	array(
		'class'      => $anypress_blocks_bar_phones ? 'is-phones-only' : '',
		'role'       => 'region',
		'aria-label' => __( 'Call or book', 'anypress-blocks' ),
	)
);
?>
<div <?php echo $anypress_blocks_bar_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<?php if ( '' !== $anypress_blocks_bar_digits ) : ?>
	<a class="wp-block-anypress-phone-bar__call wp-element-button" href="<?php echo esc_url( 'tel:' . $anypress_blocks_bar_digits ); ?>"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor"/></svg><span><?php echo esc_html( $anypress_blocks_bar_call_label ); ?></span></a>
	<?php endif; ?>
	<?php if ( '' !== $anypress_blocks_bar_book ) : ?>
	<a class="wp-block-anypress-phone-bar__book" href="<?php echo esc_url( $anypress_blocks_bar_book ); ?>"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M7 2v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2zM5 9h14v11H5z" fill="currentColor"/></svg><span><?php echo esc_html( $anypress_blocks_bar_book_label ); ?></span></a>
	<?php endif; ?>
</div>
