<?php
/**
 * Builds the AnyPress Blocks demo: a page for every block, in the setting a small business would use it, under
 * /blocks/. Run by demo/blueprint.json (and demo/blueprints/<block>.json, which open on that block's page) after the
 * AnyPress theme, AnyPress Blocks and Fluent Forms are installed. Not part of the plugin zip.
 *
 * @package AnyPress_Blocks
 */

defined( 'ABSPATH' ) || exit;

$anypress_demo_photos = content_url( 'anypress-blocks-demo/' );

// WordPress's sample page and post would show in the menu and the blog.
foreach ( array( get_page_by_path( 'sample-page' ), get_post( 1 ) ) as $anypress_demo_sample ) {
	if ( $anypress_demo_sample ) {
		wp_delete_post( $anypress_demo_sample->ID, true );
	}
}

update_option( 'blogname', 'AnyPress Blocks' );
update_option( 'blogdescription', 'Every block, working' );
update_option( 'anypress_site_details', array( 'phone' => '(217) 555-0142', 'address' => "12 Main Street\nSpringfield, IL" ) );

// A Fluent Forms signup form for the popup, when Fluent Forms is on.
$anypress_demo_form = '';
if ( function_exists( 'wpFluent' ) ) {
	$fields = array(
		'fields'       => array(
			array(
				'index'          => 0,
				'element'        => 'input_email',
				'attributes'     => array( 'type' => 'email', 'name' => 'email', 'value' => '', 'id' => '', 'class' => '', 'placeholder' => 'you@example.com' ),
				'settings'       => array( 'container_class' => '', 'label' => 'Email', 'label_placement' => '', 'help_message' => '', 'admin_field_label' => '', 'validation_rules' => array( 'required' => array( 'value' => true, 'message' => 'Please enter your email' ), 'email' => array( 'value' => true, 'message' => 'Please enter a valid email' ) ), 'conditional_logics' => array() ),
				'editor_options' => array( 'title' => 'Email' ),
				'uniqElKey'      => 'el_1',
			),
		),
		'submitButton' => array(
			'uniqElKey'      => 'el_2',
			'element'        => 'button',
			'attributes'     => array( 'type' => 'submit', 'class' => '' ),
			'settings'       => array( 'align' => 'left', 'button_style' => 'default', 'container_class' => '', 'help_message' => '', 'background_color' => '', 'button_size' => 'md', 'color' => '', 'button_ui' => array( 'type' => 'default', 'text' => 'Sign me up', 'img_url' => '' ) ),
			'editor_options' => array( 'title' => 'Submit Button' ),
		),
	);
	$form_id = wpFluent()->table( 'fluentform_forms' )->insertGetId( array( 'title' => 'Newsletter', 'status' => 'published', 'type' => 'form', 'form_fields' => wp_json_encode( $fields ), 'created_at' => current_time( 'mysql' ), 'updated_at' => current_time( 'mysql' ) ) );
	wpFluent()->table( 'fluentform_form_meta' )->insert( array( 'form_id' => $form_id, 'meta_key' => 'formSettings', 'value' => wp_json_encode( array( 'confirmation' => array( 'redirectTo' => 'samePage', 'messageToShow' => 'Thanks, you are on the list.', 'samePageFormBehavior' => 'hide_form' ), 'layout' => array( 'labelPlacement' => 'top', 'helpMessagePlacement' => 'with_label', 'errorMessagePlacement' => 'inline', 'cssClassName' => '', 'asteriskPlacement' => 'asterisk-right' ) ) ) ) );
	$anypress_demo_form = "<!-- wp:shortcode -->\n[fluentform id=\"{$form_id}\"]\n<!-- /wp:shortcode -->";
}

/** A heading block. */
function anypress_demo_h( $text, $level = 2 ) {
	return "<!-- wp:heading {\"level\":{$level}} -->\n<h{$level} class=\"wp-block-heading\">" . esc_html( $text ) . "</h{$level}>\n<!-- /wp:heading -->";
}

/** A paragraph block. */
function anypress_demo_p( $html ) {
	return "<!-- wp:paragraph -->\n<p>{$html}</p>\n<!-- /wp:paragraph -->";
}

/** A row of buttons. */
function anypress_demo_button( $href, $text ) {
	return "<!-- wp:buttons -->\n<div class=\"wp-block-buttons\"><!-- wp:button -->\n<div class=\"wp-block-button\"><a class=\"wp-block-button__link wp-element-button\" href=\"" . esc_attr( $href ) . '">' . esc_html( $text ) . "</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->";
}

/** Paragraphs to scroll past, for the blocks that react to scrolling. */
function anypress_demo_filler( $count ) {
	$lines = array(
		'Fresh bread every morning, cakes to order and coffee all day.',
		'We bake in small batches, so come early for the sourdough.',
		'Cakes take three days. Tell us the date, the size and the flavour.',
		'Every loaf is made with flour from a mill two hours away.',
		'Parking is free behind the shop after 5pm.',
		'Gift cards are sold at the counter and online.',
	);
	$out = array();
	for ( $i = 0; $i < $count; $i++ ) {
		$out[] = anypress_demo_p( $lines[ $i % count( $lines ) ] );
	}
	return implode( "\n\n", $out );
}

