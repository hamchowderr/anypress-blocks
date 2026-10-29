<?php
/**
 * Carousel block: puts the saved slides in a track that scrolls sideways, with arrow buttons.
 * Without JavaScript the track still scrolls by swipe or scroll bar; view.js adds the arrows, dots and autoplay.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks' HTML: one slide per block.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_carousel_per_view = min( 4, max( 1, (int) ( $attributes['perView'] ?? 3 ) ) );
$anypress_carousel_autoplay = min( 30, max( 0, (int) ( $attributes['autoplay'] ?? 0 ) ) );
$anypress_carousel_label    = '' !== ( $attributes['label'] ?? '' ) ? $attributes['label'] : __( 'Carousel', 'anypress-blocks' );
$anypress_carousel_arrows   = ! empty( $attributes['arrows'] ?? true );
$anypress_carousel_dots     = ! empty( $attributes['dots'] ?? true );

$anypress_carousel_wrapper = get_block_wrapper_attributes(
	array(
		'class'                => 'has-' . $anypress_carousel_per_view . '-per-view',
		'style'                => '--anypress-carousel-per-view:' . $anypress_carousel_per_view,
		'role'                 => 'region',
		'aria-roledescription' => __( 'carousel', 'anypress-blocks' ),
		'aria-label'           => $anypress_carousel_label,
		'data-autoplay'        => (string) $anypress_carousel_autoplay,
		'data-dots'            => $anypress_carousel_dots ? '1' : '0',
	)
);
?>
<div <?php echo $anypress_carousel_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<div class="wp-block-anypress-carousel__track" tabindex="0">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks. ?>
	</div>
	<?php if ( $anypress_carousel_arrows ) : ?>
	<div class="wp-block-anypress-carousel__nav">
		<button type="button" class="wp-block-anypress-carousel__prev" aria-label="<?php esc_attr_e( 'Previous slide', 'anypress-blocks' ); ?>"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
		<button type="button" class="wp-block-anypress-carousel__next" aria-label="<?php esc_attr_e( 'Next slide', 'anypress-blocks' ); ?>"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
	</div>
	<?php endif; ?>
</div>
