<?php
/**
 * Location Finder block: a list of locations and an OpenStreetMap map of the one picked. view.js (Interactivity API
 * store anypress/location-finder) filters the list as the visitor types, sorts it by distance after "Near me" (the
 * browser asks the visitor first; nothing is sent anywhere), and moves the map to the location picked. Without
 * JavaScript the whole list shows, each with a directions link, and the map shows the first location.
 * Locations without a latitude and longitude are left out; a block with none prints nothing.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_lf_zoom  = max( 3, min( 18, (int) ( $attributes['zoom'] ?? 14 ) ) );
$anypress_blocks_lf_embed = static function ( $lat, $lon ) use ( $anypress_blocks_lf_zoom ) {
	$dlon = 540 / pow( 2, $anypress_blocks_lf_zoom );
	$dlat = $dlon * cos( deg2rad( $lat ) ) * 0.6;
	return add_query_arg(
		array(
			'bbox'   => implode( ',', array( round( $lon - $dlon, 5 ), round( $lat - $dlat, 5 ), round( $lon + $dlon, 5 ), round( $lat + $dlat, 5 ) ) ),
			'layer'  => 'mapnik',
			'marker' => round( $lat, 6 ) . ',' . round( $lon, 6 ),
		),
		'https://www.openstreetmap.org/export/embed.html'
	);
};

$anypress_blocks_lf_places = array();
foreach ( (array) ( $attributes['locations'] ?? array() ) as $anypress_blocks_lf_place ) {
	if ( ! is_array( $anypress_blocks_lf_place ) || ! isset( $anypress_blocks_lf_place['lat'], $anypress_blocks_lf_place['lon'] ) || ! is_numeric( $anypress_blocks_lf_place['lat'] ) || ! is_numeric( $anypress_blocks_lf_place['lon'] ) ) {
		continue;
	}
	$anypress_blocks_lf_lat      = max( -85.0, min( 85.0, (float) $anypress_blocks_lf_place['lat'] ) );
	$anypress_blocks_lf_lon      = max( -180.0, min( 180.0, (float) $anypress_blocks_lf_place['lon'] ) );
	$anypress_blocks_lf_name     = trim( (string) ( $anypress_blocks_lf_place['name'] ?? '' ) );
	$anypress_blocks_lf_address  = trim( (string) ( $anypress_blocks_lf_place['address'] ?? '' ) );
	$anypress_blocks_lf_places[] = array(
		'name'    => '' !== $anypress_blocks_lf_name ? $anypress_blocks_lf_name : $anypress_blocks_lf_address,
		'address' => $anypress_blocks_lf_address,
		'phone'   => trim( (string) ( $anypress_blocks_lf_place['phone'] ?? '' ) ),
		'hours'   => trim( (string) ( $anypress_blocks_lf_place['hours'] ?? '' ) ),
		'url'     => trim( (string) ( $anypress_blocks_lf_place['url'] ?? '' ) ),
		'lat'     => $anypress_blocks_lf_lat,
		'lon'     => $anypress_blocks_lf_lon,
	);
}
if ( ! $anypress_blocks_lf_places ) {
	return;
}

$anypress_blocks_lf_id      = wp_unique_id( 'anypress-location-search-' );
$anypress_blocks_lf_context = array(
	'current' => 0,
	'query'   => '',
	'dist'    => array(),
	'status'  => '',
	'units'   => 'km' === ( $attributes['units'] ?? 'mi' ) ? 'km' : 'mi',
	'places'  => array_map(
		static function ( $place ) use ( $anypress_blocks_lf_embed ) {
			return array(
				'text'  => function_exists( 'mb_strtolower' ) ? mb_strtolower( $place['name'] . ' ' . $place['address'] ) : strtolower( $place['name'] . ' ' . $place['address'] ),
				'src'   => $anypress_blocks_lf_embed( $place['lat'], $place['lon'] ),
				/* translators: %s: a location's name. */
				'title' => sprintf( __( 'Map of %s', 'anypress-blocks' ), $place['name'] ),
				'lat'   => $place['lat'],
				'lon'   => $place['lon'],
			);
		},
		$anypress_blocks_lf_places
	),
	'words'   => array(
		/* translators: 1: how many locations match. 2: how many there are. */
		'some'    => __( 'Showing %1$d of %2$d locations', 'anypress-blocks' ),
		'none'    => __( 'No locations match. Try a town, a street or a zip code.', 'anypress-blocks' ),
		'finding' => __( 'Finding where you are…', 'anypress-blocks' ),
		'sorted'  => __( 'Nearest first', 'anypress-blocks' ),
		'failed'  => __( 'Your location isn\'t available. Search by town or zip code instead.', 'anypress-blocks' ),
		/* translators: %s: a distance, such as 2.4. */
		'mi'      => __( '%s mi away', 'anypress-blocks' ),
		/* translators: %s: a distance, such as 2.4. */
		'km'      => __( '%s km away', 'anypress-blocks' ),
	),
);

