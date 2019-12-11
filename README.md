# @pklachka/ssblc
Static Site Broken Link Checker

A broken-link checker for static sites, like the ones generated with docsify that can get used, for example, for CI purposes on docsify docs (this is what I've developed it for).

It recursively checks internal links found on the static website (until every internal link is checked) and (without recursion) outgoing links. This is achieved by finding `href` attributes in the HTML, meaning also stylesheets included with `<link href="some-file.css">` get checked.

## Installation
You can either run it by just using `npx`, in which case you won't have to install it, or first install it with

```shell script
npm install -g @pklaschka/ssblc
```

## Usage
When you are in the folder of your static website (i.e., there is an `index.html` in this folder), simply run

```shell script
ssblc
```

after which the checker will begin its work.

To use it with `npx`, simply run

```shell script
npx @pklaschka/ssblc
```

Alternatively, you can also specify an absolute or relative path to the directory of the site, e.g., like this:

```shell script
ssblc ../my-site
```
