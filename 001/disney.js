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

// pageの設定
const Page = async () => {
  const browser = await puppeteer.launch({
    headless: false, // headless true出来ない?
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
    console.log('Page loaded');

    // メンテナンスページを取得する
    const maintenanceMessage = await page.evaluate(
      () => document.getElementsByClassName('pghError01')[0].innerText,
    );

    if (maintenanceMessage) {
      console.log('メンテナンス中');
      await page.close();
      console.log('5秒後リスタートします');
      await sleep(5000); // 5秒待つ
      await main();
    }

    // ディズニーシーを選択する
    await page.waitForTimeout(3000);
    await page.waitForSelector('.list-1day-02'); // これ機能してる？
    const disneySea = await page.$('.list-1day-02');
    await disneySea.click();
    console.log('disneySea clicked');

    await page.waitForTimeout(3000);

    // テキストを取得する
    const textMessage = await page.evaluate(
      () => document.getElementsByClassName('list-salesform-eticket-message')[0].innerText,
    );

    if (textMessage == '現在、販売していません') {
      console.log('現在、販売していません...');
      await page.close();
      await sleep(5000); // 5秒待つ
      main();
    } else {
      console.log('在庫復活!!!');
      // 在庫復活したので、URLと共にLINEに送る
    }
  } catch (error) {
    console.log(error);
    console.log('Something went wrong...');
    // エラー通知をデバッグとして自分のLINE Notifyに送る
  }
};

main();
