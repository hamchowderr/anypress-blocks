// Checks AnyPress Blocks on WordPress Playground (WordPress and PHP inside Node, no Docker), with the AnyPress theme
// and Fluent Forms, the way AnyPress stores run them.
//
//   cd tests && npm ci
//   npm run check     # boot, run the checks, take screenshots, exit 1 on a failure
//   npm run serve     # same site, left running at http://127.0.0.1:9420 (admin / password)
//
// Popup block:
//   - registers, and a page that uses it stays valid in the editor (no "This block contains unexpected content")
//   - a delayed popup is closed when the page loads and opens on its own after the delay, as a modal, with its Fluent Form inside
//   - it closes with Escape, its close button and a click outside, and stays closed on the next visit
//   - a link to #<popup id> opens a click-only popup; a scroll popup opens once the visitor scrolls far enough
//   - on a phone it fits the screen, nothing runs off the side, and the close button is a full-size tap target
//   - no PHP notices or errors
//
// Carousel, Counter and Map blocks:
//   - the carousel shows three slides on a computer and one and the edge of the next on a phone; arrows, dots and the
//     arrow keys move it, and the arrows turn off at either end
//   - the counter prints its final number in the page, counts up to it when it scrolls into view, and doesn't count
//     with reduced motion
//   - the map embeds OpenStreetMap with a pin, links to directions, and an ask-first map loads only when asked
//   - all three stay valid in the editor, which shows the counter's number and a map preview
//   Site details (the anypress/site-details bindings source):
//   - bound headings, paragraphs and buttons show the saved name, address and phone; an unset detail keeps the block's text
//   - the editor lists the details, shows them in bound blocks, and editing one saves it to the site settings
//
// Location Finder, Before and After, Countdown, Star Rating, Notice Bar, Phone Bar and Age Check blocks:
//   - the finder lists every location with directions, filters as the visitor types, sorts nearest first after
//     "Near me", and moves the map to the location picked; on a phone the map sits above the list
//   - before and after: the handle moves with a drag and with the arrow keys, and the "after" photo is cut there
//   - the countdown prints the time left, ticks every second, and shows its "ended" words once the time is up
//   - star rating: stars filled to the rating and the rating in words
//   - the notice bar closes, stays closed on the next visit, and shows again when its message changes
//   - the phone bar sits at the bottom of a phone screen with full-size buttons, calls Site details' number, and is
//     hidden on a computer
//   - the age check covers the page until answered, ignores Escape, says sorry on "No" and remembers "Yes"
//   - all of them stay valid in the editor
//
// Environment: ANYPRESS_THEME_ZIP (theme zip URL, default the latest AnyPress theme release), PLAYGROUND_WP, PLAYGROUND_PHP
// (default 7.1.3 and 8.3, what stores run), PLAYGROUND_PORT (9420), SHOTS (screenshots folder, default ./shots).
// Needs Playwright with Chromium.

import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = resolve(HERE, '..');
const THEME_ZIP = process.env.ANYPRESS_THEME_ZIP || 'https://github.com/hamchowderr/anypress-theme/releases/latest/download/anypress.zip';
const WP = process.env.PLAYGROUND_WP || '7.1.3';
const PHP = process.env.PLAYGROUND_PHP || '8.3';
const PORT = Number(process.env.PLAYGROUND_PORT || 9420);
const SHOTS = resolve(process.env.SHOTS || resolve(HERE, 'shots'));
const SERVE = process.argv.includes('--serve');

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`  FAIL ${msg}`); };
const pass = (msg) => console.log(`  ok   ${msg}`);
const check = (ok, msg, detail = '') => (ok ? pass(msg) : fail(detail ? `${msg} (${detail})` : msg));

const cli = await runCLI({
    command: 'server',
    wp: `https://wordpress.org/wordpress-${WP}.zip`,
    php: PHP,
    port: PORT,
    blueprint: {
        login: SERVE,
        steps: [
            { step: 'defineWpConfigConsts', consts: { WP_DEBUG: true, WP_DEBUG_LOG: '/tmp/debug.log', WP_DEBUG_DISPLAY: false, AUTOMATIC_UPDATER_DISABLED: true } },
            { step: 'installTheme', themeData: { resource: 'url', url: THEME_ZIP }, options: { activate: true } },
            { step: 'installPlugin', pluginData: { resource: 'wordpress.org/plugins', slug: 'fluentform' } },
            { step: 'activatePlugin', pluginPath: 'anypress-blocks/anypress-blocks.php' },
            { step: 'setSiteOptions', options: { blogname: 'Springfield Bakery', blogdescription: 'Bread and cakes since 1998' } },
        ],
    },
    mount: [{ hostPath: PLUGIN, vfsPath: '/wordpress/wp-content/plugins/anypress-blocks' }],
    verbosity: 'quiet',
});
const base = cli.serverUrl.replace(/\/$/, '');
console.log(`WordPress ${WP} on PHP ${PHP} at ${base}`);

async function php(code) {
    const res = await cli.playground.run({ code: `<?php require '/wordpress/wp-load.php'; ${code}` });
    if (res.errors) throw new Error(res.errors);
    return JSON.parse(res.text);
}

// A Fluent Forms signup form, made the way an owner would in its form builder (one email field and a submit button).
const formId = await php(`
    $form = wpFluent()->table('fluentform_forms')->where('title', 'Newsletter')->first();
    if (!$form) {
        $fields = ['fields' => [[
            'index' => 1, 'element' => 'input_email', 'attributes' => ['type' => 'email', 'name' => 'email', 'value' => '', 'id' => '', 'class' => '', 'placeholder' => 'Your email'],
            'settings' => ['container_class' => '', 'label' => 'Email', 'label_placement' => '', 'help_message' => '', 'admin_field_label' => '',
                'validation_rules' => ['required' => ['value' => true, 'message' => 'Please enter your email'], 'email' => ['value' => true, 'message' => 'Please enter a valid email']], 'conditional_logics' => []],
            'editor_options' => ['title' => 'Email Address', 'icon_class' => 'ff-edit-email', 'template' => 'inputText'], 'uniqElKey' => 'el_1'
        ]], 'submitButton' => ['uniqElKey' => 'el_2', 'element' => 'button', 'attributes' => ['type' => 'submit', 'class' => ''],
            'settings' => ['align' => 'left', 'button_style' => 'default', 'container_class' => '', 'help_message' => '', 'background_color' => '', 'button_size' => 'md', 'color' => '', 'button_ui' => ['type' => 'default', 'text' => 'Sign up', 'img_url' => '']],
            'editor_options' => ['title' => 'Submit Button']]];
        $id = wpFluent()->table('fluentform_forms')->insertGetId(['title' => 'Newsletter', 'status' => 'published', 'type' => 'form', 'form_fields' => wp_json_encode($fields), 'created_at' => current_time('mysql'), 'updated_at' => current_time('mysql')]);
        wpFluent()->table('fluentform_form_meta')->insert(['form_id' => $id, 'meta_key' => 'formSettings', 'value' => wp_json_encode(['confirmation' => ['redirectTo' => 'samePage', 'messageToShow' => 'Thanks for signing up!', 'samePageFormBehavior' => 'hide_form'], 'layout' => ['labelPlacement' => 'top', 'helpMessagePlacement' => 'with_label', 'errorMessagePlacement' => 'inline', 'cssClassName' => '', 'asteriskPlacement' => 'asterisk-right']])]);
        echo json_encode($id);
    } else {
        echo json_encode((int) $form->id);
    }
`);

