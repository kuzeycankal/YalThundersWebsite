const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {

    let md = new markdownIt({ html: true, breaks: true, linkify: true });

    // --- FIREBASE SİSTEMİ İÇİN GEREKLİ KOPYALAMALAR ---
    eleventyConfig.addPassthroughCopy("firebase-init.js");
    eleventyConfig.addPassthroughCopy("auth-firebase.js");
    eleventyConfig.addPassthroughCopy("event-manager-firebase.js");

    // --- TÜM JS DOSYALARINI OTOMATİK KOPYALA ---
    eleventyConfig.addPassthroughCopy("*.js");
    eleventyConfig.addPassthroughCopy("**/*.js");

    // --- STATİK DOSYALAR ---
    eleventyConfig.addPassthroughCopy("style.css");
    eleventyConfig.addPassthroughCopy("*.png");
    eleventyConfig.addPassthroughCopy("*.jpg");
    eleventyConfig.addPassthroughCopy("*.jpeg");
    eleventyConfig.addPassthroughCopy("takimfoto.jpg");
    eleventyConfig.addPassthroughCopy("news");

    // --- FİLTRELER ---
    eleventyConfig.addLiquidFilter("postDate", (dateObj) => {
        if (!dateObj) return "Tarih Yok"; 
        try {
            const dt = DateTime.fromJSDate(new Date(dateObj));
            return dt.isValid ? dt.toFormat("dd LLLL yyyy") : "Geçersiz Tarih";
        } catch(e) { return "Tarih Hatası"; }
    });

    eleventyConfig.addLiquidFilter("markdownify", (markdownString) => {
        if (typeof markdownString !== 'string') return ''; 
        try { return md.render(markdownString); } 
        catch(e) { return markdownString; }
    });

    eleventyConfig.addLiquidFilter("url_encode", (str) => encodeURIComponent(str || ''));

    eleventyConfig.addFilter("absoluteUrl", (url, base = "https://kuzeycankal.github.io/YalThundersWebsite/") => 
        new URL(url, base).href
    );

    eleventyConfig.addTemplateFormats("html");

    return {
        dir: {
            input: ".",
            output: "_site",
            data: "_data"
        },
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid",
        passthroughFileCopy: true,
        templateFormats: ["html", "md"]
    };
};
