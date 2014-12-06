const BLOGSPOT_COM_REGEXP = /(https?:\/\/.*\.blogspot\.com)\.[^/]*(\/.*?)$/g;
const BLOGSPOT_OTHER_REGEXP = /(https?:\/\/.*\.blogspot)\.it(\/.*?)$/g;

function get_redirect(url) {
    var com = BLOGSPOT_COM_REGEXP.exec(url)
    var other = BLOGSPOT_OTHER_REGEXP.exec(url)
    // Check for blogspot.com.* domains
    if (com != null && com[0]) {
        return com[1] + "/ncr" + com[2];
    }
    // Check for blogspot.x domains (currently x = it)
    else if (other != null && other[0]) {
        return other[1] + ".com/ncr" + other[2];
    }
    return null;
}
redirect = get_redirect(document.URL);
if (redirect) {
    window.location = redirect;
}
