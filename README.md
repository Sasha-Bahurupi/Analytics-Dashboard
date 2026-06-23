# Business Analytics Dashboard

A full-stack analytics dashboard built with FastAPI (Python) and React (Vite).

## Architecture

- **Backend**: Python FastAPI serving data from a SQLite database (`analytics.db`).
- **Frontend**: React (Vite) dashboard displaying KPIs, Charts (recharts), and a data table.
- **Data Pipeline**: A Python script (`backend/ingest.py`) reads the raw Excel dataset, processes it using `pandas`, and loads it into the SQLite database with appropriate indexing for fast queries.

## Key Features & Optimizations

- **High-Performance Caching**: 
  - **Frontend**: Utilizes `@tanstack/react-query` to cache API responses in the browser memory, enabling instant, zero-loading-spinner interactions when rapidly switching filters.
  - **Backend**: Implements Python's built-in `@lru_cache` decorator on all FastAPI endpoints. The server caches database scan results directly in RAM, bypassing the SQLite database entirely for repeated requests.
- **Mock Authentication Flow**: Fully functional Login and Logout system using React Context API for protected routing and a mock JWT-style token exchange on the backend, secured via environment variables.
- **Responsive Retro Design**: Features a highly polished, aesthetic interface inspired by California Burrito's brand with custom charts and responsive flex layouts.

## Setup Instructions

### 1. Data Ingestion
1. Place your Excel file (e.g., `data.xlsx`) into the `data/` directory at the root of the project.
2. Navigate to the backend directory: `cd backend`
3. Install Python dependencies: `pip install -r requirements.txt`
4. Run the ingestion script: `python ingest.py`
   *This will create the `analytics.db` SQLite database.*

### 2. Running the Backend (Local)
1. In the `backend/` directory, create a `.env` file and set the admin password:
   ```
   ADMIN_PASSWORD=[PASSWORD]
   ```
2. Start the FastAPI server:
   `uvicorn main:app --reload`
3. The API will be available at `http://localhost:8000`. You can view the docs at `http://localhost:8000/docs`.

### 3. Running the Frontend (Local)
1. Open a new terminal and navigate to the frontend directory: `cd frontend`
2. Create a `.env` file and set the following variables:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_ADMIN_PASSWORD=[PASSWORD]
   ```
3. Install Node dependencies: `npm install`
4. Start the Vite development server: `npm run dev`
4. Access the dashboard at the URL provided (usually `http://localhost:5173`).

### Full Stack Vercel Deployment (Monorepo)
Since we are using SQLite and React, this entire project can be deployed natively on Vercel as a single application using Vercel's Python Serverless Functions.

1. Push this repository to GitHub and connect it to Vercel.
2. Import the project and configure the following settings in the Vercel Dashboard:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `.` (The project root, do not set this to `frontend`)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`
3. Under **"Environment Variables"**, add the following (making sure to use your actual secure password):
   - `ADMIN_PASSWORD` = `[YOUR_PASSWORD]`
   - `VITE_ADMIN_PASSWORD` = `[YOUR_PASSWORD]`
   - `VITE_API_URL` = (Leave this blank or delete it entirely! The frontend will automatically call `/api/...` on the same domain)
4. Click **Deploy**. Vercel will automatically build the React app and deploy the Python backend inside the `/api` route.
