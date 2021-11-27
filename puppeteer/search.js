const puppeteer = require('puppeteer');
const fs = require('fs');

const profile = JSON.parse(fs.readFileSync('puppeteer/profile.json')); // ファイルの読み込みを非同期的にして、JSONでパースする
// profile.billing.lastName -> "Shoko"

// const proxy = JSON.parse(fs.readFileSync('proxy.json')); // ファイルの読み込みを非同期的にして、JSONでパースする
// proxy.default.1 -> "52.193.255.163:3128:sho:sho"

const product_url =
  'https://www.apple.com/jp/shop/buy-iphone/iphone-13-pro/6.1%E3%82%A4%E3%83%B3%E3%83%81%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4-256gb-%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%88';

// seleniumの立ち上げ
async function givePage() {
  console.log('initilizing');
  const browser = await puppeteer.launch({
    headless: false,
    // args: ['--proxy-server=52.193.255.163:3128:sho:sho'],
    // args: [`--proxy-server-proxy=${proxy.dafault.1}`],
  });
  const page = await browser.newPage();
  return page;
}

// 実際に商品ページに行き, カートに入れる
async function addToCart(page) {
  console.log('adding to cart');
  await page.goto(product_url);
  await page.waitForSelector('#noTradeIn');
  await page.click('#noTradeIn', (elem) => elem.click());
  await page.waitForSelector("button[name='add-to-cart']");
  await page.click("button[name='add-to-cart']", (elem) => elem.click()); // この書き方は？
  await page.waitForSelector("button[name='proceed']");
  await page.click("button[name='proceed']", (elem) => elem.click());
  // await page.waitForSelector('#shoppingCart.actions.checkout'); // これでは取れなかった。
  // await page.waitForNavigation(); // 違いは？
  await page.waitForSelector("button[data-autom='checkout']");
  await page.click("button[data-autom='checkout']", (elem) => elem.click());
}

//サインイン方法の選択 -> 今回はゲスト購入
async function signIn(page) {
  console.log('selecting sign-in method');
  await page.waitForNavigation();
  // await page.waitForSelector("button[data-autom='guest-checkout-btn']"); waitForNavigationであればいけた。
  await page.click("button[data-autom='guest-checkout-btn']", (elem) => elem.click());
}

// 受け取り方法の選択
async function howToRecive(page) {
  console.log('selecting method to receive');
  await page.waitForNavigation();
  await page.click("input[data-autom='fulfillment-option-HOME']", (elem) => elem.click());
  await page.waitForNavigation();
  await page.click("button[data-autom='checkout-zipcode-edit']", (elem) => elem.click());
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
  console.log('filling billing');
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
async function sendWebhook(page) {}

async function checkOut(page) {
  var page = await givePage();
  await addToCart(page);
  await signIn(page);
  await howToRecive(page);
  await fillBiling(page);
}

checkOut();
