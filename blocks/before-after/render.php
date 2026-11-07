<?php
/**
 * Before and After block: the "after" photo over the "before" one, cut at the handle. The handle is a range input over
 * the photos, so a finger, a mouse and the arrow keys all move it; view.js (Interactivity API store
 * anypress/before-after) moves the cut. A block without both photos prints nothing.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_ba_image = static function ( $side, $class ) use ( $attributes ) {
	$id  = (int) ( $attributes[ $side . 'Id' ] ?? 0 );
	$alt = (string) ( $attributes[ $side . 'Alt' ] ?? '' );
	if ( $id && wp_attachment_is_image( $id ) ) {
		return wp_get_attachment_image(
			$id,
			'large',
			false,
			array(
				'class'   => $class,
				'alt'     => $alt,
				'loading' => 'lazy',
				'sizes'   => '(max-width: 1200px) 100vw, 1200px',
			)
		);
	}
	$url = (string) ( $attributes[ $side . 'Url' ] ?? '' );
	return '' === $url ? '' : sprintf( '<img class="%s" src="%s" alt="%s" loading="lazy" decoding="async" />', esc_attr( $class ), esc_url( $url ), esc_attr( $alt ) );
};

$anypress_blocks_ba_before = $anypress_blocks_ba_image( 'before', 'wp-block-anypress-before-after__before' );
$anypress_blocks_ba_after  = $anypress_blocks_ba_image( 'after', 'wp-block-anypress-before-after__after' );
if ( '' === $anypress_blocks_ba_before || '' === $anypress_blocks_ba_after ) {
	return;
}

$anypress_blocks_ba_start   = max( 0, min( 100, (int) ( $attributes['start'] ?? 50 ) ) );
$anypress_blocks_ba_aspect  = in_array( $attributes['aspect'] ?? '', array( '16/9', '4/3', '1/1', '3/4' ), true ) ? $attributes['aspect'] : '4/3';
$anypress_blocks_ba_label_b = '' !== ( $attributes['beforeLabel'] ?? '' ) ? $attributes['beforeLabel'] : __( 'Before', 'anypress-blocks' );
$anypress_blocks_ba_label_a = '' !== ( $attributes['afterLabel'] ?? '' ) ? $attributes['afterLabel'] : __( 'After', 'anypress-blocks' );

$anypress_blocks_ba_wrapper = get_block_wrapper_attributes(
	array(
		'style'               => "--anypress-ba-aspect:{$anypress_blocks_ba_aspect};--anypress-ba-pos:{$anypress_blocks_ba_start}%",
		'data-wp-interactive' => 'anypress/before-after',
	)
);
?>
<figure <?php echo $anypress_blocks_ba_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<div class="wp-block-anypress-before-after__frame">
		<?php echo $anypress_blocks_ba_before; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>
		<?php echo $anypress_blocks_ba_after; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>
		<span class="wp-block-anypress-before-after__label is-before" aria-hidden="true"><?php echo esc_html( $anypress_blocks_ba_label_b ); ?></span>
		<span class="wp-block-anypress-before-after__label is-after" aria-hidden="true"><?php echo esc_html( $anypress_blocks_ba_label_a ); ?></span>
		<span class="wp-block-anypress-before-after__handle" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" focusable="false"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
		<?php /* translators: 1: the "before" label. 2: the "after" label. */ ?>
		<input type="range" class="wp-block-anypress-before-after__range" min="0" max="100" step="1" value="<?php echo esc_attr( (string) $anypress_blocks_ba_start ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Compare %1$s and %2$s', 'anypress-blocks' ), $anypress_blocks_ba_label_b, $anypress_blocks_ba_label_a ) ); ?>" data-wp-on--input="actions.move" />
	</div>
</figure>
