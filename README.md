# Update - 1/03/2021
Unfortunately, Quickfs.net has blocked scraping, in headless mode or not :(

## Disclaimer

The information on this site, and its related publications, is not intended to be, nor does it constitute, investment advice or recommendations. In no event shall QuickFS.net be liable to any member, guest, or third party for any damages of any kind arising out of the use of any content or other material published or available on QuickFS.net, or relating to the use of, or inability to use, QuickFS.net or any content. The information on this site is not guaranteed for completeness, accuracy, or in any other way. I (Allen) am also not responsible for damages of any kind from the use of this project. This project (whether it be the scraper or the valuation scripts) is not intended to be, nor does it constitute, investment advice or recommendations. Please do your own research and ensure the data you collect matches the financials of the company you're trying to scrape on their respective investor relations websites.

## quickfs-scraper-valuation

This is the unofficial QuickFS financial information scraper and valuation scripts.
This project includes:

1.) a scraper for the 3 financial statements.\
2.) a json folder with the scraped financial statements.\
3.) a valuation script for each of the 3 financial statements.

### How to scrape financials

1.) create a .env file with your LOGIN and PASSWORD for quickfs.\
2.) enter your stocks into stocks.json as an array. ensure the tickers exist on quickfs.net.\
3.) run "node balance_sheet.js && node cash_flow_statement.js && node income_statement.js".\
(Doesn't work when setting 'start: "node balance_sheet.js && node cash_flow_statement.js && node income_statement.js"' npm run start in the package.json. Not sure why...).

### Valuation script

1.) Select and run one of the valuation scripts, depending on which one you're using to value the company.\
2.) The valuation files will be in './json/valuation'.
