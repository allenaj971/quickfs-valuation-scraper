# Json-to-csv converter if you needusing pandas because pandas is 🔥🔥🔥
import pandas

# https://stackoverflow.com/questions/1871524/how-can-i-convert-json-to-csv
cfs = pandas.read_json('./cash_flow_statement.json')
bs = pandas.read_json('./balance_sheet.json')
income_s = pandas.read_json('./income_statement.json')

cfs.to_csv('./cash_flow_statement.csv')
bs.to_csv('./balance_sheet.csv')
income_s.to_csv('./income_statement.csv')