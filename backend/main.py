from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from psycopg2 import sql
import yfinance as yf
import psycopg2
import psycopg2.extras
import dotenv
import os

companies = ["META", "MSFT", "AMZN", "NVDA", "GOOG", "AAPL", "TSLA", "INTC", "UNH", "MSI"]
conn = None
cur = None
market_data = {}


dotenv.load_dotenv() 

API_KEY = os.getenv("API_KEY")
API_KEY_NAME = "access_token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    else:
        raise HTTPException(status_code=403, detail="Invalid or missing API Key")

def get_connection():
    try:
        return psycopg2.connect(
            database=os.getenv("DATABASE"),
            user=os.getenv("DBUSER"),
            password=os.getenv("DBPSWD"),
            host=os.getenv("HOST"),
            port=os.getenv("PORT")
        )
    except Exception as e:
        print(e)
        return False

def create_tables():
    query = sql.SQL("""
        CREATE TABLE IF NOT EXISTS {table} (
            MDate date PRIMARY KEY,
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

def get_data():
    query = sql.SQL("""
        INSERT INTO {table} (MDate, Open, Close, High, Low, Volume) VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (MDate) DO NOTHING
    """)

    tickers = yf.Tickers(companies)
    data = tickers.history(period="2Y")
    try:
        for t in companies:
            c_data = data.xs(t, axis=1, level=1).reset_index()
            q = query.format(table=sql.Identifier(t))
            for r in c_data.itertuples(index=False):
                cur.execute(q, (r.Date.date(), r.Open, r.Close, r.High, r.Low, r.Volume))
    except Exception as e:
        print("Error in get_data:", e)
        return False
    finally:
        conn.commit()
        return True

def update_data():
    try:
        for t in companies:
            q = sql.SQL("SELECT * FROM {table} ORDER BY mdate DESC").format(table=sql.Identifier(t))
            cur.execute(q)
            market_data[t] = cur.fetchall()
    except Exception as e:
        print("Error in update_data:", e)
        print("Unable to load data!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global conn,cur
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    create_tables()
    get_data()
    update_data()
    yield
    conn.close()

app = FastAPI(lifespan=lifespan, openapi_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root(api_key: str = Depends(get_api_key)):
    return {"Companies": companies}

@app.get("/company/{company_data}")
def read_item(company_data: str, records: str = "10", api_key: str = Depends(get_api_key)):
    if company_data not in companies:
        return {"status": "failure"}

    if int(records) <= 0:
        return {"status": "failure"}

    if records.isdigit():
        data = market_data[company_data][0:int(records)]
    elif records.lower() == "max":
        data = market_data[company_data]
    else:
        data = market_data[company_data][0:10]
    return {"status": "success", "data": data}

@app.get("/refresh_data")
def refresh_mdata(api_key: str = Depends(get_api_key)):
    res = get_data()
    if res:
        update_data()
        return {"status": "success"}
    else:
        return {"status": "failure"}