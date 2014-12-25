var regexp = /(https?:\/\/.*\.blogspot\.)[^\/]*(\/.*)?$/;
match = regexp.exec(document.URL);
window.location = match[1] + "com/ncr" + match[2] || "";
