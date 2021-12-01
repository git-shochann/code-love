const axios = require('axios');
const cheerio = require('cheerio');

// const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201#ticket'; クエリ文字列のを見つけてしまった
// const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201?park=tds#ticket'; クエリ文字列でも結局は表示させただけでスクレイピングすると、ディズニーランドのほうになってしまう(日付は別となってる)

// 1/1のディズニーランド 復活を確認
const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201#ticket';

// Tips : リクエストヘッダーをブラウザと一緒にすることで、Program判定を受けない

const Monitor = async () => {
  const htmlResponse = await axios(productUrl);
  // 戻り値はHTMLなので、使用するBodyのみJSで使えるようにパースする
  const $ = cheerio.load(htmlResponse.data);
  const available = $('.type').eq(6).text(); // 1/1 非効率のように感じるけど一旦これでOK
  if (available == '×') {
    console.log('Sold Out...');
  } else {
    console.log('Restock!');
  }

  // What is this?
  await new Promise((r) => setTimeout(r, 3000));
  Monitor();
  return false;
};

Monitor();
