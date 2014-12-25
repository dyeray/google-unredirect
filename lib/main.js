const { Cc, Ci, Cr, Cu} = require("chrome");
const {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

DEFAULT_DOMAINS = "ca;co.uk;com.ar;com.au;com.br;com.es;com.tr;de;gr;in;mx;ch;fr;ie;it;nl;pt;ro;sg;be;no;se";
AC_DOMAINS = "extensions.no-more-blogger-redirect.domains"

var events = require("sdk/system/events");
var sp = require('sdk/simple-prefs');
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var about_config = require("sdk/preferences/service")
var redirected_domains = [];

function redirectRequest(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    var match = domains_regex.exec(event.subject.URI.spec);
    if (match) {
        var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        channel.redirectTo(ioService.newURI(match[1] + "com/ncr" + match[3] || '', undefined, undefined));
    }
}

function onDomainsUpdated(subject, topic, data) {
    if (!(subject instanceof Ci.nsIPrefBranch)) {
        return;
    }
    generateDomainLists();
    registerRedirectFunction();
}


function generateDomainLists() {
    var domains = about_config.get(AC_DOMAINS, DEFAULT_DOMAINS).split(";");
    var domains_for_regex = "";
    redirected_domains = [];
    for (var i = 0; i < domains.length; i++) {
        redirected_domains.push("*.blogspot." + domains[i]); // We use this list with the pagemod method (NoScript compatible)
        domains_for_regex += "|" + domains[i]; // We will build a regex for the regular method.
    }
    domains_regex = new RegExp("(https?:\/\/.*\.blogspot\.)(" + domains_for_regex.substr(1) + ")(\/.*)?$");
}

function setAboutConfig() {
    // Set default about:config value if it doesn't exist
    if (!about_config.has(AC_DOMAINS)) {
        about_config.set(AC_DOMAINS, DEFAULT_DOMAINS);
    }
    domains_branch = Services.prefs.getBranch(AC_DOMAINS);
    domains_branch.addObserver("", onDomainsUpdated, false);
}

function registerRedirectFunction() {
    // Disable both types of redirection
    if (typeof pm !== 'undefined') {
        pm.destroy();
    }
    events.off("http-on-modify-request", redirectRequest);
    
    // Now enable the method that has been selected in the settings
    if (sp.prefs.noScriptEnabled) {
        // This method redirects by inserting a javascript in the page
        pm = pageMod.PageMod({
            contentScriptWhen: 'start',
            include: redirected_domains,
            contentScriptFile: data.url("redirect_script.js")
        });
    }
    else {
        // This method redirects by intercepting the request
        events.on("http-on-modify-request", redirectRequest);
    }
}

exports.main = function() {
    setAboutConfig(); // Create settings in about config and configure listener in case settings are changed.
    generateDomainLists();    // Generate in ram the lists of domains to redirect from the settings.
    registerRedirectFunction();   // Register the function that is going to do the redirect (it depends on what method has been selected).
    sp.on("noScriptEnabled", registerRedirectFunction); // If the user picks a different method of redirection register it.
};

exports.onUnload = function() {
    domains_branch.removeObserver("", onDomainsUpdated);
};
