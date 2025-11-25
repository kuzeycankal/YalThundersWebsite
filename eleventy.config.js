
console.log("ELEVENTY CONFIG YÜKLENDİ!");

const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
    
    // Markdown ayarları
    let md = new markdownIt({
        html: true,
        breaks: true,
        linkify: true
    });

    // ============================
    // 🔥 PASSTHROUGH COPY (GÜVENLİ)
    // ============================

    // CSS ve medya
    eleventyConfig.addPassthroughCopy("style.css");
    eleventyConfig.addPassthroughCopy("*.png");
    eleventyConfig.addPassthroughCopy("*.jpg");
    eleventyConfig.addPassthroughCopy("*.jpeg");
    eleventyConfig.addPassthroughCopy("takimfoto.jpg");
    eleventyConfig.addPassthroughCopy("news");
    eleventyConfig.addPassthroughCopy("yal_thunders_logo.png");

    // Firebase bağlantıları
    eleventyConfig.addPassthroughCopy("firebase-init.js");
    eleventyConfig.addPassthroughCopy("auth-firebase.js");
    eleventyConfig.addPassthroughCopy("event-manager-firebase.js");

    // ============================
    // 🔥 ACADEMY (HTML + JS)
    // ============================

    // HTML dosyaları
    eleventyConfig.addPassthroughCopy("academy");
    eleventyConfig.addPassthroughCopy("academy/academy.html");
    eleventyConfig.addPassthroughCopy("academy/academy-admin.html");
    eleventyConfig.addPassthroughCopy("academy/academy-meetings.html");
    eleventyConfig.addPassthroughCopy("academy/video.html");
    eleventyConfig.addPassthroughCopy("academy/admin-upload.html");

    // Ana dizindeki JS dosyaları
    eleventyConfig.addPassthroughCopy({
        "academy-videos.js": ".",
        "academy-video-detail.js": ".",
        "academy-admin.js": ".",
        "academy-meetings.js": ".",
        "admin-upload.js": ".",
        "video.js": ".",
        "auth.js": ".",
        "profile.js": ".",
        "login.js": "."
    });

    // node_modules’i komple kopyalamayı engellemek için
    // ❌ eleventyConfig.addPassthroughCopy("*.js"); ASLA EKLEME
    // bu yüzden sorun oluşuyordu.

    // ============================
    // 🔥 FİLTRELER
    // ============================

    eleventyConfig.addLiquidFilter("postDate", (dateObj) => {
        if (!dateObj) return "Tarih Yok";
        try {
            const dt = DateTime.fromJSDate(new Date(dateObj));
            return dt.isValid ? dt.toFormat("dd LLLL yyyy") : "Geçersiz Tarih";
        } catch {
            return "Tarih Hatası";
        }
    });

    eleventyConfig.addLiquidFilter("markdownify", (markdownString) => {
        if (typeof markdownString !== "string") return "";
        try {
            return md.render(markdownString);
        } catch {
            return markdownString;
        }
    });

    eleventyConfig.addLiquidFilter("url_encode", (str) =>
        encodeURIComponent(str || "")
    );

    eleventyConfig.addFilter(
        "absoluteUrl",
        (url, base = "https://yal-thunders-website.vercel.app/") =>
            new URL(url, base).href
    );

    // HTML formatlarını tanıt
    eleventyConfig.addTemplateFormats("html");

    return {
        dir: {
            input: ".",
            output: "_site",
            data: "_data",
        },
        htmlTemplateEngine: "liquid",
        markdownTemplateEngine: "liquid",
        passthroughFileCopy: true,
        templateFormats: ["html", "md"]
    };
};
