const withTypescript = require("@zeit/next-typescript");
const withCss = require("@zeit/next-css");
const withImages = require("next-images");
module.exports = withTypescript(withCss(withImages()));
