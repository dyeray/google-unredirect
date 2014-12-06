const { Cc, Ci, Cr } = require("chrome");
const BLOGSPOT_INCLUDE_URLS = ["*.blogspot.com.es", "*.blogspot.it"];

var events = require("sdk/system/events");
var sp = require('sdk/simple-prefs');
var pageMod = require("sdk/page-mod");
var redirect = require("./redirect.js");
var data = require("sdk/self").data;

function redirectRequest(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var url = event.subject.URI.spec;
    var redirect_url = redirect.get_redirect(url);
    if (redirect_url) {
        var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        channel.redirectTo(ioService.newURI(redirect_url, undefined, undefined));
    }
}

function register_redirect_function() {
    // If the NoScript compatibility option is enabled
    if (sp.prefs.noScriptEnabled) {
        // Disable redirection by capturing and redirecting the request.
        events.off("http-on-modify-request", redirectRequest);
        // Use a javascript in the pages to redirect them.
        pm = pageMod.PageMod({
            contentScriptWhen: 'start',
            include: BLOGSPOT_INCLUDE_URLS,
            contentScriptFile: data.url("redirect_script.js")
        });
    }
    // If the NoScript compatibility option is disabled.
    else {
        // Disable the scripts that redirects pages.
        if (typeof pm !== 'undefined') {
            pm.destroy();
        }
        // Enable redirection by capturing and redirecting the request.
        events.on("http-on-modify-request", redirectRequest);
    }
}

exports.main = function() {
    register_redirect_function();
    sp.on("noScriptEnabled", register_redirect_function);
};
