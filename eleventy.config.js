const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
    
    let md = new markdownIt({ html: true, breaks: true, linkify: true });

    // --- YENİ SİSTEM İÇİN PASSTHROUGH AYARLARI ---
    // Yeni Firebase JS dosyalarını kopyala
    eleventyConfig.addPassthroughCopy("firebase-init.js");
    eleventyConfig.addPassthroughCopy("auth-firebase.js");
    eleventyConfig.addPassthroughCopy("event-manager-firebase.js");
    
    // ESKİ JS kopyalamalarını kaldırıyoruz (çakışma olmasın)
    // eleventyConfig.addPassthroughCopy("auth.js");
    // eleventyConfig.addPassthroughCopy("*.js"); // Bu satır en önemlisi

    // Diğer dosyaları kopyala (Senin orijinal ayarların)
    eleventyConfig.addPassthroughCopy("style.css");
    eleventyConfig.addPassthroughCopy("*.png");
    eleventyConfig.addPassthroughCopy("*.jpg");
    eleventyConfig.addPassthroughCopy("*.jpeg");
    eleventyConfig.addPassthroughCopy("news");
    eleventyConfig.addPassthroughCopy("takimfoto.jpg");
    // -----------------------------------------------

    // Liquid Filtreleri (Senin orijinal ayarların)
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
    eleventyConfig.addFilter("absoluteUrl", (url, base = "https://kuzeycankal.github.io/YalThundersWebsite/") => new URL(url, base).href);

    // .html uzantılı dosyaları şablon olarak tanı
    eleventyConfig.addTemplateFormats("html");

    // (Senin orijinal ayarların)
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