# Localfile system links WebExtension (first test project)

Todos:

[] add test folder + webserver for test cases (later, for now I'm starting the test server in a separate working copy)
[] Icon adding not working properly
[] Native message installer required (later, batch file for development OK)
[] Check why native messaging is not working at the moment
[] Create Extension settings page - options.html (uses Vue for view handling)
[] Add "addon bar" icon to display activity of Extension on current tab
[] Implement localization

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Extension testing in browser

### Install native app
Go to `src\host\` and run `install_host`. This will register the native app in your system-

### Manually starting
Run `npm run dev`, open Firefox and enter about:debugging in url bar and load `dist\manifest.json` Extension.

### With Web-ext CLI
Install [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext) with `npm install --global web-ext`.

And run `web-ext run` in `dist` folder to start FF nightly with the Extension temporarily enabled.
