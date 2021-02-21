# quickfs-scraper-valuation

This is the unofficial QuickFS financial information scraper and valuation scripts.
This project includes: \

1.) a scraper for the 3 financial statements.\
2.) a json folder with the scraped financial statements.\
3.) a valuation script for each of the 3 financial statements.

## How to scrape financials

1.) create a .env file with your LOGIN and PASSWORD for quickfs.\
2.) enter your stocks into stocks.json as an array. ensure the tickers exist on quickfs.\
3.) run "node balance_sheet.js && node cash_flow_statement.js && node income_statement.js".\
(Doesn't work when setting 'start: "node balance_sheet.js && node cash_flow_statement.js && node income_statement.js"' npm run start).

## Valuation script

1.) Select and run one of the valuation scripts, depending on which one you're using to value the company.\
2.) The valuation files will be in './json/valuation'.
