const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

// const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201#ticket'; クエリ文字列のを見つけてしまった
// const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201?park=tds#ticket'; クエリ文字列でも結局は表示させただけでスクレイピングすると、ディズニーランドのほうになってしまう(日付は別となってる)

// 1/1のディズニーランド 復活を確認
// 発売予定になると値段が表示される仕様なので誤作動注意
// const productUrl = 'https://www.tokyodisneyresort.jp/ticket/index/202201#ticket';

const productUrl =
  'https://reserve.tokyodisneyresort.jp/ticket/search/?outside=1&route=2&parkTicketGroupCd=020&useDateFrom=20211219';

const Page = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  return page;
};

const main = async () => {
  const page = await Page();
  await page.goto(productUrl);
  console.log('page loaded');
  await page.waitForSelector('.list-1day-02');
  const disneySea = await page.$('.list-1day-02');
  await disneySea.click();
  console.log('disneySea clicked');

  // テキストを取得する
  // evaluateメソッドの第一引数に, アロー関数を設定する
  const res = await page.evaluate(() => {
    const element = document.getElementsByClassName('list-salesform-eticket-message');
    const text = element[0].innerText;
  });

  console.log(res);

  // await page.waitForSelector("button[data-role='none']");
  // const printOutAtHome = await page.$("button[data-role='none']");
  // await printOutAtHome.click();
  // console.log('printOutAtHome clicked');
};

// Tips : リクエストヘッダーをブラウザと一緒にすることで、Program判定を受けない

// const Monitor = async () => {
//   const htmlResponse = await axios(productUrl);
//   // 戻り値はHTMLなので、使用するBodyのみJSで使えるようにパースする
//   const $ = cheerio.load(htmlResponse.data);
//   // const available = $('.ticket-price-box').length;

//   // What is this?
//   await new Promise((r) => setTimeout(r, 3000));
//   Monitor();
//   return false;
// };

main();

// // list-1day-01
// const tdl = await page.$('.list-1day-01');
// tdl.click();

// // list-1day-02
// const tds = await page.$('.list-1day-02');
// tds.click();
