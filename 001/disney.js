const axios = require('axios');
const cheerio = require('cheerio');

const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201#ticket';

// Tips : リクエストヘッダーをブラウザと一緒にすることで、Program判定を受けない

const Monitor = async () => {
  const htmlResponse = await axios(productUrl);
  // 戻り値はHTMLなので、使用するBodyのみJSで使えるようにパースする
  const $ = cheerio.load(htmlResponse.data);
  //   console.log($('.textalign').eq(0).text());
  console.log($('.tab2-tds').text());
};

Monitor();
