const puppeteer = require('puppeteer');
const fs = require('fs'); // ファイル読み込みを行う
const axios = require('axios'); // 非同期的にHTTP通信を行う
const prompt = require('prompt-sync')(); // ユーザーにターミナル上で入力をしてもらう

const profile = JSON.parse(fs.readFileSync('000/profile.json')); // ファイルの読み込みを非同期的にして、JSONでパースする

// const proxy = JSON.parse(fs.readFileSync('000/proxy.json')); // ファイルの読み込みを非同期的にして、JSONでパースする

const webhookUrl = fs.readFileSync('000/webhook.txt', 'utf-8'); // ファイルの読み込みを非同期的にする 文字コード指定しないと文字化けする

const productUrl =
  'https://www.apple.com/jp/shop/buy-iphone/iphone-13-pro/6.1%E3%82%A4%E3%83%B3%E3%83%81%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4-256gb-%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%88';

// 一番初めに呼び出される関数
async function selectMode() {
  const mode = prompt('Please select number, DEBUG[0] or PRODUCTION[1]: '); // ここでの戻り値はString型
  if (mode == '0') {
    await debug();
  } else if (mode == '1') {
    await checkOut();
  } else {
    console.log('Invalid Mode!');
  }
}

// Debug
async function debug() {
  console.log('Debug Mode Started...');
  const page = await givePage();
  await page.waitForTimeout(600000);
  page.close();
}

// Production
async function checkOut(page) {
  var page = await givePage();
  await addToCart(page);
  await signIn(page);
  await howToRecive(page);
  await fillShipping(page);
  await submitPayment(page);
  await confirmOrder(page);
  await sendWebhook(page);
}

// seleniumの立ち上げ
async function givePage() {
  console.log('Initializing...');
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50, // かなり安定した
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  // あってもなくてもいいけど、画面がしっかり見えるようにする
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  // await page.authenticate({ username: 'sho', password: 'sho' }); // 認証が必要
  return page;
}

// 実際に商品ページに行き, カートに入れる

async function addToCart(page) {
  await page.goto(productUrl);
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

  // 苗字 // これだとなぜ動かなかった？
  // await page.waitForSelector("input[data-autom='form-field-lastName]");
  // const lastNameInput = await page.$("input[data-autom='form-field-lastName]"); // そもそもここが取れてない。-> これだと動かなかったのはなぜ？
  // page.waitForTimeout(1000);
  // await lastNameInput.click();

  // 苗字
  await page.type("input[data-autom='form-field-lastName']", profile.billing.lastName);

  // 名前
  await page.type("input[data-autom='form-field-firstName']", profile.billing.firstName);

  // 郵便番号
  await page.waitForSelector("input[data-autom='form-field-postalCode']");
  const postalCodeInput = await page.$("input[data-autom='form-field-postalCode']");
  await postalCodeInput.click({ clickCount: 3 });
  await postalCodeInput.type(profile.billing.zipCode);

  // 都道府県
  await page.select("select[data-autom='form-field-state']", profile.billing.prefecture);

  // 市区町村
  await page.type("input[data-autom='form-field-city']", profile.billing.city);

  // 住所1
  await page.type("input[data-autom='form-field-street']", profile.billing.addressLine1);

  // 住所2
  await page.type("input[data-autom='form-field-street2']", profile.billing.addressLine2);

  // メールアドレス
  await page.type("input[data-autom='form-field-emailAddress']", profile.billing.email);

  // 電話番号
  await page.waitForSelector("input[data-autom='form-field-mobilePhone']");
  await page.type("input[data-autom='form-field-mobilePhone']", profile.billing.phoneNumber);

  // 支払いに進むボタンを押す
  const continuePayment = await page.$("button[data-autom='shipping-continue-button']");
  await continuePayment.click();

  console.log('Submitted Shipping!');
}

// 支払い情報の入力
async function submitPayment(page) {
  await page.waitForTimeout(2000);

  // 支払い方法を選択
  const selectCard = await page.$("input[data-autom='checkout-billingOptions-CREDIT']");
  await selectCard.click();

  await page.waitForTimeout(1000);

  // クレジットカード情報を入力する
  await page.waitForSelector("input[data-autom='card-number-input']");
  await page.type("input[data-autom='card-number-input']", profile.payment.cardNumber);

  // 有効期限
  await page.type("input[data-autom='expiration-input']", profile.payment.expirationDate);

  // CVV
  await page.type("input[data-autom='security-code-input']", profile.payment.cvv);

  // 注文の確認ボタンを押す
  const checkOrder = await page.$("button[data-autom='continue-button-label']");
  await checkOrder.click();

  console.log('Submitted Payment!');
}

async function confirmOrder(page) {
  await page.waitForTimeout(2000);

  // 注文の確認ボタンを押す
  const confirmOrder = await page.$("button[data-autom='continue-button-label']");
  await confirmOrder.click();

  console.log('Checking Order...');
  console.log('Proceessing Order...');

  await page.waitForTimeout(5000);

  console.log('Successfully Checked Out!');

  // if // 注文完了の画面が表示されたら、成功でWebhookを飛ばす

  // // 注文の成功が起きなければ、3回だけリトライする
}

// discordにオーダー情報と共に, Webhookとして飛ばす
async function sendWebhook(page) {
  const requestHeader = {
    'Content-Type': 'application/json',
  };
  const requestBody = {
    content: 'Success!',
  };
  try {
    const res = await axios.post(webhookUrl, requestBody, requestHeader);
    if (res.status === 200 || res.status === 204) console.log('Posted Webhook!');
  } catch (error) {
    console.error(error);
  }
}

selectMode();