// The same derived state view.js has, for the page as it is first sent: everything listed, in order, the first
// location on the map. Without it the server would print the list hidden and the map without a link.
wp_interactivity_state(
	'anypress/location-finder',
	array(
		'matches'    => static function () {
			return true;
		},
		'isCurrent'  => static function () {
			$context = wp_interactivity_get_context();
			return ( $context['index'] ?? -1 ) === ( $context['current'] ?? 0 );
		},
		'order'      => static function () {
			return (string) ( wp_interactivity_get_context()['index'] ?? 0 );
		},
		'distance'   => static function () {
			return '';
		},
		'statusText' => static function () {
			return '';
		},
		'src'        => static function () {
			$context = wp_interactivity_get_context();
			return $context['places'][ $context['current'] ?? 0 ]['src'] ?? '';
		},
		'mapTitle'   => static function () {
			$context = wp_interactivity_get_context();
			return $context['places'][ $context['current'] ?? 0 ]['title'] ?? '';
		},
	)
);

$anypress_blocks_lf_wrapper = get_block_wrapper_attributes(
	array(
		'data-wp-interactive' => 'anypress/location-finder',
		'data-wp-context'     => wp_json_encode( $anypress_blocks_lf_context ),
	)
);
$anypress_blocks_lf_first = $anypress_blocks_lf_context['places'][0];
?>
<div <?php echo $anypress_blocks_lf_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<div class="wp-block-anypress-location-finder__panel">
		<?php if ( ! empty( $attributes['search'] ?? true ) && count( $anypress_blocks_lf_places ) > 1 ) : ?>
		<form class="wp-block-anypress-location-finder__search" role="search" data-wp-on--submit="actions.stop">
			<label for="<?php echo esc_attr( $anypress_blocks_lf_id ); ?>"><?php esc_html_e( 'Search by town, street or zip code', 'anypress-blocks' ); ?></label>
			<div class="wp-block-anypress-location-finder__fields">
				<input id="<?php echo esc_attr( $anypress_blocks_lf_id ); ?>" type="search" autocomplete="postal-code" data-wp-on--input="actions.search" />
				<button type="button" class="wp-block-anypress-location-finder__near" data-wp-on--click="actions.nearMe"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg><?php esc_html_e( 'Near me', 'anypress-blocks' ); ?></button>
			</div>
		</form>
		<p class="wp-block-anypress-location-finder__status" aria-live="polite" data-wp-text="state.statusText"></p>
		<?php endif; ?>
		<ul class="wp-block-anypress-location-finder__list">
			<?php foreach ( $anypress_blocks_lf_places as $anypress_blocks_lf_index => $anypress_blocks_lf_place ) : ?>
			<li class="wp-block-anypress-location-finder__place" <?php echo wp_interactivity_data_wp_context( array( 'index' => $anypress_blocks_lf_index ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by wp_interactivity_data_wp_context(). ?> data-wp-bind--hidden="!state.matches" data-wp-style--order="state.order" data-wp-class--is-current="state.isCurrent">
				<button type="button" class="wp-block-anypress-location-finder__pick" aria-pressed="<?php echo 0 === $anypress_blocks_lf_index ? 'true' : 'false'; ?>" data-wp-bind--aria-pressed="state.isCurrent" data-wp-on--click="actions.pick">
					<strong><?php echo esc_html( $anypress_blocks_lf_place['name'] ); ?></strong>
					<?php if ( '' !== $anypress_blocks_lf_place['address'] && $anypress_blocks_lf_place['address'] !== $anypress_blocks_lf_place['name'] ) : ?>
					<span><?php echo esc_html( $anypress_blocks_lf_place['address'] ); ?></span>
					<?php endif; ?>
					<span class="wp-block-anypress-location-finder__distance" data-wp-text="state.distance"></span>
				</button>
				<?php if ( '' !== $anypress_blocks_lf_place['hours'] ) : ?>
				<p class="wp-block-anypress-location-finder__hours"><?php echo esc_html( $anypress_blocks_lf_place['hours'] ); ?></p>
				<?php endif; ?>
				<p class="wp-block-anypress-location-finder__links">
					<?php if ( '' !== preg_replace( '/[^0-9+]/', '', $anypress_blocks_lf_place['phone'] ) ) : ?>
					<a href="<?php echo esc_url( 'tel:' . preg_replace( '/[^0-9+]/', '', $anypress_blocks_lf_place['phone'] ) ); ?>"><?php echo esc_html( $anypress_blocks_lf_place['phone'] ); ?></a>
					<?php endif; ?>
					<a href="<?php echo esc_url( add_query_arg( array( 'api' => '1', 'destination' => rawurlencode( '' !== $anypress_blocks_lf_place['address'] ? $anypress_blocks_lf_place['address'] : $anypress_blocks_lf_place['lat'] . ',' . $anypress_blocks_lf_place['lon'] ) ), 'https://www.google.com/maps/dir/' ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Get directions', 'anypress-blocks' ); ?></a>
					<?php if ( '' !== $anypress_blocks_lf_place['url'] ) : ?>
					<?php /* translators: %s: a location's name. */ ?>
					<a href="<?php echo esc_url( $anypress_blocks_lf_place['url'] ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'About %s', 'anypress-blocks' ), $anypress_blocks_lf_place['name'] ) ); ?>"><?php esc_html_e( 'Location page', 'anypress-blocks' ); ?></a>
					<?php endif; ?>
				</p>
			</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<div class="wp-block-anypress-location-finder__map">
		<iframe src="<?php echo esc_url( $anypress_blocks_lf_first['src'] ); ?>" title="<?php echo esc_attr( $anypress_blocks_lf_first['title'] ); ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-wp-bind--src="state.src" data-wp-bind--title="state.mapTitle"></iframe>
	</div>
</div>
