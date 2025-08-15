from typing import Union
from contextlib import asynccontextmanager
from fastapi import FastAPI
from psycopg2 import sql
import psycopg2
import psycopg2.extras
import dotenv
import os

companies = ["META", "MSFT", "AMZN", "NVDA", "GOOG", "AAPL", "TSLA", "INTC", "UNH", "MSI"]
market_data = {}

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    dotenv.load_dotenv()
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        for t in companies:
            q = sql.SQL("SELECT * FROM {table}").format(table=sql.Identifier(t))
            cur.execute(q)
            market_data[t] = cur.fetchall()
    except:
        print("Unable to load data!")
    finally:
        conn.close()
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"Companies": companies}

@app.get("/{company_data}")
def read_item(company_data: str, records: str = "10"):
    if records.isdigit():
        data = market_data[company_data][0:int(records)]
    elif records.lower() == "max":
        data = market_data[company_data]
    else:
        data = market_data[company_data][0:10]
    return {"data": data}