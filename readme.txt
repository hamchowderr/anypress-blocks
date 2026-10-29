=== AnyPress Blocks ===
Contributors: anypress
Tags: popup, modal, newsletter, blocks, block editor
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.1.1
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Interactive blocks for any block theme, starting with a Popup for signups, offers and booking forms.

== Description ==

AnyPress Blocks adds blocks that make a site feel finished: the things visitors click, open and fill in.

**Popup**

A box that opens over the page. Put any blocks inside it: a heading, an image, buttons, or a signup or booking form from a form plugin such as Fluent Forms.

* Opens after a few seconds, when the visitor scrolls down, when they are about to leave the page, or only from a link or button.
* Any link or button that points to `#your-popup-id` opens it.
* Closes with its close button, the Escape key or a click outside it.
* Once a visitor closes it, it stays closed for as many days as you choose (or shows on every visit).
* Centred over the page, or in the bottom corner so the page stays usable.
* Takes its colours, spacing and corners from your theme, and you can change them in the block's settings.
* Built on the browser's own dialog element: keyboard and screen reader friendly, no jQuery, and its small script loads only on pages that have a popup.

== Installation ==

1. Upload the plugin zip in Plugins > Add New > Upload Plugin, then activate it.
2. In the editor, add the Popup block to a page or to a template part (such as the footer, to show it on every page).
3. Choose when it opens in the block settings.

== Frequently Asked Questions ==

= How do I open a popup from a button? =

Each popup has an ID, shown in its settings (for example `signup`). Link any button or link to `#signup` and clicking it opens the popup. Set "Opens" to "Only from a link or button" if it should never open by itself.

= Can I put a form in it? =

Yes. Add your form plugin's block or shortcode inside the popup. The form works as it does anywhere else on the page.

= Where do I add a popup that shows on every page? =

Add it to the footer template part in the Site Editor.

== Changelog ==

= 0.1.1 =
* Fix: on phones the Popup's close button no longer covers the first line of text; it floats in the corner and stays in view when a long popup scrolls.

= 0.1.0 =
* New: Popup block. Opens after a delay, on scroll, when leaving the page or from a link; closes with its button, Escape or a click outside; remembers when a visitor closed it.