const popup = (attrs, inner) => `<!-- wp:anypress/popup ${JSON.stringify(attrs)} -->\n${inner}\n<!-- /wp:anypress/popup -->`;
const signup = `<!-- wp:heading -->
<h2 class="wp-block-heading">Get 10% off your first order</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Join the list for offers and news. One email a month.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[fluentform id="${formId}"]
<!-- /wp:shortcode -->`;
const filler = Array.from({ length: 12 }, (_, i) => `<!-- wp:paragraph -->\n<p>Section ${i + 1}. Fresh bread every morning, cakes to order, and coffee all day.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:spacer {"height":"200px"} -->\n<div style="height:200px" aria-hidden="true" class="wp-block-spacer"></div>\n<!-- /wp:spacer -->`).join('\n\n');
const button = (href, text) => `<!-- wp:buttons -->\n<div class="wp-block-buttons"><!-- wp:button -->\n<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${href}">${text}</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->`;

const pages = {
    delay: popup({ popupId: 'signup', trigger: 'delay', delay: 2, label: 'Newsletter signup' }, signup) + '\n\n' + button('#signup', 'Join the list') + '\n\n' + filler,
    click: popup({ popupId: 'order', trigger: 'click', size: 'small' }, signup) + '\n\n' + button('#order', 'Order a cake') + '\n\n' + filler,
    // Like the theme's kit popups: no padding at the top and sides, so its photo runs to the edges.
    photo: popup({ popupId: 'photo', trigger: 'click', label: 'Offer', style: { spacing: { padding: { top: '0', bottom: 'var:preset|spacing|large', left: '0', right: '0' } } } }, `<!-- wp:image {"aspectRatio":"16/9","scale":"cover"} -->\n<figure class="wp-block-image"><img src="/wp-includes/images/w-logo-blue.png" alt="" style="aspect-ratio:16/9;object-fit:cover;width:100%"/></figure>\n<!-- /wp:image -->\n\n${signup}`) + '\n\n' + button('#photo', 'See the offer') + '\n\n' + filler,
    scroll: popup({ popupId: 'offer', trigger: 'scroll', scroll: 60, position: 'bottom-right', size: 'small' }, signup) + '\n\n' + filler,
    blocks: [
        `<!-- wp:anypress/carousel {"perView":3,"label":"Customer reviews"} -->`,
        ...['Dana R.', 'Jo M.', 'Carlos T.', 'Priya S.', 'Sam K.'].map((name, i) => `<!-- wp:group {"layout":{"type":"default"}} -->\n<div class="wp-block-group"><!-- wp:paragraph -->\n<p>Review ${i + 1}: on time, tidy and the price did not change.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p>${name}</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:group -->`),
        `<!-- /wp:anypress/carousel -->`,
        filler.split('\n\n').slice(0, 6).join('\n\n'),
        `<!-- wp:anypress/counter {"number":2400,"suffix":"+","duration":1.5,"fontSize":"x-large"} /-->`,
        `<!-- wp:paragraph -->\n<p>jobs done</p>\n<!-- /wp:paragraph -->`,
        `<!-- wp:anypress/map {"address":"Springfield, Illinois","lat":39.7817,"lon":-89.6501,"zoom":12} /-->`,
        `<!-- wp:anypress/map {"address":"Oak Hill","lat":39.79,"lon":-89.61,"askFirst":true,"directions":false,"aspect":"4/3"} /-->`,
    ].join('\n\n'),
    details: [
        `<!-- wp:heading {"metadata":{"bindings":{"content":{"source":"anypress/site-details","args":{"key":"name"}}}}} -->\n<h2 class="wp-block-heading">Business name</h2>\n<!-- /wp:heading -->`,
        `<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"anypress/site-details","args":{"key":"address"}}}}} -->\n<p>Your address</p>\n<!-- /wp:paragraph -->`,
        `<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"anypress/site-details","args":{"key":"hours"}}}}} -->\n<p>Open every day</p>\n<!-- /wp:paragraph -->`,
        `<!-- wp:buttons -->\n<div class="wp-block-buttons"><!-- wp:button {"metadata":{"bindings":{"url":{"source":"anypress/site-details","args":{"key":"phone_link"}},"text":{"source":"anypress/site-details","args":{"key":"phone"}}}}} -->\n<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="tel:">Call us</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->`,
        `<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"anypress/site-details","args":{"key":"phone_linked"}}}}} -->\n<p class="linked-phone"><a href="tel:5550000">555 0000</a></p>\n<!-- /wp:paragraph -->`,
    ].join('\n\n'),
    more: [
        `<!-- wp:anypress/notice-bar {"noticeId":"holiday","align":"full"} -->\n<!-- wp:paragraph -->\n<p>Closed 24 to 26 December. <a href="/order/">Order cakes by the 20th</a>.</p>\n<!-- /wp:paragraph -->\n<!-- /wp:anypress/notice-bar -->`,
        `<!-- wp:anypress/star-rating {"rating":4.8,"count":127,"source":"Google"} /-->`,
        `<!-- wp:anypress/countdown {"date":"${new Date(Date.now() + 2 * 86400000 + 3 * 3600000).toISOString().slice(0, 19)}"} /-->`,
        `<!-- wp:anypress/countdown {"date":"2020-01-01T09:00:00","endText":"This offer has ended","className":"is-past"} /-->`,
        `<!-- wp:anypress/countdown {"date":"2020-01-01T09:00:00","className":"is-hidden-past"} /-->`,
        `<!-- wp:anypress/before-after {"beforeUrl":"/wp-content/plugins/anypress-blocks/tests/fixtures/before.jpg","beforeAlt":"The kitchen before","afterUrl":"/wp-content/plugins/anypress-blocks/tests/fixtures/after.jpg","afterAlt":"The kitchen after the refit","start":40} /-->`,
        `<!-- wp:anypress/location-finder ${JSON.stringify({ locations: [
            { name: 'Downtown', address: '12 Main Street, Springfield, IL', phone: '(217) 555-0101', hours: 'Mon to Sat 7 to 3', lat: 39.8017, lon: -89.6436, url: '/locations/downtown/' },
            { name: 'West Side', address: '400 Wabash Avenue, Springfield, IL', lat: 39.7737, lon: -89.7112 },
            { name: 'Chatham', address: '20 State Street, Chatham, IL 62629', lat: 39.6761, lon: -89.7046 },
        ] })} /-->`,
    ].join('\n\n'),
    bar: `<!-- wp:paragraph -->\n<p>Bottom of the page.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:anypress/phone-bar {"bookUrl":"/book/","bookLabel":"Book a cake"} /-->\n\n` + filler,
    age: `<!-- wp:anypress/age-check {"minAge":21} -->\n<!-- wp:heading -->\n<h2 class="wp-block-heading">Are you 21 or over?</h2>\n<!-- /wp:heading -->\n<!-- /wp:anypress/age-check -->\n\n` + filler,
};
await php(`update_option('anypress_site_details', ['phone' => '(217) 555-0142', 'address' => "12 Main Street\\nSpringfield"]); echo 1;`);
const ids = await php(`
    $out = [];
    foreach (json_decode(${JSON.stringify(JSON.stringify(pages))}, true) as $slug => $content) {
        $out[$slug] = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => "Popup $slug", 'post_name' => "popup-$slug", 'post_content' => $content]);
    }
    echo json_encode($out);
`);

