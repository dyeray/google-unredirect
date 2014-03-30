const { Cc, Ci, Cr } = require("chrome");
const BLOGSPOT_REGEXP = /(https?:\/\/.*\.blogspot\.com)\.[^/]*(\/.*?)$/g;

var events = require("sdk/system/events");

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var url = event.subject.URI.spec;
    var match = BLOGSPOT_REGEXP.exec(url)
    if (match != null && match[0]) {
        var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        channel.redirectTo(ioService.newURI(match[1]+"/ncr"+match[2], undefined, undefined));
    }
};

exports.main = function() {
    events.on("http-on-modify-request", listener);
};
