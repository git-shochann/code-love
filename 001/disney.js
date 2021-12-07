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

// pageの設定
const Page = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    language: 'ja',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  return page;
};

const main = async () => {
  try {
    const page = await Page();
    await page.goto(productUrl);
    console.log('page loaded');

    // ディズニーシーを選択する
    await page.waitForTimeout(3000);
    await page.waitForSelector('.list-1day-02');
    const disneySea = await page.$('.list-1day-02');
    await disneySea.click();
    console.log('disneySea clicked');

    await page.waitForTimeout(3000);

    // テキストを取得する
    const text = await page.evaluate(
      () => document.getElementsByClassName('list-salesform-eticket-message')[0].innerText,
    );

    if (text == '現在、販売していません') {
      console.log('現在、販売していません');
      page.close();
      await page.waitForTimeout(2000);
      main();
    } else {
      console.log('Restock!');
    }
  } catch (error) {
    console.log(error);
    page.close();
    await page.waitForTimeout(2000);
    main();
  }
};

// Tips : リクエストヘッダーをブラウザと一緒にすることで、Program判定を受けない

main();
