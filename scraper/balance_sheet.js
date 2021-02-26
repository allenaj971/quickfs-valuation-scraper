// import puppeteer
const puppeteer = require("puppeteer");
// allows export to json
var fs = require("fs");

// allows for access to login and password. create an .env file and put login details in caps
const dotenv = require("dotenv");
dotenv.config();

// let is_statement for income statement
const bs_statement = [];
// importing stocks as json file
let Stocks = require("./stocks.json");
let login = process.env.LOGIN;
let password = process.env.PASSWORD;

// launch a puppeteer function in headless mode. using async functionality. followed this: https://www.aymen-loukil.com/en/blog-en/google-puppeteer-tutorial-with-examples/
puppeteer.launch({ headless: true }).then(async (browser) => {
  // because we're using async syntax, we use try
  let dataUrl = "https://quickfs.net/login";
  // await a new browser tab and goto the url
  const dataPage = await browser.newPage();
  // set window sizing to flexible
  await dataPage.setViewport({ width: 0, height: 0 });

  // goto dataUrl and set timeout to until loaded
  await dataPage.goto(dataUrl, { waitUntil: "load", timeout: 0 });
  // focus on login
  await dataPage.focus("#loginForm > div > div:nth-child(3) > div > input");
  // enter login
  await dataPage.keyboard.type(login);
  // focus on password
  await dataPage.focus("#loginForm > div > div:nth-child(4) > div > input");
  // enter password
  await dataPage.keyboard.type(password);
  // click sign in
  await dataPage.click("#submitLoginFormBtn");
  // wait some time to go home
  await dataPage.waitForSelector(
    "body > app-root > user-logged-in-home > app-header-main > header > div > div > div.navbar-header > a"
  );
  // go home
  await dataPage.click(
    "body > app-root > user-logged-in-home > app-header-main > header > div > div > div.navbar-header > a"
  );

  // using for loop for a list of Stocks
  for (i = 0; i < Stocks.length; i++) {
    // initialise ith company array of values to copy them
    bs_statement[i] = [];

    //   wait for search bar to load
    await dataPage.waitForSelector(
      "body > app-root > app-home > app-header-main > header > div > div > div.collapse.navbar-collapse.anonymous-navbar-collapse > div > app-search > div > div.input-group.stylish-input-group.width-100 > input"
    );
    // find & focus on search bar
    await dataPage.click(
      "body > app-root > app-home > app-header-main > header > div > div > div.collapse.navbar-collapse.anonymous-navbar-collapse > div > app-search > div > div.input-group.stylish-input-group.width-100 > input"
    );

    // input company name
    await dataPage.keyboard.type(Stocks[i]);
    // click search
    await dataPage.click("#searchSubmitBtn");
    // wait for page to load
    await dataPage.waitForSelector(
      "body > app-root > app-company > div > div > div.pageHead > div > div:nth-child(3) > div.col-xs-offset-3.col-xs-2 > select-fs-dropdown > div > button"
    );

    //   wait for overview button
    await dataPage.waitForSelector(
      "body > app-root > app-company > div > div > div.pageHead > div > div:nth-child(3) > div.col-xs-offset-3.col-xs-2 > select-fs-dropdown > div > button"
    );
    // click on the overview button
    await dataPage.click(
      "body > app-root > app-company > div > div > div.pageHead > div > div:nth-child(3) > div.col-xs-offset-3.col-xs-2 > select-fs-dropdown > div > button"
    );
    // click on the cash flow statement
    await dataPage.click("#bs");
    // wait some time for page elements to load
    await dataPage.waitForSelector("#bs-table > tbody");
    // wait for home button to load
    await dataPage.waitForSelector(
      "body > app-root > app-company > app-header-content > header > div > div > div:nth-child(1) > a"
    );

    // get whole balance sheet
    for (j = 1; j < 26; j++) {
      // iterate over columns
      let table = await dataPage.$$eval(
        `#bs-table > tbody > tr:nth-child(${j}) > td`,
        // use map function and return the elements
        (el) =>
          el.map((td) => {
            return td.textContent;
          })
      );
      bs_statement[i][j] = [];
      // copy company values to bs_statement array
      for (k = 0; k < table.length; k++) {
        // copy company values to bs_statement array
        for (k = 0; k < table.length; k++) {
          if (!bs_statement[i][j] && table[k]) {
            // if bs_statement[i][] doesn't exist and table[k] is not empty, create new one
            bs_statement[i][j][k] = table[k];
          } else if (String(table[k]) !== "-") {
            // if bs_statement[i][] does exist and table[k] is not empty
            bs_statement[i][j][k] = table[k];
          } else if (String(table[k]) === "-") {
            // else if table has stupid dash, change it to zero
            bs_statement[i][j][k] = "0";
          }
        }

        // set null values to zero. then we can iterate over table but ignore 0
        if (!bs_statement[i][j]) {
          bs_statement[i][j] = "0";
        }
        // insert company name and years tag
        if (!bs_statement[i][0] || !bs_statement[i][1][0]) {
          bs_statement[i][0] = Stocks[i];
          bs_statement[i][1][0] = "Year";
        }
      }
    }

    // write to JSON file: https://www.semicolonworld.com/question/47954/node-js-how-to-write-an-array-to-file
    fs.writeFile(
      ".././json/scraped_financials/balance_sheet.json",
      JSON.stringify(bs_statement),
      function (err) {
        if (err) {
          console.error(err);
        }
      }
    );
    //   wait for home
    await dataPage.waitForSelector(
      "body > app-root > app-company > app-header-content > header > div > div > div:nth-child(1) > a"
    );

    //   go home
    await dataPage.click(
      "body > app-root > app-company > app-header-content > header > div > div > div:nth-child(1) > a"
    );
  }
  // TODO: add FCF calculation to JSON file, check cfs-valuation line 76 for details on how to do it...

  // browser close NOT dataPage
  await browser.close();
});
