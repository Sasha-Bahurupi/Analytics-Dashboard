from fastapi import FastAPI, Query, Response
import csv
import io
import os
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from typing import Optional, List
from functools import lru_cache
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class LoginRequest(BaseModel):
    username: str
    password: str

app = FastAPI(title="Business Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def build_filter_query(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    conditions = []
    params = []
    
    if start_date:
        conditions.append("DATE(Order_Datetime) >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("DATE(Order_Datetime) <= ?")
        params.append(end_date)
    if outlet:
        conditions.append("Outlet_Name = ?")
        params.append(outlet)
    if category:
        conditions.append("[Group] = ?")
        params.append(category)
    if status:
        conditions.append("Order_Type = ?")
        params.append(status)
        
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    return where_clause, params

@app.post("/api/login")
def login(request: LoginRequest):
    admin_password = os.getenv("ADMIN_PASSWORD")
    if not admin_password:
        return Response(content="Server configuration error: ADMIN_PASSWORD not set", status_code=500)
        
    if request.username == "admin" and request.password == admin_password:
        return {"token": "mock-jwt-token-7382947239"}
    return Response(content="Invalid credentials", status_code=401)

@app.get("/api/summary")
@lru_cache(maxsize=128)
def get_summary(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    query = f"""
        SELECT 
            COUNT(*) as total_records,
            COALESCE(SUM(Revenue), 0) as total_revenue,
            COUNT(DISTINCT BillNo) as total_orders,
            COUNT(DISTINCT Outlet_Name) as total_outlets
        FROM sales
        WHERE {where_clause}
    """
    
    cursor.execute(query, params)
    row = cursor.fetchone()
    
    total_orders = row["total_orders"]
    total_revenue = row["total_revenue"]
    avg_order = total_revenue / total_orders if total_orders > 0 else 0
    
    conn.close()
    return {
        "total_records": row["total_records"],
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "avg_order": avg_order,
        "total_outlets": row["total_outlets"]
    }

@app.get("/api/revenue-by-category")
@lru_cache(maxsize=128)
def get_revenue_by_category(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, None, status)
    
    query = f"""
        SELECT [Group] as category, SUM(Revenue) as revenue
        FROM sales
        WHERE {where_clause} AND [Group] IS NOT NULL
        GROUP BY [Group]
        ORDER BY revenue DESC
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [{"category": r["category"], "revenue": r["revenue"]} for r in rows]

@app.get("/api/revenue-over-time")
@lru_cache(maxsize=128)
def get_revenue_over_time(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    query = f"""
        SELECT DATE(Order_Datetime) as date, SUM(Revenue) as revenue
        FROM sales
        WHERE {where_clause} AND Order_Datetime IS NOT NULL
        GROUP BY DATE(Order_Datetime)
        ORDER BY date ASC
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [{"date": r["date"], "revenue": r["revenue"]} for r in rows]

@app.get("/api/payment-methods")
@lru_cache(maxsize=128)
def get_payment_methods(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    query = f"""
        SELECT Settlement as method, COUNT(DISTINCT BillNo) as total_orders
        FROM sales
        WHERE {where_clause} AND Settlement IS NOT NULL
        GROUP BY Settlement
        ORDER BY total_orders DESC
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [{"method": r["method"], "total_orders": r["total_orders"]} for r in rows]

@app.get("/api/heatmap")
@lru_cache(maxsize=128)
def get_heatmap(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    query = f"""
        SELECT 
            DATE(Order_Datetime) as specific_date, 
            strftime('%H', Order_Datetime) as hour_of_day, 
            COUNT(DISTINCT BillNo) as total_orders
        FROM sales
        WHERE {where_clause} AND Order_Datetime IS NOT NULL
        GROUP BY specific_date, hour_of_day
        ORDER BY specific_date ASC
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [{"date": r["specific_date"], "hour": r["hour_of_day"], "total_orders": r["total_orders"]} for r in rows]

@app.get("/api/filters")
@lru_cache(maxsize=1)
def get_filters():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT DISTINCT Outlet_Name FROM sales WHERE Outlet_Name IS NOT NULL ORDER BY Outlet_Name")
    outlets = [r["Outlet_Name"] for r in cursor.fetchall()]
    
    cursor.execute("SELECT DISTINCT [Group] FROM sales WHERE [Group] IS NOT NULL ORDER BY [Group]")
    categories = [r["Group"] for r in cursor.fetchall()]
    
    cursor.execute("SELECT DISTINCT Order_Type FROM sales WHERE Order_Type IS NOT NULL ORDER BY Order_Type")
    statuses = [r["Order_Type"] for r in cursor.fetchall()]
    
    cursor.execute("SELECT MIN(DATE(Order_Datetime)) as min_date, MAX(DATE(Order_Datetime)) as max_date FROM sales")
    date_row = cursor.fetchone()
    
    conn.close()
    
    return {
        "outlets": outlets,
        "categories": categories,
        "statuses": statuses,
        "min_date": date_row["min_date"],
        "max_date": date_row["max_date"]
    }

@app.get("/api/orders")
@lru_cache(maxsize=128)
def get_orders(
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    outlet: Optional[str] = None, 
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    offset = (page - 1) * limit
    
    query = f"""
        SELECT BillNo, Outlet_Name, Brand, Order_Datetime, [Group] as category, Item, Price, Quantity, Revenue, Order_Type, Settlement
        FROM sales
        WHERE {where_clause}
        ORDER BY Order_Datetime DESC
        LIMIT ? OFFSET ?
    """
    
    cursor.execute(query, params + [limit, offset])
    rows = cursor.fetchall()
    
    count_query = f"SELECT COUNT(*) as total FROM sales WHERE {where_clause}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()["total"]
    
    conn.close()
    
    return {
        "data": [dict(r) for r in rows],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit
    }

@app.get("/api/top-sellers")
@lru_cache(maxsize=128)
def get_top_sellers(start_date: Optional[str] = None, end_date: Optional[str] = None, outlet: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    query = f"""
        SELECT Item as item, SUM(Quantity) as total_qty, SUM(Revenue) as total_revenue
        FROM sales
        WHERE {where_clause} AND Item IS NOT NULL
        GROUP BY Item
        ORDER BY total_qty DESC
        LIMIT 5
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [{"item": r["item"], "total_qty": r["total_qty"], "total_revenue": r["total_revenue"]} for r in rows]

@app.get("/api/export")
def export_data(
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    outlet: Optional[str] = None, 
    category: Optional[str] = None,
    status: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    where_clause, params = build_filter_query(start_date, end_date, outlet, category, status)
    
    query = f"""
        SELECT BillNo, Outlet_Name, Brand, Order_Datetime, [Group] as category, Item, Price, Quantity, Revenue, Order_Type, Settlement
        FROM sales
        WHERE {where_clause}
        ORDER BY Order_Datetime DESC
    """
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    if rows:
        writer.writerow(rows[0].keys())
        for row in rows:
            writer.writerow(row)
    else:
        writer.writerow(["BillNo", "Outlet_Name", "Brand", "Order_Datetime", "category", "Item", "Price", "Quantity", "Revenue", "Order_Type", "Settlement"])
        
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=dashboard_export.csv"
    return response
