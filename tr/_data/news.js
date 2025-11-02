const contentful = require('contentful');

// KENDİ BİLGİLERİNİZİ KONTROL EDİN
const spaceId = 'lahs2niphr0g'; 
const accessToken = 'K0TGAcjh2cmmAMjYy4Olf8ylrrZcOkqGkOgKxAdmMVo'; 
const contentType = 'yalthundersHaber'; 

const client = contentful.createClient({
  space: spaceId,
  accessToken: accessToken,
});

module.exports = async function() {
  try {
    const entries = await client.getEntries({
      content_type: contentType
    });

    if (entries.items && entries.items.length > 0) {
      console.log(`${entries.items.length} adet haber (liste için) başarıyla çekildi. ✅`); 
      
      return entries.items
        .filter(item => item.fields.slug && typeof item.fields.slug === 'string') 
        .map(item => {
          return {
            publishDate: item.fields.publishDate ? new Date(item.fields.publishDate) : null, 
            title: item.fields.title || "Başlık Yok", 
            slug: item.fields.slug, 
            featuredImage: item.fields.featuredImage?.fields?.file?.url || null, 
            content: item.fields.content || "" 
          };
        });
        
    }
    console.log("Contentful'da hiç haber bulunamadı. ⚠️");
    return []; 
  } catch (error) {
    console.error("Contentful verisi çekilirken hata:", error.message); 
    return []; 
  }
};