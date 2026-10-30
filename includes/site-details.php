<?php
/**
 * Site details: the business's name, phone, email, address and hours, kept once in the site's settings and shown
 * by any heading, paragraph, button or image through the block bindings source "anypress/site-details". Change a
 * detail once (in the editor, in Settings > General, or through the REST API) and every page shows the new one.
 *
 * @package AnyPress_Blocks
 */

defined( 'ABSPATH' ) || exit;

/**
 * The details a site can keep, and how each one is labelled in the editor.
 *
 * @return array<string, string>
 */
function anypress_blocks_site_detail_fields() {
	return array(
		'name'    => __( 'Business name', 'anypress-blocks' ),
		'phone'   => __( 'Phone', 'anypress-blocks' ),
		'email'   => __( 'Email', 'anypress-blocks' ),
		'address' => __( 'Address', 'anypress-blocks' ),
		'hours'   => __( 'Opening hours', 'anypress-blocks' ),
	);
}

/**
 * Registers the setting (shown in REST at /wp/v2/settings as anypress_site_details) and the bindings source.
 */
function anypress_blocks_register_site_details() {
	$properties = array();
	foreach ( array_keys( anypress_blocks_site_detail_fields() ) as $key ) {
		$properties[ $key ] = array( 'type' => 'string' );
	}
	register_setting(
		'general',
		'anypress_site_details',
		array(
			'type'              => 'object',
			'label'             => __( 'Site details', 'anypress-blocks' ),
			'description'       => __( 'The business name, phone, email, address and opening hours that pages show.', 'anypress-blocks' ),
			'default'           => array(),
			'sanitize_callback' => 'anypress_blocks_sanitize_site_details',
			'show_in_rest'      => array(
				'schema' => array(
					'type'                 => 'object',
					'properties'           => $properties,
					'additionalProperties' => false,
				),
			),
		)
	);

	register_block_bindings_source(
		'anypress/site-details',
		array(
			'label'              => __( 'Site details', 'anypress-blocks' ),
			'get_value_callback' => 'anypress_blocks_site_detail_value',
		)
	);
}
add_action( 'init', 'anypress_blocks_register_site_details' );

/**
 * Keeps only the known details, as plain text (the address and hours may have line breaks).
 *
 * @param mixed $value The submitted details.
 * @return array<string, string>
 */
function anypress_blocks_sanitize_site_details( $value ) {
	$clean = array();
	foreach ( array_keys( anypress_blocks_site_detail_fields() ) as $key ) {
		if ( is_array( $value ) && isset( $value[ $key ] ) && is_string( $value[ $key ] ) ) {
			$text = in_array( $key, array( 'address', 'hours' ), true ) ? sanitize_textarea_field( $value[ $key ] ) : sanitize_text_field( $value[ $key ] );
			if ( 'email' === $key ) {
				$text = sanitize_email( $text );
			}
			if ( '' !== $text ) {
				$clean[ $key ] = $text;
			}
		}
	}
	return $clean;
}

/**
 * One detail for a bound block. args.key names the detail; "phone_link" and "email_link" give a tel: or mailto: link
 * for a button. An empty detail returns null, so the block shows the text saved in it.
 *
 * @param array $source_args Binding args.
 * @return string|null
 */
function anypress_blocks_site_detail_value( array $source_args ) {
	$key     = isset( $source_args['key'] ) ? (string) $source_args['key'] : '';
	$details = (array) get_option( 'anypress_site_details', array() );
	$details = array_merge( array( 'name' => get_bloginfo( 'name' ) ), array_filter( $details ) );

	if ( 'phone_link' === $key ) {
		$digits = isset( $details['phone'] ) ? preg_replace( '/[^0-9+]/', '', $details['phone'] ) : '';
		return '' !== $digits ? 'tel:' . $digits : null;
	}
	if ( 'email_link' === $key ) {
		return ! empty( $details['email'] ) ? 'mailto:' . $details['email'] : null;
	}
	if ( empty( $details[ $key ] ) ) {
		return null;
	}
	// Bound paragraph and heading content is HTML: keep line breaks in the address and hours.
	return nl2br( esc_html( $details[ $key ] ), false );
}

/**
 * The editor half: shows each detail in bound blocks, lets people who can change settings edit it in place, and lists
 * the details in the block's Attributes panel.
 */
function anypress_blocks_site_details_editor() {
	wp_enqueue_script(
		'anypress-blocks-site-details',
		plugins_url( 'assets/site-details-editor.js', __DIR__ ),
		array( 'wp-blocks', 'wp-core-data', 'wp-data', 'wp-i18n' ),
		ANYPRESS_BLOCKS_VERSION,
		true
	);
	wp_set_script_translations( 'anypress-blocks-site-details', 'anypress-blocks' );
	wp_add_inline_script( 'anypress-blocks-site-details', 'window.anypressSiteDetailFields = ' . wp_json_encode( anypress_blocks_site_detail_fields() ) . ';', 'before' );
}
add_action( 'enqueue_block_editor_assets', 'anypress_blocks_site_details_editor' );
