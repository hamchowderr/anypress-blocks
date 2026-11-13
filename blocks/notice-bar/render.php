<?php
/**
 * Notice Bar block: the saved message in a bar, with a close button when it can be dismissed. view.js (Interactivity
 * API store anypress/notice-bar) hides it once closed, for showAgain days or until its message changes.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks' HTML.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

if ( '' === trim( wp_strip_all_tags( $content ) ) ) {
	return;
}

$anypress_blocks_notice_id      = sanitize_title( $attributes['noticeId'] ?? '' );
$anypress_blocks_notice_dismiss = ! empty( $attributes['dismissible'] ?? true );
// A new message gets a new key, so visitors who closed the old one see it.
$anypress_blocks_notice_key = ( '' !== $anypress_blocks_notice_id ? $anypress_blocks_notice_id : 'notice' ) . ':' . substr( md5( $content ), 0, 8 );

$anypress_blocks_notice_attrs = array(
	'role'       => 'region',
	'aria-label' => __( 'Notice', 'anypress-blocks' ),
	'class'      => $anypress_blocks_notice_dismiss ? 'is-dismissible' : '',
);
if ( '' !== $anypress_blocks_notice_id ) {
	$anypress_blocks_notice_attrs['id'] = $anypress_blocks_notice_id;
}
if ( $anypress_blocks_notice_dismiss ) {
	$anypress_blocks_notice_attrs['data-wp-interactive'] = 'anypress/notice-bar';
	$anypress_blocks_notice_attrs['data-wp-context']     = wp_json_encode(
		array(
			'key'       => $anypress_blocks_notice_key,
			'showAgain' => max( 0, (int) ( $attributes['showAgainDays'] ?? 30 ) ),
		)
	);
	$anypress_blocks_notice_attrs['data-wp-init']        = 'callbacks.check';
}
$anypress_blocks_notice_wrapper = get_block_wrapper_attributes( $anypress_blocks_notice_attrs );
?>
<div <?php echo $anypress_blocks_notice_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks. ?>
	<?php if ( $anypress_blocks_notice_dismiss ) : ?>
	<button type="button" class="wp-block-anypress-notice-bar__close" data-wp-on--click="actions.dismiss" aria-label="<?php esc_attr_e( 'Close this notice', 'anypress-blocks' ); ?>"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
	<?php endif; ?>
</div>
