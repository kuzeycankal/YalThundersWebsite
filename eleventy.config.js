const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
    
    let md = new markdownIt({ html: true, breaks: true, linkify: true });

    // --- YENİ FIREBASE SİSTEMİ İÇİN GEREKLİ KOPYALAMALAR ---
    // Bu dosyalar, sitemizin "import" komutlarını çalıştırabilmesi için
    // ana dizine kopyalanmalıdır.
    eleventyConfig.addPassthroughCopy("firebase-init.js");
    eleventyConfig.addPassthroughCopy("auth-firebase.js");
    
    // --- ESKİ DOSYALARI KOPYALAMAYI DURDUR ---
    // Bu satırlar, eski (artık silinmiş olan) localStorage
    // tabanlı .js dosyaları içindi. Çakışmayı önlemek için
    // bunları "yorum satırı" haline getirdik veya sildik.
    // eleventyConfig.addPassthroughCopy("auth.js");
    // eleventyConfig.addPassthroughCopy("event-manager.js");

    // --- SENİN MEVCUT DİĞER KOPYALAMALARIN ---
    // (Bunlar sitenin geri kalanının çalışması için gerekli)
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