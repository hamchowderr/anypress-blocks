=== AnyPress Blocks ===
Contributors: anypress
Tags: popup, carousel, counter, map, blocks
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.2.0
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Interactive blocks for any block theme: a Popup, a Carousel, a Counter and a Map.

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

**Carousel**

Slides that scroll sideways: reviews, projects, team members or photos. Each block inside is one slide.

* Shows one to four slides at a time on a computer; phones show one slide and the edge of the next, so visitors know to swipe.
* Arrows, dots, swiping and the keyboard's arrow keys all move it.
* Can move on by itself every few seconds, and stops while a visitor hovers, touches or tabs into it, or prefers less motion.

**Counter**

A big number that counts up when it scrolls into view: years in business, jobs done, happy customers. Add text before or after it, such as $ or +. The page shows the final number, so it reads right for search engines and visitors who prefer less motion.

**Map**

A map of your address from OpenStreetMap, with a pin and a "Get directions" link. Type the address and press "Find on the map". No account or API key. Turn on "Ask before loading the map" to load nothing from OpenStreetMap until the visitor asks for it.

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

= What can go in a carousel? =

Any block. Each block directly inside the carousel is one slide, so a group with a quote and a name makes a review slide, and an image makes a photo slide.

= Does the map send visitors' details anywhere? =

The map is loaded from OpenStreetMap, which sees the visitor's IP address like any embedded map. Pressing "Find on the map" in the editor asks OpenStreetMap's Nominatim search for the address once. Turn on "Ask before loading the map" if visitors should agree first.

== Changelog ==

= 0.2.0 =
* New: Carousel block. Slides that scroll sideways with arrows, dots, swiping, arrow keys and optional autoplay.
* New: Counter block. A number that counts up when it scrolls into view.
* New: Map block. An OpenStreetMap map of an address with a pin and a directions link, optionally loaded only when the visitor asks.

= 0.1.1 =
* Fix: on phones the Popup's close button no longer covers the first line of text; it floats in the corner and stays in view when a long popup scrolls.

= 0.1.0 =
* New: Popup block. Opens after a delay, on scroll, when leaving the page or from a link; closes with its button, Escape or a click outside; remembers when a visitor closed it.