$anypress_demo_back = anypress_demo_p( '<a href="/blocks/">All the blocks</a>' );

$reviews = array(
	array( 'On time, tidy, and the price did not change.', 'Dana R.' ),
	array( 'The birthday cake was the best we have had.', 'Jo M.' ),
	array( 'They fixed the leak in an hour and cleaned up after.', 'Carlos T.' ),
	array( 'Friendly, quick and fair. We will be back.', 'Priya S.' ),
	array( 'Booked online in two minutes. So easy.', 'Sam K.' ),
);
$slides  = implode(
	"\n\n",
	array_map(
		function ( $r ) {
			return "<!-- wp:group {\"style\":{\"spacing\":{\"padding\":{\"top\":\"var:preset|spacing|medium\",\"bottom\":\"var:preset|spacing|medium\",\"left\":\"var:preset|spacing|medium\",\"right\":\"var:preset|spacing|medium\"}}},\"backgroundColor\":\"tertiary\",\"layout\":{\"type\":\"default\"}} -->\n<div class=\"wp-block-group has-tertiary-background-color has-background\" style=\"padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)\">" . anypress_demo_p( '&ldquo;' . esc_html( $r[0] ) . '&rdquo;' ) . "\n\n" . anypress_demo_p( '<strong>' . esc_html( $r[1] ) . '</strong>' ) . "</div>\n<!-- /wp:group -->";
		},
		$reviews
	)
);

$soon = gmdate( 'Y-m-d\TH:i:s', time() + 3 * DAY_IN_SECONDS + 5 * HOUR_IN_SECONDS );

$signup = anypress_demo_h( 'Get 10% off your first order' ) . "\n\n" . anypress_demo_p( 'Join the list for offers and news. One email a month.' ) . "\n\n" . $anypress_demo_form;

