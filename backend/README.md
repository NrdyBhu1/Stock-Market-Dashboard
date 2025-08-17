# Stock Market Backend (FastAPI)

This is a FastAPI backend that provides stock market data for different companies.  
It includes API key authentication for secure access.

---

## Features
- REST API built with **FastAPI**
- API Key authentication (via custom header)
- Preloaded market data for multiple companies
- Endpoints to:
  - Fetch list of available companies
  - Retrieve stock data for a given company
  - Refresh market data from source

---

## Requirements
- Python 3.9+
- uv (recommended)

Install dependencies:

```bash
pip install .
```

or
```bash
uv install .
```

---

## Environment Variables
Create a `.env` file from the `example.env` in the project root:

```env
API_KEY=your_secret_api_key
BACKEND_HOST=localhost
BACKEND_PORT=5000
```

---

## Running the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

Now your backend will be live at:

```
http://localhost:5000
```

---

## Authentication

All endpoints require an API key in the request headers.

Example header:

```http
access_token: your_secret_api_key
```

---

## API Endpoints

### **1. Root – Get Companies**
```http
GET /
```
**Response:**
```json
{
  "Companies": ["AAPL", "MSFT", "GOOG"]
}
```

---

### **2. Get Company Data**
```http
GET /company/{company_data}?records=10
```
**Query Parameters:**
- `records` = number of records (default: 10, can also use `"max"`)

**Response:**
```json
{
  "status": "success",
  "data": [
    {"mdate": "2025-08-01", "open": 100, "close": 105, "high": 110, "low": 98}
  ]
}
```

If the company is invalid or params are wrong:
```json
{
  "status": "failure"
}
```

---

### **3. Refresh Market Data**
```http
GET /refresh_data
```
**Response:**
```json
{ "status": "success" }
```

---

## Testing with curl

```bash
curl -H "access_token: your_secret_api_key" http://localhost:5000/
```

```bash
curl -H "access_token: your_secret_api_key" "http://localhost:5000/company/MSFT?records=5"
```