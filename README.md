# quickfs-scraper-valuation

This is the unofficial QuickFS financial information scraper and valuation scripts.
This project includes:\n

1.) a scraper for the 3 financial statements\n
2.) a json folder with the scraped financial statements\n
3.) a valuation script for each of the 3 financial statements\n

## How to scrape financials

1.) create a .env file with your LOGIN and PASSWORD for quickfs.\n
2.) enter your stocks into stocks.json as an array. ensure the tickers exist on quickfs.\n
3.) run "node balance_sheet.js && node cash_flow_statement.js && node income_statement.js".\n
(Doesn't work when setting 'start: "node balance_sheet.js && node cash_flow_statement.js && node income_statement.js"' npm run start)\n

## Valuation script

1.) Select and run one of the valuation scripts, depending on which one you're using to value the company.\n
2.) The valuation files will be in './json/valuation'.\n