// Slug => [title, what it is for, content].
$anypress_demo_pages = array(
	'popup'           => array(
		'Popup',
		'A box that opens over the page after a few seconds, on scroll, when someone is about to leave, or from a button.',
		'<!-- wp:anypress/popup {"popupId":"signup","trigger":"delay","delay":2,"label":"Newsletter signup"} -->' . "\n{$signup}\n<!-- /wp:anypress/popup -->\n\n"
			. anypress_demo_p( 'This one opens two seconds after the page loads. Close it, then open it again with the button.' ) . "\n\n" . anypress_demo_button( '#signup', 'Open the signup' ),
	),
	'carousel'        => array(
		'Carousel',
		'Slides that scroll sideways with arrows and dots: reviews, projects, team members or photos.',
		anypress_demo_h( 'What customers say' ) . "\n\n" . "<!-- wp:anypress/carousel {\"perView\":3,\"label\":\"Customer reviews\"} -->\n{$slides}\n<!-- /wp:anypress/carousel -->",
	),
	'before-after'    => array(
		'Before and after',
		'Two photos of the same job with a handle to drag between them.',
		anypress_demo_h( 'The front path, before and after a wash' ) . "\n\n" . '<!-- wp:anypress/before-after {"beforeUrl":"' . $anypress_demo_photos . 'path-before.jpg","beforeAlt":"A concrete path stained grey and green before cleaning","afterUrl":"' . $anypress_demo_photos . 'path-after.jpg","afterAlt":"The same path, clean and pale, after cleaning","start":50,"aspect":"3/4"} /-->'
			. "\n\n" . anypress_demo_p( '<small>Photo: <a href="https://www.flickr.com/photos/38041294@N05/14126993444">Decorative Concrete Kingdom</a>, <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>, split into two.</small>' ),
	),
	'countdown'       => array(
		'Countdown',
		'Days, hours and minutes left until an offer ends or an event starts.',
		anypress_demo_h( 'The spring sale ends in' ) . "\n\n" . '<!-- wp:anypress/countdown {"date":"' . $soon . '","endText":"The sale has ended."} /-->' . "\n\n" . anypress_demo_button( '#', 'Shop the sale' ),
	),
	'counter'         => array(
		'Counter',
		'A big number that counts up when it comes into view.',
		"<!-- wp:columns -->\n<div class=\"wp-block-columns\">"
			. implode(
				'',
				array_map(
					function ( $c ) {
						return "<!-- wp:column -->\n<div class=\"wp-block-column\"><!-- wp:anypress/counter {\"number\":{$c[0]},\"suffix\":\"{$c[1]}\",\"fontSize\":\"x-large\"} /-->\n\n" . anypress_demo_p( $c[2] ) . "</div>\n<!-- /wp:column -->";
					},
					array( array( 35, '', 'years in business' ), array( 2400, '+', 'jobs done' ), array( 98, '%', 'would recommend us' ) )
				)
			) . "</div>\n<!-- /wp:columns -->",
	),
	'star-rating'     => array(
		'Star rating',
		'Your rating, how many reviews and where they are from.',
		anypress_demo_h( 'Rated by our customers' ) . "\n\n" . '<!-- wp:anypress/star-rating {"rating":4.9,"count":127,"source":"Google"} /-->',
	),
	'map'             => array(
		'Map',
		'Your address on a map with a pin and a link for directions. No account or key needed.',
		anypress_demo_h( 'Find us' ) . "\n\n" . anypress_demo_p( '12 Main Street, Springfield, IL' ) . "\n\n" . '<!-- wp:anypress/map {"address":"12 Main Street, Springfield, IL","lat":39.8017,"lon":-89.6436,"zoom":15} /-->',
	),
	'location-finder' => array(
		'Location finder',
		'All your branches next to a map. Visitors search by town or zip code, or tap Near me.',
		'<!-- wp:anypress/location-finder ' . wp_json_encode(
			array(
				'locations' => array(
					array( 'name' => 'Downtown', 'address' => '12 Main Street, Springfield, IL', 'phone' => '(217) 555-0101', 'hours' => 'Mon to Sat, 7am to 3pm', 'lat' => 39.8017, 'lon' => -89.6436 ),
					array( 'name' => 'West Side', 'address' => '400 Wabash Avenue, Springfield, IL', 'phone' => '(217) 555-0102', 'lat' => 39.7737, 'lon' => -89.7112 ),
					array( 'name' => 'Chatham', 'address' => '20 State Street, Chatham, IL 62629', 'phone' => '(217) 555-0103', 'lat' => 39.6761, 'lon' => -89.7046 ),
					array( 'name' => 'Rochester', 'address' => '1 Main Street, Rochester, IL 62563', 'lat' => 39.7495, 'lon' => -89.5318 ),
				),
			)
		) . ' /-->',
	),
	'notice-bar'      => array(
		'Notice bar',
		'A thin bar for one short message, such as holiday hours. Visitors can close it.',
		"<!-- wp:anypress/notice-bar {\"noticeId\":\"holiday\",\"align\":\"full\"} -->\n" . anypress_demo_p( 'Closed 25 December. <a href="#">Order Christmas cakes by the 20th</a>.' ) . "\n<!-- /wp:anypress/notice-bar -->\n\n" . anypress_demo_filler( 3 ),
	),
	'phone-bar'       => array(
		'Call and book bar',
		'A bar along the bottom of the screen with Call and Book buttons. It shows on every screen here; on a real site it can show on phones only.',
		anypress_demo_filler( 6 ) . "\n\n" . '<!-- wp:anypress/phone-bar {"bookUrl":"#","bookLabel":"Book a visit","showOn":"all"} /-->',
	),
	'age-check'       => array(
		'Age check',
		'Asks visitors to confirm their age before they see the site. It remembers the answer.',
		"<!-- wp:anypress/age-check {\"minAge\":21} -->\n" . anypress_demo_h( 'Are you 21 or over?' ) . "\n\n" . anypress_demo_p( 'You must be 21 to visit this shop.' ) . "\n<!-- /wp:anypress/age-check -->\n\n" . anypress_demo_filler( 3 ),
	),
);

$parent = wp_insert_post(
	array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => 'All the blocks',
		'post_name'    => 'blocks',
		'post_content' => '',
	)
);
$list   = array();
$order  = 0;
foreach ( $anypress_demo_pages as $slug => $page ) {
	wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => $page[0],
			'post_name'    => $slug,
			'post_parent'  => $parent,
			'menu_order'   => ++$order,
			'post_content' => anypress_demo_p( esc_html( $page[1] ) ) . "\n\n" . $page[2] . "\n\n" . $anypress_demo_back,
		)
	);
	$list[] = '<li><a href="/blocks/' . $slug . '/">' . esc_html( $page[0] ) . '</a>: ' . esc_html( $page[1] ) . '</li>';
}
wp_update_post(
	array(
		'ID'           => $parent,
		'post_content' => anypress_demo_p( 'Every AnyPress block on its own page, working as visitors see it. Open the editor on any page to change one.' )
			. "\n\n<!-- wp:list -->\n<ul class=\"wp-block-list\">" . implode( '', array_map( fn( $li ) => "<!-- wp:list-item -->\n{$li}\n<!-- /wp:list-item -->", $list ) ) . "</ul>\n<!-- /wp:list -->",
	)
);
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $parent );

global $wp_rewrite;
$wp_rewrite->set_permalink_structure( '/%postname%/' );
flush_rewrite_rules();

echo wp_json_encode( array( 'pages' => count( $anypress_demo_pages ), 'form' => (bool) $anypress_demo_form ) );
