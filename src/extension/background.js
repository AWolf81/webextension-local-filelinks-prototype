const matchPattern = require('match-pattern');
const CONSTANTS = require('./common/constants');

const whitelist = ['http://127.0.0.1:3000/*', '*://*.localhost/*', '*://*.google.de/*', '*://*.trello.com/*'];

let port = null;
let activeTab = null;

console.log('hello from background');

// var CAKE_INTERVAL = 0.1;
var cake_notification = 'test-notify';

// chrome.alarms.create("", {periodInMinutes: CAKE_INTERVAL});

function checkUrls() {
  const preparedWhitelist = whitelist.map((url) => {
    // remap empty url or * to all urls
    return (url === '' || url === ' ' || url === '*' ) ? '<all_urls>' : url;
  });

  chrome.tabs.query({active: true, lastFocusedWindow: true, url: preparedWhitelist}, (tabs) => {
    // console.log(matchedTabs)
    if (!tabs) return; // no match

    var activeTab = tabs[0];
    // launching content script
    console.log('launch content script for active tab');
    chrome.tabs.sendMessage(activeTab.id, {
        action: "init", data: { enableLinkIcons: true }
      }
    , function(response) {
      console.log(response);
      // console.log(response.farewell); // not needed here
    });

    // inject css
    // --> defaults to activetab
    chrome.tabs.insertCSS(null, {runAt: 'document_start', allFrames: true, file:'css/self-hosted-materialize.css'});
    chrome.tabs.insertCSS(null, {runAt: 'document_start', allFrames: true, file:'css/style.css'});

    // inject scripts
    // --> defaults to activetab
    chrome.tabs.executeScript(null, {file:'js/jquery-1.11.3.min.js'});
    chrome.tabs.executeScript(null, {file:'js/jquery-observe.js'});
    chrome.tabs.executeScript(null, {file: './content.js'}, function() {
      chrome.tabs.sendMessage(activeTab.id, {
          action: 'init', data: {
            options: { enableLinkIcons: true, revealOpenOption: 'O' },
            constants: CONSTANTS
        }
      }
      , function(response) {
        console.log(response);
        // console.log(response.farewell); // not needed here
      });
    });
  });
}

// add message handling
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Last error:", chrome.runtime.lastError);
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension", request.url);

    console.log("reveal", request.reveal ? 1 : 0);
    var uri = request.url;
    // notify('link clicked', 'url: ' + request.url);
    // if (request.greeting == "hello") {
    //   sendResponse({farewell: "goodbye"});
    //   // return true;
    // }
    // sendNativeMessage(request.url); // with open connection

    console.log(chrome.runtime.sendNativeMessage);
    // chrome.extension.sendNativeMessage( // direct sending --> opens port to native app
    chrome.runtime.sendNativeMessage( // direct sending --> opens port to native app
      "com.google.chrome.example.echo",
    //   {"url": request.url, "reveal": request.reveal ? 1 : 0, "exeAllowed": 0},
      {"url": uri, "reveal": request.reveal ? 1 : 0, "exeAllowed": 0},
      function(response) {
          console.log("Received response - ", response);
          if (response && response.error !== null) {
            notify('Errror', chrome.i18n.getMessage(response.error)); // only NotFound error at the moment
          }
      });
    //launcher.start(request.url, false);
});

chrome.tabs.onActivated.addListener(() => {
  console.log('tab activated');
  checkUrls();
})

let notifyCount = 0;
function notify(title, message) {
  notifyCount++;
  console.log(cake_notification + notifyCount, title, message);
  chrome.notifications.create(
  cake_notification + notifyCount, {
    type: 'basic',
    iconUrl: "logo.png",
    title: title,
    message: message
    },

    function() {
      setTimeout(() => {
        chrome.notifications.clear(cake_notification + notifyCount);
      }, 2000);
  });
}

// chrome.tabs.onCompleted.addListener((tabId, changeInfo, tab) => {
//   console.log('loaded');
//   checkUrls();
// })

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    notify('loaded', 'loaded tab');
    checkUrls();

    // var clearing = chrome.notifications.clear(cake_notification);
    // clearing.then(() => {
    //   console.log("cleared");
    // });
  }
})

// messaging to native app for launching file explorer

function onNativeMessage(message) {
  // appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
  console.log('Received', message)
}

function onDisconnected() {
  console.log("Failed to connect: " + chrome.runtime.lastError.message);
  // appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
  // updateUiState();
}

function connect() {
  var hostName = "com.google.chrome.example.echo";
  // appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  console.log("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
  // updateUiState();
}

/*function sendNativeMessage(url) {
  // message = "Hello world" //{"text": document.getElementById('input-text').value};
  port.postMessage({"text": url});
 // appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}*/


// document.addEventListener('DOMContentLoaded', function () {
//   // document.getElementById('connect-button').addEventListener(
//   //     'click', connect);
//   setTimeout(function () {
//     if (!port) connect();
//   }, 0);
// });
