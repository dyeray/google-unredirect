var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var preferences = require("sdk/preferences/service");
var simple_prefs = require("sdk/simple-prefs");

DEFAULT_DOMAINS = "al;am;ba;be;bg;ca;ch;co.id;co.uk;co.za;com.ar;com.au;com.br;com.by;com.co;com.cy;com.ee;com.eg;com.es;com.mt;com.ng;com.tr;com.uy;de;fr;gr;hr;ie;in;is;it;li;lt;lu;md;mk;mx;my;nl;no;pe;pt;qa;ro;rs;se;sg;si;sn;ug";
AC_DOMAINS = "extensions.google-unredirect@dyeray.domains";
REDIRECT_BLOGGER = "extensions.google-unredirect@dyeray.redirect_blogger";
REDIRECT_GOOGLE = "extensions.google-unredirect@dyeray.redirect_google";


function onDomainsUpdated() {
  var redirected_domains = generateDomainLists();
  registerRedirectFunction(redirected_domains);
}


function generateDomainLists() {
  var domains = preferences.get(AC_DOMAINS, DEFAULT_DOMAINS).split(";");
  var redirected_domains = [];
  for (var i = 0; i < domains.length; i++) {
    redirected_domains.push("*.blogspot." + domains[i]);
  }
  return redirected_domains;
}

function setAboutConfig(key, value) {
  // Set default about:config value if it doesn't exist
  if (!preferences.has(key)) {
    preferences.set(key, value);
  }
}

function registerRedirectFunction(redirected_domains) {
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
  setAboutConfig(AC_DOMAINS, DEFAULT_DOMAINS); // Create settings in about config and configure listener in case settings are changed.
  setAboutConfig(REDIRECT_BLOGGER, true); // If we allow to unredirect Google in the future, we may need to disable blogger unredirection.
  setAboutConfig(REDIRECT_GOOGLE, false); // For current users, we disable Google unredirection for the future.
  simple_prefs.on("domains", onDomainsUpdated);
  var redirected_domains = generateDomainLists();    // Generate the list of domains to redirect.
  registerRedirectFunction(redirected_domains);   // Register the redirect function.
};

exports.onUnload = function() {
  simple_prefs.removeListener("domains", onDomainsUpdated);
};
