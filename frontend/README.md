# Stock Market Dashboard Frontend

This is the frontend for the Stock Market Dashboard project, built with
**React**, **Chart.js**, and **Material-UI (MUI)**.\
It connects to the FastAPI backend to display stock market data in a
clean, interactive dashboard.

---

## Features

-   Vertical tab navigation for different companies
-   Line charts displaying stock closing prices over time
-   UI using Material-UI
-   Secure API calls with API key authentication

---

## Setup Instructions

### Install dependencies

```bash
npm install
```

### Set environment variables

Create a `.env` file from the `example.env` in the root of the frontend project:

```env
VITE_BACKEND_URI=http://localhost:5000
VITE_API_KEY=your_api_key_here
```

### Run the development server

```bash
npm run dev
```

Your app will be available at <http://localhost:5173>.

---

## Authentication

All API calls include the `access_token` header automatically using
Axios.\
Ensure your `.env` file contains the correct `VITE_API_KEY` matching the
backend.

---

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.
