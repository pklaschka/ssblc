const path = require('path');
const shell = require('shell-exec');

const app = path.resolve(__dirname, '..');
const testSite1Location = path.resolve(__dirname, 'test-site-1');
const testSite2Location = path.resolve(__dirname, 'test-site-2');

const site1Links = [
    'http://localhost:3000/',
    'http://localhost:3000/index.html',
    'http://localhost:3000/index.html#abc',
    'http://localhost:3000/page2.html',
    'http://localhost:3000/page3.html',
    'https://xdplugins.pabloklaschka.de/',
];

const site2Links = [
    'http://localhost:3000/',
    'http://localhost:3000/index.html',
    'http://localhost:3000/indexfj.html',
    'http://localhost:3000/index.html#abc',
    'http://localhost:3000/page2.html',
    'http://localhost:3000/page3.html',
];

describe('@pklaschka/ssblc', () => {
    describe('test-site-1: Site with no broken links', () => {
        let results;

        beforeAll(async () => {
            results = await shell(`node ${app} ${testSite1Location}`);
        });

        it('should stop with an exit code of 0 (success)', async () => {
            expect(results.code).toBe(0);
        });

        it('should check all internal links', () => {
            for (let link of site1Links) {
                expect(results.stdout).toContain(link + '\n')
            }
        });

        it('should not output any errors', () => {
            expect(results.stderr).toBeFalsy();
        })
    });

    describe('test-site-2: Site with broken links', () => {
        let results;

        beforeAll(async () => {
            results = await shell(`node ${app} ${testSite2Location}`);
            console.log(results);
        });

        it('should stop with an exit code of not 0 (failure)', async () => {
            expect(results.code).not.toBe(0);
        });

        it('should check all internal links', () => {
            for (let link of site2Links) {
                expect(results.stdout).toContain(link + '\n')
            }
        });

        it('should output errors', () => {
            expect(results.stderr).toBeTruthy();
        })
    });

    describe('Exceptions', () => {
        it('should fail when the port is already in use', async () => {
            const http = require('http');
            const server = http.createServer();
            server.listen(3000);
            results = await shell(`node ${app} ${testSite1Location}`);
            expect(results.code).not.toBe(0);
            expect(results.stderr).toContain('address already in use');
            server.close();
        });
    });
});
