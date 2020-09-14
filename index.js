#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const process = require('process');
const url = require('url');
const express = require('express');

const packageInfo = require('./package');

let dir = path.resolve(__dirname, process.argv[2] || process.cwd()); // Docsify directory

if (process.argv[2] === '-h' || process.argv[2] === '--help') {
    console.log('ssblc: Static Site Broken Link Checker');
    console.log('A broken-link checker for static sites, like the ones generated with docsify');
    console.log();
    console.log('Usage:');
    console.log('ssblc [directory]\tChecks the static site in the directory, CWD if none is specified');
    console.log('-h --help\tDisplays help');
    console.log('-v --version\tPrint version number');
    process.exit(0);
} else if (process.argv[2] === '-v' || process.argv[2] === '--version') {
    console.log(`${packageInfo.name} v${packageInfo.version}`);
    console.log(`by ${packageInfo.author}`);

} else {

    let found = 0;
    let checked = 0;

    let foundLinks = ['http://localhost:3000/'];
    let checkedLinks = [];
    let unfoundLinks = [];

    if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
        const app = express();
        app.use(express.static(dir));

        /**
         * Checks the links
         * @returns {Promise<void>}
         */
        const action = async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setCacheEnabled(false);

            let link;

            page.on("response", response => {
                const request = response.request();
                const url = request.url();
                if (url === link && response.status() > 399) {
                    console.error("request failed url:", url);
                    unfoundLinks.push(url);
                } else if (response.status() > 399 && url.endsWith('.md') && !url.endsWith('_sidebar.md')) {
                    // Docsify
                    console.error("request failed url:", url);
                    unfoundLinks.push(url);
                }
            });

            for (link = foundLinks.pop(); link; link = foundLinks.pop()) {
                checked++;
                checkedLinks.push(link);

                console.log(`${checked - 1}/${found}\t Checking link: `, link);
                await page.goto(link);
                await page.waitForTimeout(100);


                const content = await page.content();

                if (link.startsWith('http://localhost:3000')) {
                    const newLinks = Array.from(
                        content.matchAll(/href="([^"]*)"/g),
                        m => m[1]
                    ).map(nlink => url.resolve(link, nlink))
                        .filter(nlink => !checkedLinks.includes(nlink))
                        .filter(nlink => !foundLinks.includes(nlink)
                        )
                        .filter(nlink => !nlink.startsWith('mailto:'))
                        .filter(nlink => !nlink.startsWith('tel:'));
                    foundLinks.push(...newLinks);
                    found += newLinks.length;
                }
            }

            await page.close();
            await browser.close();
        };

        const runServer = async () => {
            const server = app.listen(3000);
            console.log('Running at http://localhost:3000\n');
            try {
                await action();
                server.close();

                if (unfoundLinks.length > 0) {
                    console.warn('\nBroken links were detected:');
                    console.log(unfoundLinks.reduce((previousValue, currentValue) => previousValue + '- ' + currentValue + '\n', ''));
                    process.exit(1);
                } else {
                    console.info('All checks passed, no broken links detected...');
                    process.exit(0);
                }
            } catch (e) {
                console.error(`Something didn't quite work as expected:  ${e.message}`);
                server.close(() => {
                    process.exit(1);
                });
            }
        };
        runServer();
    }
}
