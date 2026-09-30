"""Generate mock trading execution data for Dashboard Lab lesson 1.
Run: python generate_data.py  ->  writes executions.csv
"""
import numpy as np, pandas as pd

rng = np.random.default_rng(2026)
days = pd.bdate_range(end=pd.Timestamp.today().normalize(), periods=120)
venues = {  # latency ms, fill rate, share of flow
    "NYSE": (4.2, .94, .30), "NASDAQ": (3.8, .92, .28),
    "ARCA": (5.1, .89, .16), "BATS": (3.1, .87, .14),
    "Dark Pool": (8.6, .61, .12)}

rows = []
for i, d in enumerate(days):
    trend = 1 + i * 0.002
    weekday = {0: .9, 4: .85}.get(d.weekday(), 1)
    for v, (lat, fill, share) in venues.items():
        orders = int(4000 * share * trend * weekday * rng.uniform(.8, 1.2))
        rows.append({
            "date": d.date(), "venue": v, "orders": orders,
            "fill_rate": round(min(.995, fill + rng.normal(0, .02)), 4),
            "latency_ms": round(lat * rng.uniform(.85, 1.35), 2),
            "notional_musd": round(orders * rng.uniform(.018, .028), 2)})

pd.DataFrame(rows).to_csv("executions.csv", index=False)
print(f"Wrote {len(rows)} rows to executions.csv")
