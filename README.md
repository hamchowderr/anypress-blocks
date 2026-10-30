# AnyPress Blocks

Interactive blocks for any WordPress block theme: Popup, Carousel, Counter and Map. AnyPress stores have it installed, and any WordPress site can use it.

## Blocks

| Block | What it does |
|---|---|
| **Popup** (`anypress/popup`) | A box that opens over the page after a few seconds, when the visitor scrolls, when they are about to leave, or from any link to `#its-id`. Holds any blocks, including a form. Closes with its button, Escape or a click outside, and stays closed for the number of days you choose. |
| **Carousel** (`anypress/carousel`) | Slides that scroll sideways: reviews, projects, team or photos. Each block inside is one slide. One to four at a time on a computer, one and the edge of the next on a phone. Arrows, dots, swipe, arrow keys and optional autoplay that pauses on hover, touch, focus and reduced motion. |
| **Counter** (`anypress/counter`) | A number that counts up when it scrolls into view, with text before or after it. The page holds the final number, so it reads right without JavaScript. |
| **Map** (`anypress/map`) | An OpenStreetMap map of an address with a pin and a "Get directions" link. No API key. Can wait to load until the visitor asks. |

## Site details

Keep the business name, phone, email, address and opening hours in one place, and show them anywhere. They are stored in the `anypress_site_details` setting (also in the REST API at `/wp/v2/settings`), and any heading, paragraph or button can show one through the block bindings source `anypress/site-details`:

```html
<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"anypress/site-details","args":{"key":"phone"}}}}} -->
<p>(217) 555-0142</p>
<!-- /wp:paragraph -->
```

Keys: `name` (falls back to the site title), `phone`, `email`, `address`, `hours`, and for button links `phone_link` (`tel:`) and `email_link` (`mailto:`). A detail that is not set yet leaves the block's own text in place. In the editor, pick a detail from the block's Attributes panel, and type straight into the block to change it: every page that shows it updates.

## Install

Download `anypress-blocks.zip` from the [latest release](https://github.com/hamchowderr/anypress-blocks/releases/latest), then in WordPress go to Plugins > Add New > Upload Plugin. Requires WordPress 6.8 and PHP 7.4 or later.

## Use the Popup

1. Add the **Popup** block to a page, or to the footer template part to show it on every page.
2. Fill it with blocks: a heading, some text, and a signup form or a button.
3. In the block settings, choose when it opens and how many days to wait before showing it again to someone who closed it.
4. To open it from a button, link the button to `#` followed by the popup's ID (shown in its settings), for example `#signup`.

## Develop

The blocks are plain JavaScript on the editor's own scripts, so there is no build step: edit the files in `blocks/<name>/` and reload.

```shell
cd tests && npm ci
npm run check   # WordPress Playground with the AnyPress theme and Fluent Forms; checks every block in a browser
npm run serve   # the same site left running at http://127.0.0.1:9420 (admin / password)
```

`bin/build-zip.sh` builds `dist/anypress-blocks.zip` and its checksum. Releases are made by the **Release** workflow.

## Licence

GPL-3.0-or-later.
