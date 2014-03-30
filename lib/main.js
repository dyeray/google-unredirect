const { Cc, Ci, Cr } = require("chrome");
const BLOGSPOT_REGEXP = /(https?:\/\/.*\.blogspot\.com)\.[^/]*(\/.*?)$/g;

var events = require("sdk/system/events");
var utils = require("sdk/window/utils");

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var url = event.subject.URI.spec;
    var match = BLOGSPOT_REGEXP.exec(url)
    if (match != null && match[0]) {
        channel.cancel(Cr.NS_BINDING_ABORTED);
        var gBrowser = utils.getMostRecentBrowserWindow().gBrowser;
        var domWin = channel.notificationCallbacks.getInterface(Ci.nsIDOMWindow);
        var browser = gBrowser.getBrowserForDocument(domWin.top.document);
        browser.loadURI(match[1]+"/ncr"+match[2]);
    }
};

exports.main = function() {
    events.on("http-on-modify-request", listener);
};