if (SERVE) {
    // Auto-login sends cookie-less requests round in circles, so serving skips the checks.
    console.log(`Serving ${base} (admin / password): /popup-delay/, /popup-click/, /popup-scroll/, /popup-blocks/, /popup-more/, /popup-bar/, /popup-age/. Ctrl+C to stop.`);
    await new Promise(() => {});
}

console.log('Popup block');
const registered = await php(`echo json_encode(WP_Block_Type_Registry::get_instance()->is_registered('anypress/popup'));`);
check(registered, 'anypress/popup is registered');

const html = await (await fetch(`${base}/popup-delay/`)).text();
check(/<dialog[^>]*id="signup"[^>]*class="[^"]*wp-block-anypress-popup/.test(html) || /<dialog[^>]*class="[^"]*wp-block-anypress-popup[^>]*id="signup"/.test(html), 'renders as a <dialog> with its id');
check(html.includes('fluentform') && html.includes('Your email'), 'the Fluent Form renders inside it');
const viewTag = (html.match(/<script[^>]*anypress-blocks\/blocks\/popup\/view\.js[^>]*>/) || [''])[0];
check(viewTag.includes('type="module"'), 'loads its view script as a module', viewTag || 'no script tag');

console.log('Carousel, Counter and Map blocks');
const more = await php(`echo json_encode(array_map(fn($n) => WP_Block_Type_Registry::get_instance()->is_registered($n), ['carousel' => 'anypress/carousel', 'counter' => 'anypress/counter', 'map' => 'anypress/map']));`);
check(more.carousel && more.counter && more.map, 'anypress/carousel, anypress/counter and anypress/map are registered', JSON.stringify(more));
const bhtml = await (await fetch(`${base}/popup-blocks/`)).text();
check(/class="[^"]*wp-block-anypress-carousel[^"]*"[^>]*role="region"/.test(bhtml) && bhtml.includes('aria-label="Customer reviews"'), 'the carousel renders as a named region');
check(/wp-block-anypress-counter__number">2,400</.test(bhtml), 'the counter prints its final number in the page (for no JavaScript and search engines)');
check(/<iframe[^>]+openstreetmap\.org\/export\/embed\.html\?bbox=[^"]+marker=39\.7817,-89\.6501/.test(bhtml.replace(/&#038;|&amp;/g, '&')), 'the map embeds OpenStreetMap with a pin at its place');
check(bhtml.includes('google.com/maps/dir/') && bhtml.includes('Springfield%2C%20Illinois'), 'the map links to directions for its address');
check(/wp-block-anypress-map__load[^>]+data-src="https:\/\/www\.openstreetmap\.org/.test(bhtml) && (bhtml.match(/<iframe/g) || []).length === 1, 'an ask-first map loads nothing until asked');

let browser;
try {
    const { chromium } = require('playwright');
    browser = await chromium.launch();
    mkdirSync(SHOTS, { recursive: true });

    // Desktop: a delayed popup.
    const desk = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const tab = await desk.newPage();
    const errors = [];
    tab.on('pageerror', (e) => errors.push(e.message));
    await tab.goto(`${base}/popup-delay/`, { waitUntil: 'domcontentloaded' });
    await tab.waitForTimeout(500);
    check(!(await tab.$eval('#signup', (d) => d.open)), 'closed when the page loads');
    await tab.waitForFunction(() => document.getElementById('signup').open, null, { timeout: 5000 }).catch(() => {});
    check(await tab.$eval('#signup', (d) => d.open && d.matches(':modal')), 'opens by itself after 2 seconds, over the page');
    check(await tab.locator('#signup input[type=email]').isVisible(), 'its signup form is visible');
    await tab.waitForTimeout(400);
    await tab.screenshot({ path: resolve(SHOTS, 'popup-desktop.png') });

    // The form inside works: submitting it shows Fluent Forms' thank-you message.
    await tab.fill('#signup input[type=email]', 'test@example.com');
    await tab.click('#signup button[type=submit]');
    await tab.waitForSelector('#signup .ff-message-success', { timeout: 10000 }).catch(() => {});
    check(await tab.locator('#signup .ff-message-success').isVisible().catch(() => false), 'its Fluent Form submits and thanks the visitor');

    await tab.keyboard.press('Escape');
    await tab.waitForTimeout(300);
    check(!(await tab.$eval('#signup', (d) => d.open)), 'closes with Escape');
    check(await tab.evaluate(() => Number(localStorage.getItem('anypress-popup:signup')) > 0), 'remembers that the visitor closed it');
    await tab.reload({ waitUntil: 'domcontentloaded' });
    await tab.waitForTimeout(3000);
    check(!(await tab.$eval('#signup', (d) => d.open)), 'stays closed on the next visit');
    await tab.click('a[href="#signup"]');
    await tab.waitForTimeout(300);
    check(await tab.$eval('#signup', (d) => d.open), 'a "Join the list" button still opens it');
    check(new URL(tab.url()).hash === '', 'opening from a link does not jump the page');
    await tab.click('#signup .wp-block-anypress-popup__close');
    await tab.waitForTimeout(300);
    check(!(await tab.$eval('#signup', (d) => d.open)), 'closes with its close button');

    // Click-only popup.
    await tab.goto(`${base}/popup-click/`, { waitUntil: 'domcontentloaded' });
    await tab.waitForTimeout(2500);
    check(!(await tab.$eval('#order', (d) => d.open)), 'a click-only popup does not open by itself');
    await tab.click('a[href="#order"]');
    await tab.waitForTimeout(300);
    check(await tab.$eval('#order', (d) => d.open), 'a link to #order opens it');
    await tab.mouse.click(10, 10);
    await tab.waitForTimeout(300);
    check(!(await tab.$eval('#order', (d) => d.open)), 'closes with a click outside it');

    // Close button in the corner, inside the popup, for the default padding and for a popup with none.
    const corners = async (id) => tab.$eval(`#${id}`, (d) => {
        const r = d.getBoundingClientRect();
        const b = d.querySelector('.wp-block-anypress-popup__close');
        const c = b.getBoundingClientRect();
        return { inside: c.left >= r.left && c.right <= r.right + 0.5 && c.top >= r.top - 0.5, fromCorner: [Math.round(r.right - c.right), Math.round(c.top - r.top)], sideways: d.scrollWidth - d.clientWidth, background: getComputedStyle(b).backgroundColor };
    });
    await tab.goto(`${base}/popup-click/`, { waitUntil: 'domcontentloaded' });
    await tab.click('a[href="#order"]');
    await tab.waitForTimeout(400);
    const plain = await corners('order');
    check(plain.inside && plain.sideways <= 0, 'the close button sits inside the popup, which never scrolls sideways', JSON.stringify(plain));
    await tab.goto(`${base}/popup-photo/`, { waitUntil: 'domcontentloaded' });
    await tab.click('a[href="#photo"]');
    await tab.waitForTimeout(400);
    const flush = await corners('photo');
    check(flush.inside && flush.sideways <= 0 && flush.fromCorner.every((n) => n >= 4 && n <= 12), 'with no padding, the close button is still in the corner, inside the popup, with no sideways scroll', JSON.stringify(flush));
    check(!/rgba\(0, 0, 0, 0\)|transparent/.test(flush.background), 'the close button has its own background, so it shows over a photo', flush.background);
    const photoTop = await tab.$eval('#photo', (d) => Math.round(d.querySelector('.wp-block-image').getBoundingClientRect().top - d.getBoundingClientRect().top));
    check(photoTop === 0, 'a popup that opens with a photo starts the photo at the top edge, under the close button', String(photoTop));
    await tab.screenshot({ path: resolve(SHOTS, 'popup-photo.png') });

    // Scroll popup in the corner.
    await tab.goto(`${base}/popup-scroll/`, { waitUntil: 'domcontentloaded' });
    await tab.waitForTimeout(800);
    check(!(await tab.$eval('#offer', (d) => d.open)), 'a scroll popup waits for the visitor to scroll');
    await tab.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await tab.waitForTimeout(600);
    check(await tab.$eval('#offer', (d) => d.open && !d.matches(':modal')), 'opens in the corner after scrolling, leaving the page usable');
    const corner = await tab.$eval('#offer', (d) => { const r = d.getBoundingClientRect(); return { right: innerWidth - r.right, bottom: innerHeight - r.bottom }; });
    check(corner.right >= 0 && corner.right < 40 && corner.bottom >= 0 && corner.bottom < 40, 'sits in the bottom right corner', JSON.stringify(corner));
    await tab.screenshot({ path: resolve(SHOTS, 'popup-corner.png') });
    check(errors.length === 0, 'no JavaScript errors', errors.join('; '));
    await desk.close();

    // Phone.
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const ptab = await phone.newPage();
    await ptab.goto(`${base}/popup-delay/`, { waitUntil: 'domcontentloaded' });
    await ptab.waitForFunction(() => document.getElementById('signup').open, null, { timeout: 5000 }).catch(() => {});
    await ptab.waitForTimeout(400);
    const fit = await ptab.evaluate(() => {
        const d = document.getElementById('signup').getBoundingClientRect();
        const c = document.querySelector('#signup .wp-block-anypress-popup__close').getBoundingClientRect();
        // Text in the popup must not run under the close button.
        const range = document.createRange();
        range.selectNodeContents(document.querySelector('#signup h2'));
        const covered = [...range.getClientRects()].some((r) => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top);
        return { left: d.left, right: innerWidth - d.right, scroll: document.documentElement.scrollWidth - innerWidth, close: Math.min(c.width, c.height), covered, open: document.getElementById('signup').open };
    });
    check(fit.open, 'phone: opens after the delay');
    check(fit.left >= 8 && fit.right >= 8 && fit.scroll <= 0, 'phone: fits the screen with nothing running off the side', JSON.stringify(fit));
    check(fit.close >= 44, 'phone: the close button is at least 44 px', String(fit.close));
    check(!fit.covered, 'phone: the close button does not cover the heading');
    await ptab.screenshot({ path: resolve(SHOTS, 'popup-phone.png') });
    await phone.close();

    // Carousel, Counter and Map on a computer.
    const bdesk = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const btab = await bdesk.newPage();
    const berrors = [];
    btab.on('pageerror', (e) => berrors.push(e.message));
    await btab.goto(`${base}/popup-blocks/`, { waitUntil: 'domcontentloaded' });
    await btab.waitForTimeout(500);
    const car = () => btab.evaluate(() => {
        const t = document.querySelector('.wp-block-anypress-carousel__track');
        const s = [...t.children];
        return { track: t.clientWidth, slide: s[0].getBoundingClientRect().width, left: t.scrollLeft, max: t.scrollWidth - t.clientWidth,
            dots: document.querySelectorAll('.wp-block-anypress-carousel__dot').length,
            current: [...document.querySelectorAll('.wp-block-anypress-carousel__dot')].findIndex((d) => d.getAttribute('aria-current') === 'true'),
            prev: document.querySelector('.wp-block-anypress-carousel__prev').disabled, next: document.querySelector('.wp-block-anypress-carousel__next').disabled,
            slides: s.map((x) => x.getAttribute('aria-roledescription')) };
    });
    let c = await car();
    check(Math.abs(c.slide * 3 - c.track) < c.track * 0.12, 'carousel: shows three slides at a time on a computer', JSON.stringify(c));
    check(c.dots === 3 && c.current === 0, 'carousel: one dot per stop (five slides, three shown: three dots)', JSON.stringify(c));
    check(c.prev && !c.next, 'carousel: at the start the back arrow is off and the next arrow on');
    check(c.slides.every((x) => x === 'slide'), 'carousel: each slide is labelled as a slide for screen readers');
    await btab.click('.wp-block-anypress-carousel__next');
    await btab.waitForTimeout(900);
    c = await car();
    check(c.left > 0 && c.current === 1 && !c.prev, 'carousel: the next arrow moves on one slide', JSON.stringify(c));
    await btab.click('.wp-block-anypress-carousel__dot:last-child');
    await btab.waitForTimeout(900);
    c = await car();
    check(c.left >= c.max - 2 && c.next && c.current === 2, 'carousel: the last dot goes to the end, where the next arrow turns off', JSON.stringify(c));
    await btab.focus('.wp-block-anypress-carousel__track');
    await btab.keyboard.press('ArrowLeft');
    await btab.waitForTimeout(900);
    check((await car()).left < c.left, 'carousel: the left arrow key moves back');
    await btab.screenshot({ path: resolve(SHOTS, 'carousel-desktop.png'), clip: { x: 0, y: 0, width: 1280, height: 860 } });

    const counterText = () => btab.$eval('.wp-block-anypress-counter__number', (e) => e.textContent);
    await btab.$eval('.wp-block-anypress-counter', (e) => e.scrollIntoView({ block: 'center' }));
    await btab.waitForTimeout(300);
    const midway = await counterText();
    await btab.waitForTimeout(1800);
    const done = await counterText();
    check(midway !== '2,400' && Number(midway.replace(/\D/g, '')) < 2400, 'counter: counts up when it scrolls into view', midway);
    check(done === '2,400' && (await btab.$eval('.wp-block-anypress-counter', (e) => e.textContent)) === '2,400+', 'counter: ends on its number with its suffix', done);

    await btab.click('.wp-block-anypress-map__load');
    await btab.waitForTimeout(300);
    check((await btab.locator('.wp-block-anypress-map iframe').count()) === 2, 'map: "Show the map" loads an ask-first map');
    const mapBox = await btab.$eval('.wp-block-anypress-map__frame', (e) => { const r = e.getBoundingClientRect(); return r.width / r.height; });
    check(Math.abs(mapBox - 16 / 9) < 0.05, 'map: keeps its shape', String(mapBox));
    check(berrors.length === 0, 'no JavaScript errors from Carousel, Counter or Map', berrors.join('; '));
    await bdesk.close();

    // Reduced motion: the counter shows its number and does not count.
    const calm = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
    const ctab = await calm.newPage();
    await ctab.goto(`${base}/popup-blocks/`, { waitUntil: 'domcontentloaded' });
    await ctab.$eval('.wp-block-anypress-counter', (e) => e.scrollIntoView({ block: 'center' }));
    await ctab.waitForTimeout(200);
    check((await ctab.$eval('.wp-block-anypress-counter__number', (e) => e.textContent)) === '2,400', 'counter: with reduced motion it shows the number without counting');
    await calm.close();

    // Phone: one slide and the edge of the next, nothing off the side.
    const bphone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const bptab = await bphone.newPage();
    await bptab.goto(`${base}/popup-blocks/`, { waitUntil: 'domcontentloaded' });
    await bptab.waitForTimeout(500);
    const pc = await bptab.evaluate(() => {
        const t = document.querySelector('.wp-block-anypress-carousel__track');
        return { ratio: t.children[0].getBoundingClientRect().width / t.clientWidth, scroll: document.documentElement.scrollWidth - innerWidth,
            dots: document.querySelectorAll('.wp-block-anypress-carousel__dot').length,
            arrow: Math.min(...[...document.querySelectorAll('.wp-block-anypress-carousel__next, .wp-block-anypress-carousel__dot')].map((b) => b.getBoundingClientRect().height)) };
    });
    check(pc.ratio > 0.8 && pc.ratio < 0.95, 'phone: the carousel shows one slide and the edge of the next', JSON.stringify(pc));
    check(pc.dots === 5, 'phone: one dot per slide', JSON.stringify(pc));
    check(pc.scroll <= 0, 'phone: nothing runs off the side of the page', JSON.stringify(pc));
    check(pc.arrow >= 28, 'phone: arrows and dots are big enough to tap', JSON.stringify(pc));
    await bptab.screenshot({ path: resolve(SHOTS, 'carousel-phone.png') });
    await bphone.close();


    // Location Finder, Before and After, Countdown, Star Rating, Notice Bar, Phone Bar and Age Check.
    console.log('Location Finder, Before and After, Countdown, Star Rating, Notice Bar, Phone Bar and Age Check');
    const nreg = await php(`echo json_encode(array_map(fn($n) => WP_Block_Type_Registry::get_instance()->is_registered("anypress/$n"), ['location-finder' => 'location-finder', 'before-after' => 'before-after', 'countdown' => 'countdown', 'star-rating' => 'star-rating', 'notice-bar' => 'notice-bar', 'phone-bar' => 'phone-bar', 'age-check' => 'age-check']));`);
    check(Object.values(nreg).every(Boolean), 'the seven new blocks are registered', JSON.stringify(nreg));
    const mhtml = await (await fetch(`${base}/popup-more/`)).text();
    check(/wp-block-anypress-star-rating__text">4\.8 out of 5 from 127 Google reviews</.test(mhtml) && mhtml.includes('--anypress-rating:96%'), 'star rating: the rating in words, stars filled to 96%');
    check(/class="[^"]*wp-block-anypress-countdown[^"]*is-past[^"]*is-ended|class="[^"]*is-ended[^"]*is-past/.test(mhtml) && mhtml.includes('This offer has ended'), 'countdown: a past date shows its "ended" words');
    check(!mhtml.includes('is-hidden-past'), 'countdown: a past date with no "ended" words prints nothing');
    const lfItems = mhtml.match(/<li[^>]*class="wp-block-anypress-location-finder__place[^>]*>/g) || [];
    check(lfItems.length === 3 && lfItems.every((li) => !/\shidden/.test(li)) && (mhtml.match(/google\.com\/maps\/dir\//g) || []).length === 3, 'finder: lists all three locations, each with directions (works without JavaScript)', lfItems.join(' '));
    check(/<iframe[^>]+openstreetmap\.org\/export\/embed\.html\?bbox=[^"]+marker=39\.8017,-89\.6436/.test(mhtml.replace(/&#038;|&amp;/g, '&')), 'finder: the map starts on the first location');

    const ndesk = await browser.newContext({ viewport: { width: 1280, height: 860 }, geolocation: { latitude: 39.68, longitude: -89.70 }, permissions: ['geolocation'] });
    const ntab = await ndesk.newPage();
    const nerrors = [];
    ntab.on('pageerror', (e) => nerrors.push(e.message));
    await ntab.goto(`${base}/popup-more/`, { waitUntil: 'domcontentloaded' });
    await ntab.waitForTimeout(600);

    // Countdown ticks.
    const tick = () => ntab.$eval('.wp-block-anypress-countdown:not(.is-ended) [data-unit="seconds"]', (e) => e.textContent);
    const t1 = await tick();
    await ntab.waitForTimeout(1300);
    const t2 = await tick();
    check(t1 !== t2 && /^\d\d$/.test(t2), 'countdown: ticks every second', `${t1} then ${t2}`);
    check((await ntab.$eval('.wp-block-anypress-countdown:not(.is-ended) [data-unit="days"]', (e) => e.textContent)) === '2', 'countdown: two days left');

    // Notice bar.
    check(await ntab.locator('.wp-block-anypress-notice-bar').isVisible(), 'notice bar: shows');
    await ntab.click('.wp-block-anypress-notice-bar__close');
    check(!(await ntab.locator('.wp-block-anypress-notice-bar').isVisible()), 'notice bar: closes');
    await ntab.reload({ waitUntil: 'domcontentloaded' });
    await ntab.waitForTimeout(600);
    check(!(await ntab.locator('.wp-block-anypress-notice-bar').isVisible()), 'notice bar: stays closed on the next visit');
    await php(`$p = get_post(${ids.more}); wp_update_post(['ID' => $p->ID, 'post_content' => str_replace('Closed 24 to 26 December.', 'Closed 25 December only.', $p->post_content)]); echo 1;`);
    await ntab.reload({ waitUntil: 'domcontentloaded' });
    await ntab.waitForTimeout(600);
    check(await ntab.locator('.wp-block-anypress-notice-bar').isVisible(), 'notice bar: a changed message shows again');

    // Before and after.
    const cut = () => ntab.$eval('.wp-block-anypress-before-after', (e) => getComputedStyle(e.querySelector('.wp-block-anypress-before-after__after')).clipPath);
    check((await cut()).includes('40%'), 'before and after: starts at 40%', await cut());
    await ntab.$eval('.wp-block-anypress-before-after__frame', (e) => e.scrollIntoView({ block: 'center' }));
    await ntab.waitForTimeout(200);
    const fr = await ntab.$eval('.wp-block-anypress-before-after__frame', (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await ntab.mouse.move(fr.x + fr.w * 0.4, fr.y + fr.h / 2);
    await ntab.mouse.down();
    await ntab.mouse.move(fr.x + fr.w * 0.75, fr.y + fr.h / 2, { steps: 8 });
    await ntab.mouse.up();
    const dragged = await ntab.$eval('.wp-block-anypress-before-after__range', (e) => Number(e.value));
    check(dragged >= 70 && dragged <= 80 && (await cut()).includes(`${dragged}%`), 'before and after: dragging moves the handle and the cut', `${dragged} ${await cut()}`);
    await ntab.focus('.wp-block-anypress-before-after__range');
    await ntab.keyboard.press('ArrowLeft');
    await ntab.keyboard.press('ArrowLeft');
    check((await ntab.$eval('.wp-block-anypress-before-after__range', (e) => Number(e.value))) === dragged - 2, 'before and after: the arrow keys move it too');
    check((await ntab.$eval('.wp-block-anypress-before-after__range', (e) => e.getAttribute('aria-label'))) === 'Compare Before and After', 'before and after: the handle has a name for screen readers');
    await ntab.screenshot({ path: resolve(SHOTS, 'before-after-desktop.png'), clip: { x: 0, y: Math.max(0, fr.y - 20), width: 1280, height: Math.min(860, fr.h + 40) } });

    // Location finder.
    const places = () => ntab.$$eval('.wp-block-anypress-location-finder__place', (list) => list.map((li) => ({ name: li.querySelector('strong').textContent, hidden: li.hidden, order: Number(getComputedStyle(li).order), current: li.classList.contains('is-current'), dist: li.querySelector('.wp-block-anypress-location-finder__distance').textContent })));
    const mapSrc = () => ntab.$eval('.wp-block-anypress-location-finder__map iframe', (e) => e.src);
    await ntab.$eval('.wp-block-anypress-location-finder', (e) => e.scrollIntoView({ block: 'center' }));
    await ntab.fill('.wp-block-anypress-location-finder input[type="search"]', 'chatham');
    await ntab.waitForTimeout(200);
    let pl = await places();
    check(pl.filter((p) => !p.hidden).map((p) => p.name).join() === 'Chatham', 'finder: typing filters the list', JSON.stringify(pl));
    check((await ntab.textContent('.wp-block-anypress-location-finder__status')) === 'Showing 1 of 3 locations', 'finder: says how many match', await ntab.textContent('.wp-block-anypress-location-finder__status'));
    check((await mapSrc()).includes('marker=39.6761'), 'finder: the map follows the search to the first match');
    await ntab.fill('.wp-block-anypress-location-finder input[type="search"]', 'nowhere');
    await ntab.waitForTimeout(200);
    check((await ntab.textContent('.wp-block-anypress-location-finder__status')).startsWith('No locations match'), 'finder: says when nothing matches');
    await ntab.fill('.wp-block-anypress-location-finder input[type="search"]', '');
    await ntab.click('.wp-block-anypress-location-finder__place:nth-child(2) .wp-block-anypress-location-finder__pick');
    await ntab.waitForTimeout(200);
    pl = await places();
    check(pl[1].current && (await mapSrc()).includes('marker=39.7737') && (await ntab.getAttribute('.wp-block-anypress-location-finder__place:nth-child(2) .wp-block-anypress-location-finder__pick', 'aria-pressed')) === 'true', 'finder: picking a location moves the map to it', JSON.stringify(pl));
    await ntab.click('.wp-block-anypress-location-finder__near');
    await ntab.waitForTimeout(800);
    pl = await places();
    const byOrder = [...pl].sort((a, b) => a.order - b.order).map((p) => p.name);
    check(byOrder.join() === 'Chatham,West Side,Downtown' && pl.every((p) => / mi away$/.test(p.dist)), '"Near me" sorts nearest first and shows each distance', JSON.stringify(pl));
    check(pl[2].current && (await mapSrc()).includes('marker=39.6761'), '"Near me" shows the nearest on the map');
    await ntab.screenshot({ path: resolve(SHOTS, 'location-finder-desktop.png') });
    check(nerrors.length === 0, 'no JavaScript errors from the new blocks', nerrors.join('; '));
    await ndesk.close();

    // Phone: finder map above the list, phone bar at the bottom.
    const nphone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const nptab = await nphone.newPage();
    await nptab.goto(`${base}/popup-more/`, { waitUntil: 'domcontentloaded' });
    await nptab.waitForTimeout(500);
    const pf = await nptab.evaluate(() => {
        const map = document.querySelector('.wp-block-anypress-location-finder__map').getBoundingClientRect();
        const list = document.querySelector('.wp-block-anypress-location-finder__list').getBoundingClientRect();
        const units = [...document.querySelectorAll('.wp-block-anypress-countdown:not(.is-ended) .wp-block-anypress-countdown__unit')].map((u) => u.getBoundingClientRect());
        return { mapAbove: map.bottom <= list.top + 1, scroll: document.documentElement.scrollWidth - innerWidth, oneRow: units.every((u) => Math.abs(u.top - units[0].top) < 2), near: document.querySelector('.wp-block-anypress-location-finder__near').getBoundingClientRect().height };
    });
    check(pf.mapAbove, 'phone: the finder map sits above the list', JSON.stringify(pf));
    check(pf.oneRow, 'phone: the countdown fits on one row', JSON.stringify(pf));
    check(pf.near >= 44 && pf.scroll <= 0, 'phone: "Near me" is a full-size tap target and nothing runs off the side', JSON.stringify(pf));
    await nptab.screenshot({ path: resolve(SHOTS, 'new-blocks-phone.png'), fullPage: true });

    await nptab.goto(`${base}/popup-bar/`, { waitUntil: 'domcontentloaded' });
    await nptab.waitForTimeout(400);
    const pb = await nptab.evaluate(() => {
        const bar = document.querySelector('.wp-block-anypress-phone-bar');
        const r = bar.getBoundingClientRect();
        const links = [...bar.querySelectorAll('a')];
        return { bottom: innerHeight - r.bottom, visible: r.height > 0, fixed: getComputedStyle(bar).position, tel: links[0]?.getAttribute('href'), labels: links.map((a) => a.textContent.trim()), tap: Math.min(...links.map((a) => a.getBoundingClientRect().height)), pad: parseFloat(getComputedStyle(document.body).paddingBottom) };
    });
    check(pb.visible && pb.fixed === 'fixed' && Math.abs(pb.bottom) < 2, 'phone bar: sits at the bottom of a phone screen', JSON.stringify(pb));
    check(pb.tel === 'tel:2175550142' && pb.labels.join() === 'Call now,Book a cake', 'phone bar: calls the Site details number and links to booking', JSON.stringify(pb));
    check(pb.tap >= 48 && pb.pad >= 56, 'phone bar: full-size buttons, and the page is padded so it never covers the footer', JSON.stringify(pb));
    await nptab.screenshot({ path: resolve(SHOTS, 'phone-bar-phone.png') });
    await nphone.close();
    const bdesk2 = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const bd2 = await bdesk2.newPage();
    await bd2.goto(`${base}/popup-bar/`, { waitUntil: 'domcontentloaded' });
    check(!(await bd2.locator('.wp-block-anypress-phone-bar').isVisible()), 'phone bar: hidden on a computer when set to phones only');

    // Age check.
    await bd2.goto(`${base}/popup-age/`, { waitUntil: 'domcontentloaded' });
    await bd2.waitForTimeout(500);
    const ageOpen = () => bd2.$eval('.wp-block-anypress-age-check', (d) => d.open && d.matches(':modal'));
    check(await ageOpen(), 'age check: covers the page when it loads');
    await bd2.keyboard.press('Escape');
    await bd2.waitForTimeout(150);
    await bd2.keyboard.press('Escape');
    await bd2.waitForTimeout(300);
    check(await ageOpen(), 'age check: Escape does not get past it');
    await bd2.click('.wp-block-anypress-age-check__no');
    check(await bd2.locator('.wp-block-anypress-age-check__sorry').isVisible() && !(await bd2.locator('.wp-block-anypress-age-check__yes').isVisible()), 'age check: "No" says sorry and takes the buttons away');
    await bd2.screenshot({ path: resolve(SHOTS, 'age-check-desktop.png') });
    await bd2.reload({ waitUntil: 'domcontentloaded' });
    await bd2.waitForTimeout(500);
    check((await bd2.textContent('.wp-block-anypress-age-check__yes')).trim() === 'Yes, I am 21 or over', 'age check: the yes button names the age');
    await bd2.click('.wp-block-anypress-age-check__yes');
    await bd2.waitForTimeout(300);
    check(!(await bd2.$eval('.wp-block-anypress-age-check', (d) => d.open)) && (await bd2.evaluate(() => getComputedStyle(document.documentElement).overflow)) !== 'hidden', 'age check: "Yes" opens the site and lets it scroll');
    await bd2.reload({ waitUntil: 'domcontentloaded' });
    await bd2.waitForTimeout(600);
    check(!(await bd2.$eval('.wp-block-anypress-age-check', (d) => d.open)), 'age check: remembers "Yes" on the next visit');
    await bdesk2.close();

    // Editor: the saved page stays valid.
    const ed = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const etab = await ed.newPage();
    await etab.goto(`${base}/wp-login.php`);
    await etab.fill('#user_login', 'admin');
    await etab.fill('#user_pass', 'password');
    await etab.click('#wp-submit');
    await etab.waitForLoadState('domcontentloaded');
    await etab.goto(`${base}/wp-admin/post.php?post=${ids.delay}&action=edit`);
    await etab.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().length > 0, null, { timeout: 60000 });
    await etab.evaluate(() => window.wp.data.dispatch('core/preferences').set('core/edit-post', 'welcomeGuide', false));
    await etab.waitForTimeout(1500);
    const blocks = await etab.evaluate(() => {
        const walk = (list) => list.flatMap((b) => [{ name: b.name, valid: b.isValid }, ...walk(b.innerBlocks)]);
        return walk(window.wp.data.select('core/block-editor').getBlocks());
    });
    const pop = blocks.find((b) => b.name === 'anypress/popup');
    check(pop?.valid, 'the editor loads the popup as a valid block');
    check(blocks.every((b) => b.valid), 'every block on the page is valid in the editor', blocks.filter((b) => !b.valid).map((b) => b.name).join(', '));
    await etab.screenshot({ path: resolve(SHOTS, 'popup-editor.png') });
    // Inserting a fresh popup gives it an id and the starter heading and text.
    const fresh = await etab.evaluate(async () => {
        const { createBlock } = window.wp.blocks;
        window.wp.data.dispatch('core/block-editor').insertBlocks(createBlock('anypress/popup'));
        // The block fills in its id and starter blocks once its editor mounts; wait up to 10 seconds for that.
        let last;
        for (let i = 0; i < 50; i++) {
            await new Promise((r) => setTimeout(r, 200));
            const all = window.wp.data.select('core/block-editor').getBlocks().filter((b) => b.name === 'anypress/popup');
            last = all[all.length - 1];
            if (last.attributes.popupId && last.innerBlocks.length) break;
        }
        return { id: last.attributes.popupId, inner: last.innerBlocks.map((b) => b.name) };
    });
    check(/^popup-[a-z0-9]{8}$/.test(fresh.id) && fresh.inner.join() === 'core/heading,core/paragraph', 'a new popup gets an id and a heading and paragraph to fill in', JSON.stringify(fresh));

    await etab.goto(`${base}/wp-admin/post.php?post=${ids.blocks}&action=edit`);
    await etab.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().length > 0, null, { timeout: 60000 });
    await etab.evaluate(() => window.wp.data.dispatch('core/preferences').set('core/edit-post', 'welcomeGuide', false));
    await etab.waitForTimeout(1500);
    const bblocks = await etab.evaluate(() => {
        const walk = (list) => list.flatMap((b) => [{ name: b.name, valid: b.isValid }, ...walk(b.innerBlocks)]);
        return walk(window.wp.data.select('core/block-editor').getBlocks());
    });
    check(['anypress/carousel', 'anypress/counter', 'anypress/map'].every((n) => bblocks.some((b) => b.name === n && b.valid)) && bblocks.every((b) => b.valid),
        'the editor loads Carousel, Counter and Map as valid blocks', bblocks.filter((b) => !b.valid).map((b) => b.name).join(', '));
    // The editor canvas renders blocks as they come into view; give the map preview time to appear.
    await etab.waitForFunction(() => {
        const doc = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;
        return !!doc.querySelector('.wp-block-anypress-map iframe');
    }, null, { timeout: 15000 }).catch(() => {});
    const shown = await etab.evaluate(() => {
        const doc = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;
        return { counter: doc.querySelector('.wp-block-anypress-counter')?.textContent, map: !!doc.querySelector('.wp-block-anypress-map iframe') };
    });
    check(shown.counter === '2,400+' && shown.map, 'the editor shows the counter\'s number and a map preview', JSON.stringify(shown));
    await etab.screenshot({ path: resolve(SHOTS, 'blocks-editor.png') });
    const freshCar = await etab.evaluate(async () => {
        window.wp.data.dispatch('core/block-editor').insertBlocks(window.wp.blocks.createBlock('anypress/carousel'));
        await new Promise((r) => setTimeout(r, 800));
        const all = window.wp.data.select('core/block-editor').getBlocks().filter((b) => b.name === 'anypress/carousel');
        return all[all.length - 1].innerBlocks.length;
    });
    check(freshCar === 3, 'a new carousel starts with three slides to fill in', String(freshCar));

    for (const slug of ['more', 'bar', 'age']) {
        await etab.goto(`${base}/wp-admin/post.php?post=${ids[slug]}&action=edit`);
        await etab.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().length > 0, null, { timeout: 60000 });
        await etab.waitForTimeout(1500);
        const list = await etab.evaluate(() => {
            const walk = (l) => l.flatMap((b) => [{ name: b.name, valid: b.isValid }, ...walk(b.innerBlocks)]);
            return walk(window.wp.data.select('core/block-editor').getBlocks());
        });
        check(list.every((b) => b.valid) && list.some((b) => b.name.startsWith('anypress/')), `the editor loads the ${slug} page's blocks as valid`, list.filter((b) => !b.valid).map((b) => b.name).join(', '));
        if (slug === 'more') {
            await etab.waitForTimeout(1000);
            const prev = await etab.evaluate(() => {
                const doc = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;
                return { stars: doc.querySelector('.wp-block-anypress-star-rating__text')?.textContent, units: doc.querySelectorAll('.wp-block-anypress-countdown__unit').length, ba: !!doc.querySelector('.wp-block-anypress-before-after__after'), places: doc.querySelectorAll('.wp-block-anypress-location-finder__place').length };
            });
            check(prev.stars === '4.8 out of 5 from 127 Google reviews' && prev.units === 4 && prev.ba && prev.places === 3, 'the editor previews the stars, the countdown, both photos and the locations', JSON.stringify(prev));
            await etab.screenshot({ path: resolve(SHOTS, 'new-blocks-editor.png') });
        }
    }

    // Site details: bound blocks show the saved details, and editing one in the editor saves it for every page.
    console.log('Site details');
    const dhtml = await (await fetch(`${base}/popup-details/`)).text();
    check(/<h2[^>]*>Springfield Bakery<\/h2>/.test(dhtml), 'a bound heading shows the business name (the site title until one is set)');
    check(dhtml.includes('12 Main Street<br') && dhtml.includes('Springfield</p>'), 'a bound paragraph shows the address, line breaks kept');
    check(dhtml.includes('href="tel:2175550142"') && dhtml.includes('(217) 555-0142</a>'), 'a bound button calls the phone number');
    check(/<p class="linked-phone[^"]*"><a href="tel:2175550142">\(217\) 555-0142<\/a><\/p>/.test(dhtml), 'a bound paragraph shows the phone number as a call link');
    check(dhtml.includes('Open every day'), 'a detail not set yet shows the text saved in the block');
    await etab.goto(`${base}/wp-admin/post.php?post=${ids.details}&action=edit`);
    await etab.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().length > 0, null, { timeout: 60000 });
    await etab.waitForTimeout(1500);
    const src = await etab.evaluate(() => {
        const source = window.wp.blocks.getBlockBindingsSource?.('anypress/site-details');
        const doc = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;
        return { registered: !!source, fields: source?.getFieldsList?.().map((f) => f.args.key) || [], shown: doc.querySelector('.wp-block-paragraph')?.textContent || '' };
    });
    check(src.registered && src.fields.includes('hours') && src.fields.includes('phone_link'), 'the editor knows the source and lists its details', JSON.stringify(src.fields));
    check(src.shown.includes('12 Main Street'), 'the editor shows the saved address in its bound paragraph', src.shown);
    // Type into the bound paragraph as an owner would: bound text is editable only where the source allows it.
    const canvas = etab.frameLocator('iframe[name="editor-canvas"]');
    const hoursP = canvas.locator('p.wp-block-paragraph', { hasText: 'Open every day' });
    const editable = await hoursP.getAttribute('contenteditable', { timeout: 5000 });
    await hoursP.click();
    await etab.keyboard.press('ControlOrMeta+a');
    await etab.keyboard.type('Mon to Sat, 7 to 3');
    await etab.waitForTimeout(500);
    const saved = await etab.evaluate(async () => {
        const { select, dispatch } = window.wp.data;
        const edited = select('core').getEditedEntityRecord('root', 'site').anypress_site_details;
        await dispatch('core').saveEditedEntityRecord('root', 'site');
        return edited;
    });
    check(editable === 'true', 'an admin can edit a bound detail in place', String(editable));
    check(saved?.hours === 'Mon to Sat, 7 to 3' && saved?.phone === '(217) 555-0142', 'editing a bound detail in the editor changes that detail only', JSON.stringify(saved));
    const stored = await php(`echo json_encode(get_option('anypress_site_details'));`);
    check(stored.hours === 'Mon to Sat, 7 to 3', 'saving keeps it in the site settings, so every page shows it', JSON.stringify(stored));
    await ed.close();
} catch (e) {
    fail(`browser checks did not finish: ${e.message.split('\n')[0]}`);
} finally {
    await browser?.close();
}

const log = await cli.playground.run({ code: `<?php echo file_exists('/tmp/debug.log') ? file_get_contents('/tmp/debug.log') : '';` });
const ours = log.text.split('\n').filter((l) => l.includes('anypress-blocks'));
check(ours.length === 0, 'no PHP notices or errors from the plugin', ours.slice(0, 3).join(' | '));
pass(`screenshots in ${SHOTS}`);

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
await cli[Symbol.asyncDispose]?.();
process.exit(failures.length ? 1 : 0);
