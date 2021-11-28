const puppeteer = require('puppeteer');
const fs = require('fs'); // ファイル読み込みを行う
const axios = require('axios'); // 非同期的にHTTP通信を行う

const profile = JSON.parse(fs.readFileSync('puppeteer/profile.json')); // ファイルの読み込みを非同期的にして、JSONでパースする

const proxy = JSON.parse(fs.readFileSync('puppeteer/proxy.json')); // ファイルの読み込みを非同期的にして、JSONでパースする

const webhookUrl = fs.readFileSync('puppeteer/webhook.txt', 'utf-8'); // ファイルの読み込みを非同期的にする 文字コード指定しないと文字化けする

const productUrl =
  'https://www.apple.com/jp/shop/buy-iphone/iphone-13-pro/6.1%E3%82%A4%E3%83%B3%E3%83%81%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4-256gb-%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%88';

// seleniumの立ち上げ
async function givePage() {
  console.log('initilizing...');
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  return page;
}

// 実際に商品ページに行き, カートに入れる

async function addToCart(page) {
  console.log('adding to cart...');
  await page.goto(productUrl);
  await page.waitForSelector('#noTradeIn');
  const tradeIn = await page.$('#noTradeIn'); // 要素を取得して変数に代入
  await tradeIn.click(); // 要素をクリック
  await page.waitForSelector("button[name='add-to-cart']");
  const addToCartButton = await page.$("button[name='add-to-cart']");
  await addToCartButton.click();
  await page.waitForSelector("button[name='proceed']");
  const proceedButton = await page.$("button[name='proceed']");
  await proceedButton.click();
  await page.waitForSelector("button[data-autom='checkout']");
  const checkoutButton = await page.$("button[data-autom='checkout']");
  await checkoutButton.click();
  await page.waitForTimeout(2000); // 2秒待つ
}

//サインイン方法の選択 -> 今回はゲスト購入
async function signIn(page) {
  console.log('selecting sign-in method...');
  await page.waitForNavigation();
  // await page.waitForSelector("button[data-autom='guest-checkout-btn']"); waitForNavigationであればいけた。
  await page.click("button[data-autom='guest-checkout-btn']", (elem) => elem.click());
}

// 受け取り方法の選択
async function howToRecive(page) {
  console.log('selecting method to receive...');
  // await page.waitForNavigation();
  // await page.click("input[data-autom='fulfillment-option-HOME']", (elem) => elem.click());
  await page.waitForNavigation();
  await page.click("input[data-autom='form-field-postalCode']", (elem) => elem.click());
  const input = await page.$("input[data-autom='form-field-postalCode']");
  await input.click({ clickCount: 3 });
  await input.type(profile.billing.zipCode, { delay: 300 });
  await page.select('select[data-autom=form-field-state]', profile.billing.prefecture);
  await page.waitForNavigation();
  await page.click("button[data-autom='fulfillment-continue-button']", (elem) => elem.click());
  console.log('done');
}

// 住所を入力する
async function fillBiling(page) {
  console.log('filling billing...');
  await page.waitForNavigation();
  await page.type("input[data-autom='form-field-lastName']", profile.billing.lastName);
  await page.type("input[data-autom='form-field-firstName']", profile.billing.firstName);
  await page.type("input[data-autom='form-field-postalCode']", profile.billing.zipCode);
  await page.select('select[data-autom=form-field-state]', profile.billing.prefecture);
  await page.type("input[data-autom='form-field-street']", profile.billing.addressLine1);
  await page.type("input[data-autom='form-field-street2']", profile.billing.addressLine2);
  await page.type("input[data-autom='form-field-emailAddress']", profile.billing.email);
  await page.type("input[data-autom='form-field-mobilePhone']", profile.billing.phoneNumber);
  await page.click("button[data-autom='shipping-continue-button']", (elem) => elem.click());
}

// discordにWebhookとして飛ばす
async function sendWebhook(page) {
  const requestHeader = {
    'Content-Type': 'application/json',
  };
  const requestBody = {
    content: 'Success!',
  };
  try {
    const res = await axios.post(webhookUrl, requestBody, requestHeader);
    console.log(res.status);
  } catch (error) {
    console.error(error);
  }
}

async function checkOut(page) {
  var page = await givePage();
  await addToCart(page);
  await signIn(page);
  await howToRecive(page);
  await fillBiling(page);
  await sendWebhook(page);
}

checkOut();
