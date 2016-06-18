var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var preferences = require("sdk/preferences/service");
var simple_prefs = require("sdk/simple-prefs");

DEFAULT_DOMAINS = "ca;co.uk;com.ar;com.au;com.br;com.es;com.tr;de;gr;in;mx;ch;fr;ie;it;nl;pt;ro;sg;be;no;se";
//AC_DOMAINS = "extensions.no-more-blogger-redirect.domains";
AC_DOMAINS = "extensions.google-unredirect@dyeray.domains";

var redirected_domains = [];


function onDomainsUpdated() {
    generateDomainLists();
    registerRedirectFunction();
}


function generateDomainLists() {
    var domains = preferences.get(AC_DOMAINS, DEFAULT_DOMAINS).split(";");
    redirected_domains = [];
    for (var i = 0; i < domains.length; i++) {
        redirected_domains.push("*.blogspot." + domains[i]);
    }
}

function setAboutConfig() {
    // Set default about:config value if it doesn't exist
    if (!preferences.has(AC_DOMAINS)) {
        preferences.set(AC_DOMAINS, DEFAULT_DOMAINS);
    }
    simple_prefs.on("domains", onDomainsUpdated);
}

function registerRedirectFunction() {
    if (typeof pm !== 'undefined') {
      pm.destroy();
    }
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
    simple_prefs.removeListener("domains", onDomainsUpdated);
};
