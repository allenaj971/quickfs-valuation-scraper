const puppeteer = require("puppeteer");
// allows export to json
var fs = require("fs");
// let cfs_statement for cash flow statement
const cfs_statement = [];

// allows for access to login and password. create an .env file and put login details in caps
const dotenv = require("dotenv");
dotenv.config();
// obvious...
let stocks = [
  "APX:AU",
  "XRO:AU",
  "WTC:AU",
  "ELO:AU",
  "BVS:AU",
  "BTH:AU",
  "ALU:AU",
  "NCNO:US",
];
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

  // using for loop for a list of stocks
  for (i = 0; i < stocks.length; i++) {
    // initialise ith company array of values to copy them
    cfs_statement[i] = [];

    //   wait for search bar to load
    await dataPage.waitForSelector(
      "body > app-root > app-home > app-header-main > header > div > div > div.collapse.navbar-collapse.anonymous-navbar-collapse > div > app-search > div > div.input-group.stylish-input-group.width-100 > input"
    );
    // find & focus on search bar
    await dataPage.click(
      "body > app-root > app-home > app-header-main > header > div > div > div.collapse.navbar-collapse.anonymous-navbar-collapse > div > app-search > div > div.input-group.stylish-input-group.width-100 > input"
    );

    // input company name
    await dataPage.keyboard.type(stocks[i]);
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
    await dataPage.click("#cf");
    // wait some time for page elements to load
    await dataPage.waitForSelector("#cf-table > tbody > tr:nth-child(9)");
    // wait for home button to load
    await dataPage.waitForSelector(
      "body > app-root > app-company > app-header-content > header > div > div > div:nth-child(1) > a"
    );

    // get whole cash flow statement
    for (j = 1; j < 21; j++) {
      // iterate over columns
      let table = await dataPage.$$eval(
        `#cf-table > tbody > tr:nth-child(${j}) > td`,
        // use map function and return the elements
        (el) =>
          el.map((td) => {
            return td.textContent;
          })
      );

      cfs_statement[i][j] = [];
      // copy company values to cfs_statement array
      for (k = 0; k < table.length; k++) {
        if (!cfs_statement[i][j] && table[k]) {
          // if cfs_statement[i][] doesn't exist and table[k] is not empty, create new one
          cfs_statement[i][j][k] = table[k];
        } else if (String(table[k]) !== "-") {
          // if cfs_statement[i][] does exist and table[k] is not empty
          cfs_statement[i][j][k] = table[k];
        } else if (String(table[k]) === "-") {
          // else if table has stupid dash, change it to zero
          cfs_statement[i][j][k] = "0";
        }
      }

      // set null values to zero. then we can iterate over table but ignore 0
      if (!cfs_statement[i][j]) {
        cfs_statement[i][j] = "0";
      }
      // insert company name and years tag
      if (!cfs_statement[i][0] || !cfs_statement[i][1][0]) {
        cfs_statement[i][0] = stocks[i];
        cfs_statement[i][1][0] = "Year";
      }
    }

    // write to JSON file: https://www.semicolonworld.com/question/47954/node-js-how-to-write-an-array-to-file
    fs.writeFile(
      ".././json/cash_flow_statement.json",
      JSON.stringify(cfs_statement),
      function (err) {
        if (err) {
          console.error(err);
        }
      }
    );

    //   go home
    await dataPage.click(
      "body > app-root > app-company > app-header-content > header > div > div > div:nth-child(1) > a"
    );
  }
  // browser close NOT dataPage
  await browser.close();
});
