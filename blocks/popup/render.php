<?php
/**
 * Popup block: wraps the saved inner blocks in a <dialog> with its trigger settings.
 * view.js opens it; without JavaScript it stays closed and the page works as before.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks' HTML.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_popup_id = sanitize_title( $attributes['popupId'] ?? '' );
if ( '' === $anypress_popup_id ) {
	$anypress_popup_id = 'popup-' . substr( md5( $content ), 0, 8 );
}

$anypress_popup_trigger  = in_array( $attributes['trigger'] ?? '', array( 'delay', 'scroll', 'exit', 'click' ), true ) ? $attributes['trigger'] : 'delay';
$anypress_popup_size     = in_array( $attributes['size'] ?? '', array( 'small', 'medium', 'large' ), true ) ? $attributes['size'] : 'medium';
$anypress_popup_position = in_array( $attributes['position'] ?? '', array( 'center', 'bottom-right', 'bottom-left' ), true ) ? $attributes['position'] : 'center';
$anypress_popup_label    = '' !== ( $attributes['label'] ?? '' ) ? $attributes['label'] : __( 'Popup', 'anypress-blocks' );

$anypress_popup_wrapper = get_block_wrapper_attributes(
	array(
		'id'              => $anypress_popup_id,
		'class'           => "is-size-{$anypress_popup_size} is-position-{$anypress_popup_position}",
		'aria-label'      => $anypress_popup_label,
		'data-trigger'    => $anypress_popup_trigger,
		'data-delay'      => (string) max( 0, (float) ( $attributes['delay'] ?? 5 ) ),
		'data-scroll'     => (string) min( 100, max( 0, (int) ( $attributes['scroll'] ?? 50 ) ) ),
		'data-show-again' => (string) max( 0, (int) ( $attributes['showAgainDays'] ?? 7 ) ),
	)
);
?>
<dialog <?php echo $anypress_popup_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<button type="button" class="wp-block-anypress-popup__close" aria-label="<?php esc_attr_e( 'Close', 'anypress-blocks' ); ?>"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks. ?>
</dialog>
