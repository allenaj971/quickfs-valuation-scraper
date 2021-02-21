# Json-to-csv converter if you need using pandas because pandas is 🔥🔥🔥
import pandas

# https://stackoverflow.com/questions/1871524/how-can-i-convert-json-to-csv
cfs = pandas.read_json('./scraped_financials/cash_flow_statement.json')
bs = pandas.read_json('./scraped_financials/balance_sheet.json')
income_s = pandas.read_json('./scraped_financials/income_statement.json')

cfs.to_csv('./scraped_financials/cash_flow_statement.csv')
bs.to_csv('./scraped_financials/balance_sheet.csv')
income_s.to_csv('./scraped_financials/income_statement.csv')