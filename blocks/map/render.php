<?php
/**
 * Map block: an OpenStreetMap map of the block's place with a pin, and a link for directions.
 * With "ask first" on, the map loads only when the visitor asks for it (view.js, Interactivity API store anypress/map), so nothing is sent to
 * OpenStreetMap until then. A block with no place set prints nothing.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

if ( ! isset( $attributes['lat'], $attributes['lon'] ) || ! is_numeric( $attributes['lat'] ) || ! is_numeric( $attributes['lon'] ) ) {
	return;
}

$anypress_blocks_map_lat    = max( -85.0, min( 85.0, (float) $attributes['lat'] ) );
$anypress_blocks_map_lon    = max( -180.0, min( 180.0, (float) $attributes['lon'] ) );
$anypress_blocks_map_zoom   = max( 3, min( 18, (int) ( $attributes['zoom'] ?? 14 ) ) );
$anypress_blocks_map_aspect = in_array( $attributes['aspect'] ?? '', array( '16/9', '4/3', '1/1', '21/9' ), true ) ? $attributes['aspect'] : '16/9';
$anypress_blocks_map_place  = '' !== ( $attributes['address'] ?? '' ) ? $attributes['address'] : __( 'Map', 'anypress-blocks' );

// The box the embed shows: about three map tiles wide at this zoom, a little less tall.
$anypress_blocks_map_dlon = 540 / pow( 2, $anypress_blocks_map_zoom );
$anypress_blocks_map_dlat = $anypress_blocks_map_dlon * cos( deg2rad( $anypress_blocks_map_lat ) ) * 0.6;
$anypress_blocks_map_src  = add_query_arg(
	array(
		'bbox'   => implode(
			',',
			array(
				round( $anypress_blocks_map_lon - $anypress_blocks_map_dlon, 5 ),
				round( $anypress_blocks_map_lat - $anypress_blocks_map_dlat, 5 ),
				round( $anypress_blocks_map_lon + $anypress_blocks_map_dlon, 5 ),
				round( $anypress_blocks_map_lat + $anypress_blocks_map_dlat, 5 ),
			)
		),
		'layer'  => 'mapnik',
		'marker' => round( $anypress_blocks_map_lat, 6 ) . ',' . round( $anypress_blocks_map_lon, 6 ),
	),
	'https://www.openstreetmap.org/export/embed.html'
);
$anypress_blocks_map_directions = add_query_arg(
	array(
		'api'         => '1',
		'destination' => rawurlencode( '' !== ( $attributes['address'] ?? '' ) ? $attributes['address'] : round( $anypress_blocks_map_lat, 6 ) . ',' . round( $anypress_blocks_map_lon, 6 ) ),
	),
	'https://www.google.com/maps/dir/'
);
/* translators: %s: the place shown, such as an address. */
$anypress_blocks_map_title = sprintf( __( 'Map of %s', 'anypress-blocks' ), $anypress_blocks_map_place );
$anypress_blocks_map_ask   = ! empty( $attributes['askFirst'] );

$anypress_blocks_map_wrapper = get_block_wrapper_attributes(
	array(
		'style' => '--anypress-map-aspect:' . $anypress_blocks_map_aspect,
		'class' => $anypress_blocks_map_ask ? 'is-ask-first' : '',
	)
);
?>
<figure <?php echo $anypress_blocks_map_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<div class="wp-block-anypress-map__frame">
		<?php if ( $anypress_blocks_map_ask ) : ?>
		<button type="button" class="wp-block-anypress-map__load" data-src="<?php echo esc_url( $anypress_blocks_map_src ); ?>" data-wp-interactive="anypress/map" <?php echo wp_interactivity_data_wp_context( array( 'src' => $anypress_blocks_map_src, 'title' => $anypress_blocks_map_title ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by wp_interactivity_data_wp_context(). ?> data-wp-on--click="actions.load"><?php esc_html_e( 'Show the map', 'anypress-blocks' ); ?><small><?php esc_html_e( 'Loads a map from OpenStreetMap', 'anypress-blocks' ); ?></small></button>
		<?php else : ?>
		<iframe src="<?php echo esc_url( $anypress_blocks_map_src ); ?>" title="<?php echo esc_attr( $anypress_blocks_map_title ); ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
		<?php endif; ?>
	</div>
	<?php if ( ! empty( $attributes['directions'] ?? true ) ) : ?>
	<figcaption class="wp-block-anypress-map__caption"><a href="<?php echo esc_url( $anypress_blocks_map_directions ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Get directions', 'anypress-blocks' ); ?></a></figcaption>
	<?php endif; ?>
</figure>
