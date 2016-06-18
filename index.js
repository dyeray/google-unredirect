const { Cc, Ci, Cr, Cu} = require("chrome");
const {Services} = Cu.import("resource://gre/modules/Services.jsm", {});

DEFAULT_DOMAINS = "ca;co.uk;com.ar;com.au;com.br;com.es;com.tr;de;gr;in;mx;ch;fr;ie;it;nl;pt;ro;sg;be;no;se";
AC_DOMAINS = "extensions.no-more-blogger-redirect.domains"

var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var about_config = require("sdk/preferences/service")
var redirected_domains = [];


function onDomainsUpdated(subject, topic, data) {
    if (!(subject instanceof Ci.nsIPrefBranch)) {
        return;
    }
    generateDomainLists();
    registerRedirectFunction();
}


function generateDomainLists() {
    var domains = about_config.get(AC_DOMAINS, DEFAULT_DOMAINS).split(";");
    redirected_domains = [];
    for (var i = 0; i < domains.length; i++) {
        redirected_domains.push("*.blogspot." + domains[i]);
    }
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
    pm = pageMod.PageMod({
        contentScriptWhen: 'start',
        include: redirected_domains,
        contentScriptFile: data.url("redirect_script.js")
    });
}

exports.main = function() {
    setAboutConfig(); // Create settings in about config and configure listener in case settings are changed.
    generateDomainLists();    // Generate in ram the lists of domains to redirect from the settings.
    registerRedirectFunction();   // Register the function that is going to do the redirect (it depends on what method has been selected).
};

exports.onUnload = function() {
    domains_branch.removeObserver("", onDomainsUpdated);
};
