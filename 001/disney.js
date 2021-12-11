const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('../utils/sleep');
const line = require('line-bot-sdk');

//LINEメッセージ配信用の設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const productUrl =
  'https://reserve.tokyodisneyresort.jp/ticket/search/?outside=1&route=2&parkTicketGroupCd=020&useDateFrom=20211219';

const main = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      language: 'ja',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    );
    await page.goto(productUrl, { waitUntil: 'networkidle0' });
    console.log('Page loaded...');

    // 混雑ページを取得
    if (
      await page.evaluate(
        () =>
          document.getElementsByClassName('textalign')[0]?.innerText.indexOf('アクセスが集中') > -1,
      )
    ) {
      console.log('Site is busy...');
      await browser.close();
      console.log('Restart in 5sec...');
      await sleep(5000);
      await main();
    }

    console.log('Crowded page passed...');

    // メンテナンスページを取得
    if (
      await page.evaluate(
        () =>
          document.getElementsByClassName('pghError01')[0]?.innerText.indexOf('メンテナンス中') >
          -1,
      )
    ) {
      console.log('Under maintenance...');
      await browser.close();
      console.log('Restart in 5sec...');
      await sleep(5000);
      await main();
    }

    console.log('Maintenance page passed...');

    // ディズニーシーを選択
    await page.waitForSelector('.list-1day-02'); // これ機能してる？
    const disneySea = await page.$('.list-1day-02');
    await disneySea.click();
    console.log('DisneySea clicked...');
    await sleep(5000); // ここがsleepのみでいいのか問題 -> 混雑時終わる気がする
    // テキストを取得
    const textMessage = await page.evaluate(
      () => document.getElementsByClassName('list-salesform-eticket-message')[0].innerText,
    );

    if (textMessage == '現在、販売していません') {
      console.log('Waiting for restock...');
      await browser.close();
      await main();
    } else {
      console.log('Restock!');
      // 在庫復活したので、URLと共にLINEに送る
    }
  } catch (error) {
    console.log(error);
    console.log('Something went wrong...');
    // エラー通知をデバッグとして自分のLINE Notifyに送る
  }
};

main();
