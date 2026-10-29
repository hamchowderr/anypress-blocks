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
    scroll: popup({ popupId: 'offer', trigger: 'scroll', scroll: 60, position: 'bottom-right', size: 'small' }, signup) + '\n\n' + filler,
};
const ids = await php(`
    $out = [];
    foreach (json_decode(${JSON.stringify(JSON.stringify(pages))}, true) as $slug => $content) {
        $out[$slug] = wp_insert_post(['post_type' => 'page', 'post_status' => 'publish', 'post_title' => "Popup $slug", 'post_name' => "popup-$slug", 'post_content' => $content]);
    }
    echo json_encode($out);
`);

if (SERVE) {
    // Auto-login sends cookie-less requests round in circles, so serving skips the checks.
    console.log(`Serving ${base} (admin / password): /popup-delay/, /popup-click/, /popup-scroll/. Ctrl+C to stop.`);
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
        return { left: d.left, right: innerWidth - d.right, scroll: document.documentElement.scrollWidth - innerWidth, close: Math.min(c.width, c.height), open: document.getElementById('signup').open };
    });
    check(fit.open, 'phone: opens after the delay');
    check(fit.left >= 8 && fit.right >= 8 && fit.scroll <= 0, 'phone: fits the screen with nothing running off the side', JSON.stringify(fit));
    check(fit.close >= 44, 'phone: the close button is at least 44 px', String(fit.close));
    await ptab.screenshot({ path: resolve(SHOTS, 'popup-phone.png') });
    await phone.close();

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
        await new Promise((r) => setTimeout(r, 800));
        const all = window.wp.data.select('core/block-editor').getBlocks().filter((b) => b.name === 'anypress/popup');
        const last = all[all.length - 1];
        return { id: last.attributes.popupId, inner: last.innerBlocks.map((b) => b.name) };
    });
    check(/^popup-[a-z0-9]{8}$/.test(fresh.id) && fresh.inner.join() === 'core/heading,core/paragraph', 'a new popup gets an id and a heading and paragraph to fill in', JSON.stringify(fresh));
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
