<?php
/**
 * Age Check block: a <dialog> over the page asking the visitor to confirm their age. view.js (Interactivity API store
 * anypress/age-check) opens it unless the visitor said yes within rememberDays, keeps it open until they answer, and
 * on "No" sends them to the block's leave link or says they can't come in. It is a polite check, not proof of age.
 *
 * @package AnyPress_Blocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks' HTML.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$anypress_blocks_age_min = max( 13, min( 25, (int) ( $attributes['minAge'] ?? 21 ) ) );
/* translators: %d: the minimum age, such as 21. */
$anypress_blocks_age_yes = '' !== ( $attributes['yesLabel'] ?? '' ) ? $attributes['yesLabel'] : sprintf( __( 'Yes, I am %d or over', 'anypress-blocks' ), $anypress_blocks_age_min );
$anypress_blocks_age_no  = '' !== ( $attributes['noLabel'] ?? '' ) ? $attributes['noLabel'] : __( 'No', 'anypress-blocks' );
$anypress_blocks_age_body = $content;
if ( '' === trim( wp_strip_all_tags( $anypress_blocks_age_body ) ) ) {
	/* translators: %d: the minimum age, such as 21. */
	$anypress_blocks_age_body = '<h2 class="wp-block-heading">' . esc_html( sprintf( __( 'Are you %d or over?', 'anypress-blocks' ), $anypress_blocks_age_min ) ) . '</h2>';
}

$anypress_blocks_age_wrapper = get_block_wrapper_attributes(
	array(
		'aria-label'          => __( 'Age check', 'anypress-blocks' ),
		'data-wp-interactive' => 'anypress/age-check',
		'data-wp-context'     => wp_json_encode(
			array(
				'key'      => 'anypress-age:' . $anypress_blocks_age_min,
				'remember' => max( 0, (int) ( $attributes['rememberDays'] ?? 30 ) ),
				'leave'    => esc_url_raw( (string) ( $attributes['leaveUrl'] ?? '' ) ),
				'ok'       => false,
			)
		),
		'data-wp-init'        => 'callbacks.check',
		'data-wp-on--cancel'  => 'actions.stay',
		'data-wp-on--close'   => 'actions.reopen',
	)
);
?>
<dialog <?php echo $anypress_blocks_age_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by get_block_wrapper_attributes(). ?>>
	<?php echo $anypress_blocks_age_body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks. ?>
	<div class="wp-block-anypress-age-check__answers">
		<button type="button" class="wp-block-anypress-age-check__yes wp-element-button" data-wp-on--click="actions.yes"><?php echo esc_html( $anypress_blocks_age_yes ); ?></button>
		<button type="button" class="wp-block-anypress-age-check__no" data-wp-on--click="actions.no"><?php echo esc_html( $anypress_blocks_age_no ); ?></button>
	</div>
	<?php /* translators: %d: the minimum age, such as 21. */ ?>
	<p class="wp-block-anypress-age-check__sorry" role="alert" hidden><?php echo esc_html( sprintf( __( 'Sorry, you need to be %d or over to visit this site.', 'anypress-blocks' ), $anypress_blocks_age_min ) ); ?></p>
</dialog>
