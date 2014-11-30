const { Cc, Ci, Cr } = require("chrome");
const BLOGSPOT_COM_REGEXP = /(https?:\/\/.*\.blogspot\.com)\.[^/]*(\/.*?)$/g;
const BLOGSPOT_OTHER_REGEXP = /(https?:\/\/.*\.blogspot)\.it(\/.*?)$/g;

var events = require("sdk/system/events");

function listener(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var url = event.subject.URI.spec;
    var com = BLOGSPOT_COM_REGEXP.exec(url)
    var other = BLOGSPOT_OTHER_REGEXP.exec(url)
    // Check for blogspot.com.* domains
    if (com != null && com[0]) {
        var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        channel.redirectTo(ioService.newURI(com[1] + "/ncr" + com[2], undefined, undefined));
    }
    // Check for blogspot.x domains (currently x = it)
    else if (other != null && other[0]) {
        var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        channel.redirectTo(ioService.newURI(other[1] + ".com/ncr" + other[2], undefined, undefined));
    }
};

exports.main = function() {
    events.on("http-on-modify-request", listener);
};
