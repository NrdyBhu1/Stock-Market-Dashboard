import yfinance as yf
import dotenv
import psycopg2
import os
from psycopg2 import sql

companies = ["META", "MSFT", "AMZN", "NVDA", "GOOG", "AAPL", "TSLA", "INTC", "UNH", "MSI"]
conn = None
cur = None

def create_tables():
	query = sql.SQL("""
		CREATE TABLE IF NOT EXISTS {table} (
			MDate date,
			Open double precision,
			Close double precision,
			High double precision,
			Low double precision,
			Volume integer
		)
	""")

	for t in companies:
		q = query.format(table=sql.Identifier(t))
		cur.execute(q)
	conn.commit()

def get_connection():
    try:
        return psycopg2.connect(
            database=os.environ["DATABASE"],
            user=os.environ["DBUSER"],
            password=os.environ["DBPSWD"],
            host=os.environ["HOST"],
            port=os.environ["PORT"]
        )
    except Exception as e:
        print(e)
        return False

"""
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 24 entries, 0 to 23
Data columns (total 8 columns):
 #   Column        Non-Null Count  Dtype
---  ------        --------------  -----
 0   Date          24 non-null     datetime64[ns]
 1   Close         24 non-null     float64
 2   Dividends     24 non-null     float64
 3   High          24 non-null     float64
 4   Low           24 non-null     float64
 5   Open          24 non-null     float64
 6   Stock Splits  24 non-null     float64
 7   Volume        24 non-null     int64
dtypes: datetime64[ns](1), float64(6), int64(1)
memory usage: 1.6 KB
"""

def main():
	query = sql.SQL("""
		INSERT INTO {table} (MDate, Open, Close, High, Low, Volume) VALUES (%s, %s, %s, %s, %s, %s)
	""")

	tickers = yf.Tickers(companies)
	data = tickers.history(period="2Y")
	for t in companies:
		c_data = data.xs(t, axis=1, level=1).reset_index()
		q = query.format(table=sql.Identifier(t))
		for r in c_data.itertuples(index=False):
			cur.execute(q, (r.Date.date(), r.Open, r.Close, r.High, r.Low, r.Volume))
	conn.commit()


if __name__ == "__main__":
	dotenv.load_dotenv()
	conn = get_connection()
	cur = conn.cursor()
	create_tables()
	main()
	conn.close()