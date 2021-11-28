const puppeteer = require('puppeteer');
const fs = require('fs'); // ファイル読み込みを行う
const axios = require('axios'); // 非同期的にHTTP通信を行う

const profile = JSON.parse(fs.readFileSync('000/profile.json')); // ファイルの読み込みを非同期的にして、JSONでパースする

const proxy = JSON.parse(fs.readFileSync('000/proxy.json')); // ファイルの読み込みを非同期的にして、JSONでパースする

const webhookUrl = fs.readFileSync('000/webhook.txt', 'utf-8'); // ファイルの読み込みを非同期的にする 文字コード指定しないと文字化けする

const productUrl =
  'https://www.apple.com/jp/shop/buy-iphone/iphone-13-pro/6.1%E3%82%A4%E3%83%B3%E3%83%81%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4-256gb-%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%88';

// seleniumの立ち上げ
async function givePage() {
  console.log('initilizing...');
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50, // かなり安定した
  });
  const page = await browser.newPage();
  // あってもなくてもいいけど、画面がしっかり見えるようにする
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  return page;
}

// 実際に商品ページに行き, カートに入れる

async function addToCart(page) {
  await page.goto(productUrl);
  await page.waitForTimeout(2000); // 2秒待つ
  await page.waitForSelector('#noTradeIn');
  const tradeIn = await page.$('#noTradeIn'); // 要素を取得して変数に代入
  await tradeIn.click(); // 要素をクリック
  await page.waitForTimeout(2000);
  await page.waitForSelector("button[name='add-to-cart']");
  const addToCart = await page.$("button[name='add-to-cart']");
  await addToCart.click();
  await page.waitForTimeout(2000);
  await page.waitForSelector("button[name='proceed']");
  const proceed = await page.$("button[name='proceed']");
  await proceed.click();
  await page.waitForTimeout(2000);
  await page.waitForSelector("button[data-autom='checkout']");
  const checkout = await page.$("button[data-autom='checkout']");
  await checkout.click();
  console.log('Added to cart!');
}

//サインイン方法の選択 -> 今回はゲスト購入
async function signIn(page) {
  await page.waitForTimeout(2000);
  await page.waitForSelector("button[data-autom='guest-checkout-btn']");
  const GuestCheckout = await page.$("button[data-autom='guest-checkout-btn']");
  await GuestCheckout.click();
  console.log('Completed Sign-in!');
}

// 受け取り方法の選択
async function howToRecive(page) {
  await page.waitForTimeout(2000);
  await page.waitForSelector("button[data-autom='checkout-zipcode-edit']");
  const postalCodeButton = await page.$("button[data-autom='checkout-zipcode-edit']");
  await postalCodeButton.click();

  await page.waitForSelector("input[data-autom='form-field-postalCode']");
  const postalCodeInput = await page.$("input[data-autom='form-field-postalCode']");

  await postalCodeInput.click({ clickCount: 3 });

  await postalCodeInput.type(profile.billing.zipCode, { delay: 100 });

  await page.waitForSelector('select[data-autom=form-field-state]');
  await page.select('select[data-autom=form-field-state]', profile.billing.prefecture);

  await page.waitForTimeout(2000);

  await page.waitForSelector("button[data-autom='fulfillment-continue-button']");
  const continueShipping = await page.$("button[data-autom='fulfillment-continue-button']");
  await continueShipping.click();

  console.log('Submitted method to receive!');
}

// 住所を入力する
async function fillShipping(page) {
  await page.waitForTimeout(2000);

  // 苗字
  await page.waitForSelector("input[data-autom='form-field-lastName]");
  const lastNameInput = await page.$("input[data-autom='form-field-lastName]"); // そもそもここが取れてない。
  page.waitForTimeout(1000);
  await lastNameInput.click();
  await page.type("input[data-autom='form-field-lastName']", profile.billing.lastName, {
    delay: 100,
  });

  // 名前
  await page.waitForSelector("input[data-autom='form-field-firstName]");
  await page.type("input[data-autom='form-field-firstName']", profile.billing.firstName);

  // 郵便番号
  await page.waitForSelector("input[data-autom='form-field-postalCode']");
  const postalCodeInput = await page.$("input[data-autom='form-field-postalCode']");
  await page.waitForTimeout(1000);
  await postalCodeInput.click({ clickCount: 3 });
  await postalCodeInput.type(profile.billing.zipCode, { delay: 100 });

  // 都道府県
  await page.waitForSelector('select[data-autom=form-field-state]');
  await page.select('select[data-autom=form-field-state]', profile.billing.prefecture);

  // 住所1
  await page.waitForSelector("input[data-autom='form-field-address1']");
  await page.type("input[data-autom='form-field-street']", profile.billing.addressLine1);

  // 住所2
  await page.waitForSelector("input[data-autom='form-field-address2']");
  await page.type("input[data-autom='form-field-street2']", profile.billing.addressLine2);

  // メールアドレス
  await page.waitForSelector("input[data-autom='form-field-emailAddress']");
  await page.type("input[data-autom='form-field-emailAddress']", profile.billing.email);

  // 電話番号
  await page.waitForSelector("input[data-autom='form-field-mobilePhone']");
  await page.type("input[data-autom='form-field-mobilePhone']", profile.billing.phoneNumber);

  // 支払いに進むボタンを押す
  await page.waitForSelector("button[data-autom='checkout-billing-continue-button']");
  const continuePayment = await page.$("button[data-autom='shipping-continue-button']");
  await continuePayment.click();

  console.log('Submitted for shipping');
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
  await fillShipping(page);
  await sendWebhook(page);
}

checkOut();
