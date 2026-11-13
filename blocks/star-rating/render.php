<?php
/**
 * Star Rating block: a row of stars filled to the rating, and the rating in words ("4.9 out of 5 from 127 Google
 * reviews"). The stars are hidden from screen readers; the words carry the rating, visible or not.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_stars_out    = max( 3, min( 10, (int) ( $attributes['outOf'] ?? 5 ) ) );
$anypress_blocks_stars_rating = max( 0.0, min( (float) $anypress_blocks_stars_out, round( (float) ( $attributes['rating'] ?? 5 ), 1 ) ) );
$anypress_blocks_stars_count  = max( 0, (int) ( $attributes['count'] ?? 0 ) );
$anypress_blocks_stars_source = trim( (string) ( $attributes['source'] ?? '' ) );
$anypress_blocks_stars_shown  = number_format_i18n( $anypress_blocks_stars_rating, floor( $anypress_blocks_stars_rating ) === $anypress_blocks_stars_rating ? 0 : 1 );

if ( $anypress_blocks_stars_count > 0 && '' !== $anypress_blocks_stars_source ) {
	/* translators: 1: the rating, such as 4.9. 2: the best rating, such as 5. 3: how many reviews. 4: where the reviews are, such as Google. */
	$anypress_blocks_stars_text = sprintf( _n( '%1$s out of %2$s from %3$s %4$s review', '%1$s out of %2$s from %3$s %4$s reviews', $anypress_blocks_stars_count, 'anypress-blocks' ), $anypress_blocks_stars_shown, $anypress_blocks_stars_out, number_format_i18n( $anypress_blocks_stars_count ), $anypress_blocks_stars_source );
} elseif ( $anypress_blocks_stars_count > 0 ) {
	/* translators: 1: the rating, such as 4.9. 2: the best rating, such as 5. 3: how many reviews. */
	$anypress_blocks_stars_text = sprintf( _n( '%1$s out of %2$s from %3$s review', '%1$s out of %2$s from %3$s reviews', $anypress_blocks_stars_count, 'anypress-blocks' ), $anypress_blocks_stars_shown, $anypress_blocks_stars_out, number_format_i18n( $anypress_blocks_stars_count ) );
} else {
	/* translators: 1: the rating, such as 4.9. 2: the best rating, such as 5. */
	$anypress_blocks_stars_text = sprintf( __( 'Rated %1$s out of %2$s', 'anypress-blocks' ), $anypress_blocks_stars_shown, $anypress_blocks_stars_out );
}

$anypress_blocks_stars_star = '<svg viewBox="0 0 24 24" width="24" height="24" focusable="false"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
$anypress_blocks_stars_row  = str_repeat( $anypress_blocks_stars_star, $anypress_blocks_stars_out );

$anypress_blocks_stars_wrapper = get_block_wrapper_attributes(
	array(
		'style' => '--anypress-rating:' . round( $anypress_blocks_stars_rating / $anypress_blocks_stars_out * 100, 2 ) . '%',
	)
);
?>
<p <?php echo $anypress_blocks_stars_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<span class="wp-block-anypress-star-rating__stars" aria-hidden="true"><span class="wp-block-anypress-star-rating__empty"><?php echo $anypress_blocks_stars_row; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed SVG. ?></span><span class="wp-block-anypress-star-rating__full"><?php echo $anypress_blocks_stars_row; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed SVG. ?></span></span>
	<span class="wp-block-anypress-star-rating__text<?php echo empty( $attributes['showText'] ?? true ) ? ' screen-reader-text' : ''; ?>"><?php echo esc_html( $anypress_blocks_stars_text ); ?></span>
</p>
