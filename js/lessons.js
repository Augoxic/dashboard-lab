// Lesson content. Add a lesson by adding an object to LESSONS.
const TRACKS = [
  { id: "found", name: "Foundations", desc: "Fake data, spreadsheets and a first real database." },
  { id: "eng", name: "Data engineering", desc: "How data gets from source systems into something you can report on." },
  { id: "pbi", name: "Power BI core", desc: "Modeling, Power Query, DAX and report design. The heart of PL-300." },
  { id: "svc", name: "Power BI Service", desc: "Publishing, security, refresh and gateways once reports leave your laptop." },
  { id: "plat", name: "Power Platform and AI", desc: "Automation, simple apps, and where AI fits in BI work." },
  { id: "ship", name: "Certify and ship", desc: "Pass the exam and put the work where people can see it." }
];

const LESSONS = [
{
  id: "mock-data", track: "found", title: "Mock data with code", level: "Beginner", time: "2 to 3 hours",
  tools: ["Browser", "VS Code", "Python (optional)"], lab: "dashboard",
  summary: "Generate realistic, repeatable fake data so you can build and share dashboards without touching real data.",
  why: "You can't practice on production data at home, and you can't post it publicly. Good synthetic data lets you build, break and share dashboards freely, and it is also how teams demo a report before data access is approved.",
  outcomes: ["Generate reproducible fake data with a seed", "Choose the grain of a dataset before writing code", "Add trend, seasonality and noise so data looks real", "Chart the data and export it as CSV"],
  terms: [["Seed", "A starting number for a random generator. Same seed, same data, every run."], ["Grain", "What one row represents, for example one venue on one trading day."], ["Synthetic data", "Data generated to look like the real thing with no real records in it."], ["Tidy data", "One row per observation, one column per variable. Every tool in later lessons expects this shape."]],
  learn: [
    ["Decide the grain first", "Write down what one row means before you write code. Here it is one row per trading day per venue. Everything else (charts, pivots, SQL) is a grouping of that table."],
    ["Seed your randomness", "Use a seeded generator so bugs are reproducible. In JavaScript we use a tiny function called mulberry32; in Python use <code>numpy.random.default_rng(seed)</code>."],
    ["Add structure, not just noise", "Pure randomness looks fake. Build each value as base times trend times weekday effect times noise. Mondays and Fridays run lighter, volume grows slowly over time."],
    ["Give each category a personality", "Each venue gets its own typical latency and fill rate. A dark pool fills less often and slower than a lit exchange, so the charts tell a believable story."],
    ["Skip weekends and holidays", "Trading data with Saturday rows is an instant giveaway. Use business-day date ranges."],
    ["Build the same thing in Python", "Python with pandas is the more common way to generate data at work. This script writes a CSV you will reuse in the next lessons.", `import numpy as np, pandas as pd

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

pd.DataFrame(rows).to_csv("executions.csv", index=False)`]
  ],
  setup: [
    ["Install VS Code", "Free editor from code.visualstudio.com. Add the Python extension. GitHub Copilot works here too and is great at boilerplate like this."],
    ["Install Python 3", "From python.org. Tick 'Add to PATH' on Windows. Then run <code>pip install pandas numpy faker</code>."],
    ["Run the script", "Save the Python code as <code>generate_data.py</code> and run <code>python generate_data.py</code>. You should get <code>executions.csv</code> with 600 rows."],
    ["Use the live lab", "No install needed: the Interactive guide tab on this page generates the same kind of data in your browser."]
  ],
  apply: {
    scenario: "A new execution quality dashboard is requested, but access to production data will take weeks of approvals.",
    steps: [
      ["Mirror the real schema", "Get the column names and types from the source system documentation and generate fake values with the same shape. The dashboard will not need rework when the real feed arrives."],
      ["Build edge cases on purpose", "Add rows with zero fills, null latency, a venue with no activity and a half day. These become UAT test cases and show you how the report behaves before users find out."],
      ["Demo early", "Show stakeholders a working dashboard on mock data to confirm requirements. Changing a mock is cheap; changing a finished build is not."],
      ["Swap the source later", "When access arrives, point the dashboard at the real source and compare totals against a known report."]
    ]
  },
  quiz: [
    { q: "Why use a seeded random generator?", o: ["It is faster", "It produces the same data each run so bugs can be reproduced", "It makes data more random"], a: 1, why: "A seed makes 'random' output repeatable, which is what you need for debugging and for sharing a lesson others can rebuild." },
    { q: "What is the grain of our mock dataset?", o: ["One row per order", "One row per trading day per venue", "One row per month"], a: 1, why: "Each row is a single venue on a single trading day. Grain decides what questions the data can answer." },
    { q: "Which change makes fake data look most realistic?", o: ["More decimal places", "Adding trend and weekday patterns", "Using bigger numbers"], a: 1, why: "Real data has structure: growth, weekly rhythm, category differences. Noise alone looks like static." }
  ],
  resources: [["pandas getting started", "https://pandas.pydata.org/docs/getting_started/index.html"], ["Chart.js docs", "https://www.chartjs.org/docs/latest/"]]
},
{
  id: "excel-csv", track: "found", title: "Excel and CSV", level: "Beginner", time: "3 to 4 hours",
  tools: ["Excel or Google Sheets"], lab: "csv",
  summary: "Load, clean and summarize the mock data in Excel, then send it back as a clean CSV.",
  why: "Most business reporting still starts in a spreadsheet. Knowing how to import CSVs safely, build pivots and use Power Query in Excel is the bridge to Power BI, which uses the same Power Query engine.",
  outcomes: ["Import a CSV without Excel mangling dates or IDs", "Use Tables and structured references", "Build PivotTables and weighted averages", "Export a clean CSV UTF-8 file"],
  terms: [["CSV", "Comma separated values. Plain text, no formatting, no formulas."], ["Excel Table", "A named, auto-expanding range (Ctrl+T). Formulas refer to columns by name."], ["PivotTable", "Drag-and-drop summary of a table: group, sum, average, filter."], ["Weighted average", "An average where each value counts in proportion to a weight, such as order count."]],
  learn: [
    ["Import, don't double-click", "Use Data, From Text/CSV. It opens Power Query so you control column types. Double-clicking lets Excel guess, which turns IDs like 00123 into 123 and some codes into dates."],
    ["Turn the range into a Table", "Click inside the data and press Ctrl+T. Name it <code>Executions</code>. New rows are included in formulas and pivots automatically."],
    ["Add calculated columns", "In a new column type <code>=[@orders]*[@fill_rate]</code> and name it filled_orders. The formula fills the whole column."],
    ["Build a PivotTable", "Insert, PivotTable from the Table. Rows: venue. Values: sum of orders, sum of filled_orders, sum of notional. Add date to Columns and group by month."],
    ["Use weighted averages", "Averaging latency per row treats a quiet day like a busy one. Weight by orders instead.", `=SUMPRODUCT(Executions[latency_ms], Executions[orders]) / SUM(Executions[orders])`],
    ["Clean with Power Query", "Data, Get Data opens the same editor Power BI uses. Remove duplicates, trim text, fix types, then Close and Load. Refreshing reapplies every step."],
    ["Save as CSV UTF-8", "File, Save As, CSV UTF-8. Then drop the file into the lab on this page to check it parses."]
  ],
  setup: [
    ["Get a spreadsheet tool", "Excel for Microsoft 365 is best (Power Query included). Free options: Excel for the web or Google Sheets, both fine for pivots and formulas."],
    ["Get the data", "Use executions.csv from lesson 1, or use the Copy all rows button in the lesson 1 lab and paste into a sheet."],
    ["Make a messy copy", "Duplicate a few rows, blank some cells and add spaces around venue names. Cleaning your own mess is the fastest way to learn Power Query."]
  ],
  apply: {
    scenario: "Your team rebuilds a weekly spreadsheet by hand from several exports, and nobody fully knows its logic.",
    steps: [
      ["Document the logic", "Write down every source, filter and formula. This is core BA work and becomes the requirements for any automated version."],
      ["Rebuild with Tables and Power Query", "Replace copy-paste steps with a query per source. A weekly task becomes one Refresh All."],
      ["Reconcile", "Run old and new side by side for two cycles and explain every difference before switching."],
      ["Promote to Power BI", "When the logic is stable, the same Power Query steps move into Power BI almost unchanged."]
    ]
  },
  quiz: [
    { q: "Why weight average latency by orders?", o: ["It is the Excel default", "So busy days count more than quiet days", "To make the number smaller"], a: 1, why: "A plain average treats a day with 10 orders like a day with 10,000. The weighted version reflects what most orders actually experienced." },
    { q: "Why import CSVs through Data, From Text/CSV?", o: ["It is the only way", "You control column types, so IDs and dates are not mangled", "It compresses the file"], a: 1, why: "It opens Power Query, where you set types explicitly instead of letting Excel guess." },
    { q: "What does Ctrl+T give you?", o: ["A chart", "A named Table that expands with new rows", "A pivot"], a: 1, why: "Tables give structured references like Executions[orders] and grow automatically." }
  ],
  resources: [["Power Query in Excel", "https://support.microsoft.com/en-us/office/about-power-query-in-excel-7104fbee-9e62-4cb9-a02e-5bfb1a6c536a"]]
},
{
  id: "databases", track: "found", title: "Build a small database", level: "Beginner", time: "4 to 6 hours",
  tools: ["DB Browser for SQLite", "Supabase", "SQL"],
  summary: "Load the mock data into a free local database, write the SQL behind each chart, then move it to hosted Postgres.",
  why: "Real dashboards read from databases, not files. Writing the SQL yourself means you can validate any number a report shows, which is exactly what a technical BA gets asked to do.",
  outcomes: ["Create tables with primary and foreign keys", "Import CSV into SQLite and Postgres", "Write GROUP BY and JOIN queries for dashboard metrics", "Create views that dashboards can read"],
  terms: [["Primary key", "A column that uniquely identifies each row."], ["Foreign key", "A column pointing to a primary key in another table."], ["View", "A saved query that behaves like a table."], ["OLTP", "Transaction systems (like an order management system) tuned for many small writes, not reporting."]],
  learn: [
    ["Understand tables and keys", "Split data into things (venues) and events (executions). Venues get a <code>venue_id</code> primary key; executions store it as a foreign key."],
    ["Create a SQLite database", "In DB Browser for SQLite: New Database, then File, Import, Table from CSV. SQLite is one file on disk, no server."],
    ["Write the dashboard queries", "Every chart is a query. This one feeds the fill-rate-by-venue bar chart.", `SELECT venue,
       SUM(orders)                              AS orders,
       SUM(orders * fill_rate) / SUM(orders)    AS fill_rate,
       SUM(latency_ms * orders) / SUM(orders)   AS avg_latency_ms
FROM executions
WHERE date >= '2026-07-01'
GROUP BY venue
ORDER BY orders DESC;`],
    ["Normalize and join", "Move venue details (name, type, region) into a <code>venues</code> table and JOIN it back. This is a preview of star schemas."],
    ["Save queries as views", "<code>CREATE VIEW v_venue_daily AS ...</code>. Dashboards read views, so logic lives in one place."],
    ["Move to hosted Postgres", "Create a free Supabase project, import the CSV in the table editor and run the same SQL. You now have a cloud database with a connection string."],
    ["Connect Power BI", "Get Data, PostgreSQL database, paste host and database name. For SQLite you need an ODBC driver, which is why hosted databases are easier for BI tools."]
  ],
  setup: [
    ["DB Browser for SQLite", "Free, Windows and Mac, sqlitebrowser.org."],
    ["Supabase free tier", "Sign up with GitHub at supabase.com. Free projects pause after inactivity, which is fine for learning."],
    ["Optional: SQL Server Developer Edition", "Free full-featured SQL Server for development. Worth it because much of the finance world runs on SQL Server. Use VS Code with the mssql extension to query it."]
  ],
  apply: {
    scenario: "Users say the dashboard's fill rate does not match the trading system's screen.",
    steps: [
      ["Get read-only access to a reporting copy", "Never query the live OLTP system for reporting. Ask for a replica or reporting database."],
      ["Recreate the number in SQL", "Write the query yourself with the same filters and date range. Differences usually come from filters, time zones or weighted vs simple averages."],
      ["Document the definition", "Once agreed, write the metric definition and the SQL into the requirements so the next person does not repeat this."],
      ["Request a view", "Ask the data team to publish the agreed logic as a view so every report uses the same definition."]
    ]
  },
  quiz: [
    { q: "Why should dashboards not query the live trading system directly?", o: ["SQL does not work there", "Heavy reporting queries can slow the system that executes trades", "It is too small"], a: 1, why: "OLTP systems are tuned for fast writes. Reporting belongs on a replica, warehouse or reporting database." },
    { q: "What does a view give you?", o: ["A backup", "A saved query that many reports can share", "Faster inserts"], a: 1, why: "One definition, many consumers. Change the view and every report picks it up." },
    { q: "Which clause produces one row per venue?", o: ["ORDER BY venue", "GROUP BY venue", "WHERE venue"], a: 1, why: "GROUP BY collapses rows into one per group, and aggregate functions summarize each group." }
  ],
  resources: [["SQLBolt interactive SQL", "https://sqlbolt.com/"], ["Supabase docs", "https://supabase.com/docs"]]
},
{
  id: "warehouse-etl", track: "eng", title: "Data warehouse and ETL/ELT", level: "Intermediate", time: "5 to 6 hours",
  tools: ["SQL", "Postgres or SQL Server", "dbt Core (optional)"],
  summary: "How source data is extracted, cleaned, historized and shaped into a warehouse that reports can trust.",
  why: "Behind every reliable dashboard is a pipeline. Understanding layers, loads and history lets you ask the right questions when numbers look wrong, and write requirements data engineers can build from.",
  outcomes: ["Explain OLTP vs OLAP, warehouse vs lake vs lakehouse", "Compare ETL and ELT", "Design raw, cleaned and reporting layers", "Handle history with slowly changing dimensions", "Build an incremental load with a watermark"],
  terms: [["ETL", "Extract, transform, then load. Transform happens before the warehouse."], ["ELT", "Extract, load raw, then transform inside the warehouse with SQL. Common with cloud warehouses."], ["Medallion", "Bronze (raw), silver (cleaned), gold (reporting-ready) layers."], ["SCD Type 2", "Keep history by adding a new row with valid_from and valid_to when an attribute changes."], ["Watermark", "The last loaded timestamp, used to load only new rows."]],
  learn: [
    ["OLTP vs OLAP", "OLTP systems run the business (order entry). OLAP systems answer questions across history. A warehouse is OLAP: wide scans, aggregates, history."],
    ["Warehouse, lake, lakehouse", "A warehouse stores structured tables with SQL. A lake stores files of any kind cheaply. A lakehouse puts warehouse-style tables on lake storage (Delta or Parquet), which is the model Microsoft Fabric uses."],
    ["ETL vs ELT", "ETL transforms in a separate tool before loading. ELT loads raw first and transforms with SQL in the warehouse, so raw data is always available to reprocess."],
    ["Build layers", "Create schemas <code>bronze</code>, <code>silver</code>, <code>gold</code> in your database. Load the CSV untouched into bronze, clean types and duplicates into silver, and build star-schema tables in gold."],
    ["Load incrementally", "Only move new data each run by tracking a watermark.", `INSERT INTO silver.executions
SELECT DISTINCT *
FROM bronze.executions_raw
WHERE load_ts > (
  SELECT COALESCE(MAX(load_ts), '1900-01-01') FROM silver.executions
);`],
    ["Keep history with SCD Type 2", "If a trader moves desks, Type 1 overwrites (history rewritten). Type 2 closes the old row and inserts a new one, so last quarter's report still shows the old desk."],
    ["Add data quality checks", "Row counts match source, no null keys, no duplicate keys, fill_rate between 0 and 1. Fail the load loudly rather than publish bad numbers."]
  ],
  setup: [
    ["Reuse your database", "Use the Postgres or SQL Server database from the last lesson and create the three schemas."],
    ["Optional: dbt Core", "Free, open source, <code>pip install dbt-postgres</code>. It turns SQL SELECT files into tables and views with tests and lineage docs."],
    ["Simulate new data", "Rerun the Python generator with a later end date and load only new rows to practice incremental logic."]
  ],
  apply: {
    scenario: "You are writing requirements for a new execution analytics mart.",
    steps: [
      ["Draw the lineage", "Map source systems to staging to warehouse to report. Name owners for each hop. Most number disputes trace back to a hop nobody owns."],
      ["State the grain and keys", "One row per order, per fill, or per venue per day? Write it down with the business key."],
      ["Call out history needs", "Which attributes must be point-in-time (desk, client tier, venue classification)? Those need SCD Type 2."],
      ["Write data quality rules as acceptance criteria", "For example: daily order count within 1% of the OMS end-of-day total."]
    ]
  },
  quiz: [
    { q: "In ELT, where does the transformation happen?", o: ["In a separate ETL server before loading", "Inside the warehouse after loading raw data", "In the dashboard"], a: 1, why: "ELT lands raw data first, then transforms with the warehouse's compute." },
    { q: "A trader changes desks. Last quarter's report must still show the old desk. Which approach?", o: ["SCD Type 1", "SCD Type 2", "Delete and reload"], a: 1, why: "Type 2 keeps a row per version with validity dates." },
    { q: "What is a watermark for?", o: ["Branding", "Loading only rows newer than the last load", "Encrypting data"], a: 1, why: "It records how far the last load got so the next run picks up from there." }
  ],
  resources: [["dbt Core docs", "https://docs.getdbt.com/"], ["Kimball techniques", "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/"]]
},
{
  id: "azure-data", track: "eng", title: "Azure data services", level: "Intermediate", time: "6 to 8 hours",
  tools: ["Azure SQL Database", "Azure Data Factory", "Microsoft Fabric"],
  summary: "A practical map of Azure SQL Database, Synapse, Data Factory, Data Lake and Fabric, with a small hands-on build.",
  why: "Many BI job descriptions list Azure or an equivalent cloud. You do not need to be a data engineer, but you should know what each service does, how Power BI connects to it, and what it costs.",
  outcomes: ["Explain what each core Azure data service is for", "Create and load an Azure SQL Database", "Copy data with a pipeline", "Choose Import vs DirectQuery", "Keep a personal cloud account from running up a bill"],
  terms: [["Azure SQL Database", "Managed SQL Server in the cloud. No server patching."], ["Azure Synapse Analytics", "Analytics service with dedicated and serverless SQL pools plus pipelines."], ["Azure Data Factory", "Orchestration and copy service for moving data between systems."], ["ADLS Gen2", "Azure Data Lake Storage: cheap file storage with folders and permissions for analytics."], ["Microsoft Fabric", "SaaS platform bundling lakehouse, warehouse, pipelines and Power BI on one capacity. Where Microsoft is putting most new analytics investment."]],
  learn: [
    ["Learn the map", "Storage (ADLS Gen2), movement (Data Factory), compute and query (Azure SQL, Synapse, Fabric warehouse), reporting (Power BI). Equivalents elsewhere: AWS Redshift and Glue, Google BigQuery, Snowflake, Databricks."],
    ["Know Synapse vs Fabric", "Synapse is still used widely, but Microsoft is steering new projects toward Fabric. Learn the concepts once; they transfer."],
    ["Create an Azure SQL Database", "Use the free database offer if available on your subscription. Choose SQL authentication for learning and add your IP to the firewall."],
    ["Load and query", "Import executions.csv (VS Code mssql extension or the portal query editor) and rerun your SQL from the database lesson."],
    ["Build a copy pipeline", "In Data Factory (or a Fabric pipeline), copy a CSV from blob storage into the SQL table on a schedule. This is ETL in a UI."],
    ["Connect Power BI", "Get Data, Azure SQL Database. Import copies data into the model (fast, needs refresh). DirectQuery queries live (fresh, slower, puts load on the source)."],
    ["Control cost", "Everything lives in one resource group. Delete the resource group when finished and every resource inside goes with it."]
  ],
  setup: [
    ["Set a budget alert first", "In Cost Management, create a budget with an email alert at a low amount before creating anything else."],
    ["Create an Azure free account", "azure.microsoft.com/free. A card is required for identity verification. Free credit and some always-free services are included; check current terms."],
    ["Try Fabric", "Fabric offers a trial capacity with a work or school account. Check current trial length and eligibility on the Fabric site."]
  ],
  apply: {
    scenario: "A report needs intraday execution data, and someone suggests DirectQuery against the cloud warehouse.",
    steps: [
      ["Pin down freshness needs", "Does the desk need data every minute, or is hourly refresh enough? Hourly Import is usually faster and cheaper."],
      ["Check approved services", "Regulated firms approve specific cloud services and regions. Confirm what your platform team supports before designing."],
      ["Capture security requirements", "Private endpoints, Microsoft Entra ID authentication, encryption and data residency are requirements a BA must record up front."],
      ["Estimate load and cost", "DirectQuery sends a query per visual per user. Estimate concurrency with the platform team."]
    ]
  },
  quiz: [
    { q: "What is the first thing to set up on a personal Azure account?", o: ["A Synapse workspace", "A budget alert", "A virtual machine"], a: 1, why: "Cloud bills surprise people. Set the alert before creating resources." },
    { q: "Import vs DirectQuery: which queries the source live each time?", o: ["Import", "DirectQuery"], a: 1, why: "DirectQuery sends queries to the source at view time; Import stores a copy in the model." },
    { q: "Which service is mainly for moving and orchestrating data?", o: ["Azure Data Factory", "Azure SQL Database", "Power BI"], a: 0, why: "Data Factory (and Fabric pipelines) copy and orchestrate data between systems." }
  ],
  resources: [["Azure free account", "https://azure.microsoft.com/free/"], ["Microsoft Fabric docs", "https://learn.microsoft.com/en-us/fabric/"], ["Azure SQL Database docs", "https://learn.microsoft.com/en-us/azure/azure-sql/database/"]]
},
{
  id: "dimensional-modeling", track: "pbi", title: "Dimensional modeling", level: "Intermediate", time: "4 to 5 hours",
  tools: ["Power BI Desktop"], lab: "star",
  summary: "Design star schemas with facts, dimensions and a proper date table. The single biggest factor in a fast, correct Power BI model.",
  why: "Most slow or wrong Power BI reports trace back to a bad model: one giant flat table, many-to-many joins, bidirectional filters. Star schemas make DAX simpler and numbers correct.",
  outcomes: ["Separate facts from dimensions", "Declare grain", "Build a star schema with one-to-many single-direction relationships", "Create and mark a date table", "Handle role-playing and degenerate dimensions"],
  terms: [["Fact table", "Events and measures: orders, fills, notional. Long and narrow."], ["Dimension", "Descriptive context: venue, date, instrument, trader. Short and wide."], ["Star schema", "One fact in the middle, dimensions around it, each joined one-to-many."], ["Surrogate key", "An integer key generated in the warehouse, independent of source system IDs."], ["Role-playing dimension", "One dimension used for several roles, such as trade date and settlement date."]],
  learn: [
    ["Find the facts", "Ask what happens and what you measure. For us: executions, with orders, fills, latency and notional."],
    ["Declare the grain", "One fact row per venue per day. Every dimension must match that grain or be coarser."],
    ["Pull out dimensions", "Anything you filter or group by: venue, date, instrument, trader, order type. Each becomes its own table with a key."],
    ["Build a date table", "Time intelligence needs a continuous date table marked as a date table in Power BI.", `Date =
ADDCOLUMNS (
    CALENDAR ( DATE ( 2026, 1, 1 ), DATE ( 2026, 12, 31 ) ),
    "Year", YEAR ( [Date] ),
    "Month", FORMAT ( [Date], "MMM" ),
    "MonthNum", MONTH ( [Date] ),
    "Weekday", FORMAT ( [Date], "ddd" ),
    "IsWeekday", WEEKDAY ( [Date], 2 ) <= 5
)`],
    ["Relationships: one-to-many, single direction", "Filters flow from dimension to fact. Avoid bidirectional filters unless you understand exactly why you need one."],
    ["Know star vs snowflake", "Snowflake splits dimensions further (venue to venue type). Power BI prefers stars; flatten snowflakes in Power Query."],
    ["Special cases", "Role-playing (two dates) uses one active and one inactive relationship with USERELATIONSHIP in DAX. Degenerate dimensions (order ID) live on the fact. Many-to-many needs a bridge table."]
  ],
  setup: [
    ["Install Power BI Desktop", "Free from the Microsoft Store (Windows only). On a Mac, use a Windows VM or a cloud PC."],
    ["Load executions.csv", "Get Data, Text/CSV."],
    ["Split into a star", "In Power Query, reference the query, keep only venue, remove duplicates and call it DimVenue. Repeat for other dimensions, then build relationships in Model view."]
  ],
  apply: {
    scenario: "The desk wants execution quality by venue, instrument and trader, with history.",
    steps: [
      ["Write a bus matrix", "Rows are business processes (orders, fills, allocations), columns are dimensions. Mark which apply where. It exposes shared dimensions early."],
      ["Validate grain with SMEs", "Is it per parent order or per child fill? Getting this wrong makes every total wrong."],
      ["Agree conformed dimensions", "One DimInstrument used by every report, not a slightly different one per team."],
      ["Document it", "A model diagram plus column definitions is a strong BA deliverable and speeds up development."]
    ]
  },
  quiz: [
    { q: "Where does venue name belong?", o: ["Fact table", "Venue dimension", "Date table"], a: 1, why: "Descriptive attributes live on dimensions. The fact stores the venue key." },
    { q: "Default relationship direction in a star schema?", o: ["Both directions", "Single, dimension to fact", "Fact to dimension"], a: 1, why: "Single-direction filtering from dimension to fact is predictable and fast." },
    { q: "Why mark a date table?", o: ["Colors", "Time intelligence functions need a complete, marked date table", "Required to load CSVs"], a: 1, why: "Functions like SAMEPERIODLASTYEAR rely on a continuous marked date table." }
  ],
  resources: [["Star schema guidance (Microsoft)", "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"], ["SQLBI articles", "https://www.sqlbi.com/articles/"]]
},
{
  id: "power-query", track: "pbi", title: "Power Query and M", level: "Intermediate", time: "4 to 6 hours",
  tools: ["Power BI Desktop", "Excel"],
  summary: "Clean and shape data with repeatable steps, understand the M code behind them, and keep queries folding back to the source.",
  why: "The PL-300 'Prepare the data' domain is a quarter of the exam, and in real work most reporting time goes into shaping data. Power Query turns manual cleanup into a refreshable recipe.",
  outcomes: ["Profile data quality", "Shape data: types, splits, unpivot, merge, append", "Read and edit M code", "Use parameters", "Check query folding"],
  terms: [["Applied steps", "Each transformation is recorded as a step and replayed on refresh."], ["M", "The language behind Power Query. Every click writes M."], ["Query folding", "Power Query translating steps into source SQL so the database does the work."], ["Merge", "Join two queries side by side (like SQL JOIN)."], ["Append", "Stack queries on top of each other (like UNION)."]],
  learn: [
    ["Profile first", "View, turn on Column quality, Column distribution and Column profile. Set profiling to the entire dataset, not the first 1,000 rows."],
    ["Set types early", "Wrong types cause silent errors later. Set them explicitly near the start."],
    ["Read the M", "Open Advanced Editor. Each line is a step referencing the previous one.", `let
    Source   = Csv.Document(File.Contents(FilePath), [Delimiter = ",", Encoding = 65001]),
    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    Typed    = Table.TransformColumnTypes(Promoted, {
        {"date", type date}, {"venue", type text}, {"orders", Int64.Type},
        {"fill_rate", type number}, {"latency_ms", type number},
        {"notional_musd", type number}}),
    Cleaned  = Table.TransformColumns(Typed, {{"venue", Text.Trim, type text}}),
    Filled   = Table.AddColumn(Cleaned, "filled_orders",
                 each [orders] * [fill_rate], type number)
in
    Filled`],
    ["Merge vs append", "Merge adds columns from another table by key. Append adds rows from tables with the same columns (for example monthly files)."],
    ["Unpivot wide data", "If months are columns, select the ID columns and choose Unpivot Other Columns. Power BI wants long, tidy data."],
    ["Use parameters", "Create a FilePath or ServerName parameter so switching environments is one change, not an edit to every query."],
    ["Protect query folding", "On database sources, right-click a step and check View Native Query. Steps like adding an index can break folding and pull everything into memory."]
  ],
  setup: [
    ["Power BI Desktop", "Same install as the modeling lesson."],
    ["Messy data", "Use your messy CSV from the Excel lesson, plus a second file for a different month to practice append."],
    ["Folding practice", "Connect to your Postgres or Azure SQL database to see View Native Query in action. It is unavailable for CSV files."]
  ],
  apply: {
    scenario: "Three teams send execution extracts in slightly different formats every morning.",
    steps: [
      ["One query per source", "Normalize column names and types per source, then append into one table."],
      ["Parameterize paths and servers", "UAT and production differ only by parameter values."],
      ["Push logic upstream when stable", "If every report repeats the same transformations, request them in the warehouse view instead."],
      ["Record steps as requirements", "The applied steps list is a readable spec of the cleaning logic."]
    ]
  },
  quiz: [
    { q: "What is query folding?", o: ["Compressing the file", "Translating steps into source queries so the database does the work", "Grouping queries in folders"], a: 1, why: "Folding pushes work to the source, which is far faster for large tables." },
    { q: "Monthly files with identical columns should be combined with...", o: ["Merge", "Append"], a: 1, why: "Append stacks rows; merge joins columns." },
    { q: "Months are spread across 12 columns. What fixes the shape?", o: ["Transpose", "Unpivot", "Pivot"], a: 1, why: "Unpivot turns column headers into row values: one row per ID per month." }
  ],
  resources: [["Power Query docs", "https://learn.microsoft.com/en-us/power-query/"], ["M function reference", "https://learn.microsoft.com/en-us/powerquery-m/"]]
},
{
  id: "dax", track: "pbi", title: "DAX measures", level: "Intermediate to advanced", time: "8 to 12 hours",
  tools: ["Power BI Desktop", "DAX Studio"], lab: "dax",
  summary: "Write measures that respond correctly to filters: CALCULATE, iterators, variables and time intelligence.",
  why: "DAX is where most learners get stuck and where the exam asks tricky scenario questions. Once filter context clicks, measures stop feeling like magic.",
  outcomes: ["Choose measures over calculated columns", "Explain filter context and row context", "Use CALCULATE to change filters", "Use iterators like SUMX", "Write safe divisions and variables", "Apply time intelligence"],
  terms: [["Measure", "A calculation evaluated at query time in the current filter context."], ["Calculated column", "Computed per row at refresh and stored. Uses memory."], ["Filter context", "The set of filters active for a cell: slicers, rows, columns, page filters."], ["Row context", "The current row during iteration, used by calculated columns and iterators."], ["CALCULATE", "Evaluates an expression under modified filters. The most important DAX function."]],
  learn: [
    ["Measures first", "Prefer measures for anything aggregated. Use calculated columns only for things you need to slice by."],
    ["See filter context", "The same measure shows a different value in every cell because each cell has different filters. Try it in the lab on this page."],
    ["Build basic measures", "Start simple and build on earlier measures.", `Total Orders  = SUM ( FactExecutions[orders] )

Filled Orders =
SUMX ( FactExecutions, FactExecutions[orders] * FactExecutions[fill_rate] )

Fill Rate     = DIVIDE ( [Filled Orders], [Total Orders] )`],
    ["Change filters with CALCULATE", "CALCULATE can add, replace or remove filters. REMOVEFILTERS gives you a denominator for percent of total.", `Share of Orders =
VAR ThisVenue = [Total Orders]
VAR AllVenues = CALCULATE ( [Total Orders], REMOVEFILTERS ( DimVenue ) )
RETURN
    DIVIDE ( ThisVenue, AllVenues )`],
    ["Use iterators", "SUMX, AVERAGEX and friends evaluate an expression row by row, then aggregate. Weighted averages need them."],
    ["Time intelligence", "With a marked date table:", `Orders YTD = TOTALYTD ( [Total Orders], 'Date'[Date] )
Orders PY  = CALCULATE ( [Total Orders], SAMEPERIODLASTYEAR ( 'Date'[Date] ) )
Orders YoY % = DIVIDE ( [Total Orders] - [Orders PY], [Orders PY] )`],
    ["Know visual calculations", "A newer feature where calculations are written on a visual (running sums, moving averages) instead of the model. The current exam outline includes them, so try one."]
  ],
  setup: [
    ["Power BI Desktop with your star schema", "Use the model from the dimensional modeling lesson."],
    ["DAX Studio", "Free from daxstudio.org. Run queries, see timings and inspect what your measures do."],
    ["dax.guide", "Every function with syntax and examples. Keep it open."]
  ],
  apply: {
    scenario: "Two reports show different fill rates for the same week.",
    steps: [
      ["Create a metric dictionary", "Name, business definition, DAX, owner. Most disagreements are definition disagreements."],
      ["Centralize measures", "Put shared measures in one semantic model that many reports connect to."],
      ["Check performance", "Use Performance Analyzer in Desktop and DAX Studio to find slow measures before users do."],
      ["Test at every level", "Check totals, subtotals and single rows against SQL. Totals are where wrong DAX hides."]
    ]
  },
  quiz: [
    { q: "Why use DIVIDE instead of the / operator?", o: ["It is faster to type", "It handles divide by zero without errors", "It rounds results"], a: 1, why: "DIVIDE returns blank (or an alternate value) when the denominator is zero." },
    { q: "What does CALCULATE do?", o: ["Creates a table", "Evaluates an expression with modified filter context", "Adds a column"], a: 1, why: "Every filter change in DAX happens through CALCULATE (or functions built on it)." },
    { q: "A measure shows the same total in every venue row. Most likely cause?", o: ["Filters are being removed, for example with ALL or REMOVEFILTERS", "The data is wrong", "Too many rows"], a: 0, why: "If the venue filter is removed, every row sees all venues. Sometimes intended (denominators), often a bug." }
  ],
  resources: [["dax.guide", "https://dax.guide/"], ["DAX Studio", "https://daxstudio.org/"], ["DAX overview (Microsoft)", "https://learn.microsoft.com/en-us/dax/dax-overview"]]
},
{
  id: "visualization", track: "pbi", title: "Report design best practices", level: "Intermediate", time: "4 to 5 hours",
  tools: ["Power BI Desktop"],
  summary: "Design reports people can read in five seconds: layout, chart choice, color, interactivity, accessibility and performance.",
  why: "A correct model with a confusing report still fails. The exam's visualize domain is roughly a quarter of the score, and in real work design decides whether anyone uses the dashboard.",
  outcomes: ["Start every page from a decision or question", "Pick the right chart type", "Use color with purpose", "Add drill-through, tooltips and bookmarks", "Make reports accessible and fast"],
  terms: [["Drill-through", "Right-click a data point to open a detail page filtered to it."], ["Report page tooltip", "A small page that appears on hover instead of the default tooltip."], ["Bookmark", "A saved state of a page (filters, visibility) used for toggles and guided stories."], ["Field parameter", "Lets users switch which field or measure a visual shows."], ["Theme", "A JSON file that sets colors and formatting across a report."]],
  learn: [
    ["Start from the question", "Write the decision this page supports at the top of your wireframe. If a visual does not help it, cut it."],
    ["Layout for scanning", "Most important KPIs top-left, trend next, detail at the bottom. Keep consistent alignment and spacing."],
    ["Choose charts deliberately", "Line for trends over time, bar for comparing categories, table for lookups, scatter for relationships. Avoid pies with more than a few slices."],
    ["Use color with purpose", "One neutral base, one highlight color, one alert color. Apply a theme so every visual matches.", `{
  "name": "Dashboard Lab",
  "dataColors": ["#1F7A8C", "#F2C94C", "#C8553D", "#5A6B7C", "#1C2A3A"],
  "background": "#FFFFFF",
  "foreground": "#1C2A3A",
  "tableAccent": "#1F7A8C"
}`],
    ["Add interactivity", "Slicers for common filters, drill-through for detail, report page tooltips for context, bookmarks for toggles, field parameters for switching measures."],
    ["Make it accessible", "Alt text on visuals, sufficient contrast, logical tab order, and never color alone to show meaning."],
    ["Keep it fast", "Fewer visuals per page, avoid huge tables, use Performance Analyzer to find slow visuals."]
  ],
  setup: [
    ["Power BI Desktop with your model", "Continue from the DAX lesson."],
    ["Save the theme JSON", "Save the code above as <code>dashboard-lab.json</code> and apply it from View, Themes, Browse for themes."],
    ["Sketch first", "Paper or any whiteboard tool. Wireframes are faster to change than reports."]
  ],
  apply: {
    scenario: "Traders and operations both want the execution dashboard, but they ask different questions.",
    steps: [
      ["Run a short requirements workshop", "Ask each group what decision they make with this data and how often."],
      ["Wireframe per audience", "An overview page for managers, a drill-through detail page for operations."],
      ["Test with real users", "Watch someone use it without explaining it. Where they hesitate is your next fix."],
      ["Iterate in small releases", "Ship, gather feedback, adjust. Keep a change log."]
    ]
  },
  quiz: [
    { q: "Best chart for daily notional over three months?", o: ["Pie", "Line", "Donut"], a: 1, why: "Line charts show change over continuous time." },
    { q: "What does drill-through do?", o: ["Exports data", "Opens a detail page filtered to the selected item", "Refreshes the report"], a: 1, why: "It moves from summary to detail while keeping the selected context." },
    { q: "How should color be used?", o: ["A different color per visual", "Sparingly, with a highlight and an alert color", "Always rainbow"], a: 1, why: "Restraint makes the highlighted thing obvious." }
  ],
  resources: [["Power BI report design tips", "https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-overview"]]
},
{
  id: "service-admin", track: "svc", title: "Power BI Service administration", level: "Intermediate to advanced", time: "6 to 8 hours",
  tools: ["Power BI Service", "On-premises data gateway"],
  summary: "Workspaces, roles, apps, row-level security, scheduled refresh, gateways, deployment pipelines and licensing.",
  why: "The 'Manage and secure Power BI' domain is on the exam, and at a bank security and governance are not optional. This is where reports become trusted, controlled products.",
  outcomes: ["Set up workspaces and assign roles", "Distribute with apps", "Implement and test row-level security", "Configure scheduled and incremental refresh", "Explain gateway types", "Promote content with deployment pipelines"],
  terms: [["Workspace", "A container for reports, semantic models and dashboards with shared permissions."], ["Semantic model", "The published data model (formerly called a dataset). Reports connect to it."], ["RLS", "Row-level security: DAX filters that limit which rows each user sees."], ["On-premises data gateway", "Software that lets the cloud service refresh from data sources on a private network."], ["Deployment pipeline", "Dev, test and prod stages for promoting content."]],
  learn: [
    ["Desktop builds, Service shares", "You author in Desktop and publish to a workspace in the Service, where refresh, security and sharing happen."],
    ["Workspace roles", "Admin (everything), Member (publish and share), Contributor (publish, cannot manage access), Viewer (read only). Give the least role needed."],
    ["Distribute with apps", "Package workspace content into an app with audiences so consumers see a clean, stable version."],
    ["Row-level security", "Define roles with DAX filters in Desktop, assign users or groups in the Service, and test with View as.", `// Dynamic RLS on DimTrader
[TraderEmail] = USERPRINCIPALNAME ()`],
    ["Scheduled refresh", "Set credentials and a schedule on the semantic model. Pro allows up to 8 refreshes a day; Premium Per User and capacity workspaces allow up to 48. Use incremental refresh for big tables."],
    ["Gateways", "Standard mode is shared, managed centrally, and supports many users and sources. Personal mode is for one user and cannot be shared. Cloud sources usually need no gateway."],
    ["Pipelines, labels and admin", "Deployment pipelines promote from dev to test to prod. Sensitivity labels classify content. Tenant settings in the admin portal control features like export and publish to web."]
  ],
  setup: [
    ["Get a Service account", "The Service requires a work or school account. A Pro trial is available on most tenants. If you have no personal tenant, use Microsoft Learn exercises and the exam sandbox."],
    ["Publish your report", "From Desktop, Publish to My workspace or a new workspace."],
    ["Test RLS", "Create a role in Desktop, use Modeling, View as, then publish and assign it in the Service."]
  ],
  apply: {
    scenario: "The execution dashboard is going from one team to the whole division.",
    steps: [
      ["Design access", "Map audiences to workspace roles and app audiences. Use security groups, not individual names."],
      ["Apply RLS by desk or region", "Confirm entitlement sources with compliance and data owners."],
      ["Align refresh with batch", "Schedule refresh after the end-of-day batch lands, with failure alerts to an owner."],
      ["Use environments", "Dev, test, prod through a deployment pipeline, with sign-off before promotion."]
    ]
  },
  quiz: [
    { q: "Which role can publish content but cannot manage workspace access?", o: ["Viewer", "Contributor", "Admin"], a: 1, why: "Contributors create and edit content; Members and Admins manage access." },
    { q: "Maximum scheduled refreshes per day on Pro?", o: ["8", "48", "Unlimited"], a: 0, why: "Pro allows 8; PPU and capacity allow 48." },
    { q: "Which gateway mode suits a shared team setup?", o: ["Personal", "Standard"], a: 1, why: "Standard mode is centrally managed and shareable across users and models." }
  ],
  resources: [["Power BI Service docs", "https://learn.microsoft.com/en-us/power-bi/fundamentals/"], ["Row-level security", "https://learn.microsoft.com/en-us/fabric/security/service-admin-row-level-security"], ["Data gateway", "https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-onprem"]]
},
{
  id: "automate-apps", track: "plat", title: "Power Automate and Power Apps", level: "Beginner", time: "4 to 5 hours",
  tools: ["Power Automate", "Power Apps"],
  summary: "Foundations of flows and low-code apps, and the places they plug into Power BI.",
  why: "Job posts increasingly ask for Power Platform basics. Flows remove manual steps around reports, and simple apps let users act on what a report shows.",
  outcomes: ["Build a cloud flow with a trigger and actions", "Trigger a flow from a Power BI alert", "Explain canvas vs model-driven apps", "Embed a Power Apps visual for write-back", "Understand connectors and governance"],
  terms: [["Cloud flow", "An automation with a trigger (something happens) and actions (do things)."], ["Desktop flow", "Robotic process automation that clicks through desktop apps."], ["Canvas app", "An app you design pixel by pixel, like a slide."], ["Model-driven app", "An app generated from a Dataverse data model."], ["Dataverse", "Power Platform's managed database."]],
  learn: [
    ["Anatomy of a flow", "Trigger (on a schedule, when an email arrives, when a Power BI alert fires) then actions (post to Teams, write to a list, refresh a semantic model)."],
    ["Alert to action", "In the Service, set a data alert on a dashboard tile, then choose Use Microsoft Power Automate to trigger a flow when it fires."],
    ["Refresh after upstream loads", "Use the Refresh a dataset action at the end of a data load flow so reports refresh exactly when data is ready."],
    ["Canvas vs model-driven", "Canvas for custom, simple task apps. Model-driven for data-heavy business processes on Dataverse."],
    ["Write-back from reports", "The Power Apps visual in Power BI passes selected data into an app, so users can add comments or flags next to the numbers."],
    ["Mind connectors and governance", "Standard connectors are included in many licenses; premium connectors (SQL, HTTP) need extra licensing. Admins control what can connect with data loss prevention policies."]
  ],
  setup: [
    ["Check your access", "Power Automate is included with many Microsoft 365 work plans. Sign in at make.powerautomate.com."],
    ["Power Apps Developer Plan", "Free individual environment for learning with a work or school account."],
    ["Build a first flow", "Recurrence trigger, then post a message to yourself in Teams or send an email."]
  ],
  apply: {
    scenario: "Operations manually checks the dashboard each morning for low fill rates.",
    steps: [
      ["Turn the check into an alert", "Alert when fill rate falls below the agreed threshold."],
      ["Route it", "The flow posts to the right channel or creates a ticket with the details."],
      ["Capture commentary", "A small Power Apps form lets the desk record the reason, stored with the date and venue."],
      ["Get approvals", "Automation touching production processes needs platform and governance sign-off in regulated firms."]
    ]
  },
  quiz: [
    { q: "What starts a cloud flow?", o: ["An action", "A trigger", "A connector"], a: 1, why: "Every flow begins with one trigger, followed by actions." },
    { q: "Where do users add comments next to report numbers?", o: ["Power Apps visual in Power BI", "Bookmarks", "Q&A visual"], a: 0, why: "The Power Apps visual enables write-back from the report context." },
    { q: "Which app type is generated from a Dataverse model?", o: ["Canvas", "Model-driven"], a: 1, why: "Model-driven apps build their UI from the data model." }
  ],
  resources: [["Power Automate docs", "https://learn.microsoft.com/en-us/power-automate/"], ["Power Apps docs", "https://learn.microsoft.com/en-us/power-apps/"]]
},
{
  id: "ai-genai", track: "plat", title: "AI and generative AI in BI", level: "Beginner to intermediate", time: "3 to 4 hours",
  tools: ["Power BI AI visuals", "Copilot", "Claude or similar"],
  summary: "What AI and generative AI can and cannot do in analytics, the AI features inside Power BI, and how to use assistants safely.",
  why: "AI features are now part of the Power BI toolkit and the exam outline, and assistants speed up DAX, M and SQL work. Using them well, and safely with sensitive data, is a real skill.",
  outcomes: ["Distinguish AI, machine learning and generative AI", "Use Power BI AI visuals", "Prepare a model for Copilot", "Prompt an assistant for DAX, M and SQL", "Apply data privacy rules"],
  terms: [["Machine learning", "Models that learn patterns from data to predict or classify."], ["Generative AI", "Models that produce new text, code or images from a prompt."], ["LLM", "Large language model. Predicts likely text, so it can be confidently wrong."], ["Hallucination", "A plausible but false output from a model."], ["Copilot in Power BI", "Microsoft's generative assistant for building report pages, summaries and DAX."]],
  learn: [
    ["Know the difference", "Classic ML predicts (will this order fill?). Generative AI writes (explain this measure, draft a summary). Both can be wrong; verify outputs."],
    ["Use built-in AI visuals", "Key influencers, Decomposition tree, Q&A and anomaly detection on line charts work in Desktop without extra licensing."],
    ["Understand Copilot requirements", "Copilot in Power BI needs a paid capacity and admin enablement. Check current requirements before planning around it."],
    ["Prepare the model for AI", "Clear table and column names, descriptions, synonyms, hidden helper columns. The same things help humans."],
    ["Prompt assistants well", "Give the schema, the goal and the constraints. Ask for an explanation so you can check the logic.", `You are helping me write a DAX measure.
Model: FactExecutions(date, venue_key, orders, fill_rate, latency_ms)
       DimVenue(venue_key, venue_name)
       'Date'(Date, Year, Month), marked as date table
Goal: order-weighted average latency that ignores the venue slicer.
Constraints: use variables, handle divide by zero,
explain each line, and give me one test to verify it.`],
    ["Protect data", "Never paste confidential or client data into tools your firm has not approved. Use mock data, like everything on this site, when practicing."]
  ],
  setup: [
    ["Power BI Desktop", "AI visuals are in the Visualizations pane."],
    ["An assistant", "Claude, Copilot or GitHub Copilot in VS Code for code."],
    ["Your mock model", "Practice every prompt against the fake execution model so nothing sensitive is involved."]
  ],
  apply: {
    scenario: "Your team wants AI-written summaries on the daily execution report.",
    steps: [
      ["Use approved tools only", "Confirm what your firm allows and where data is processed."],
      ["Keep a human in the loop", "AI drafts, a person reviews before anything is distributed."],
      ["Fix the model first", "Poor naming and missing descriptions produce poor AI answers."],
      ["Measure usefulness", "Track whether summaries are read and whether they are accurate. Drop the feature if not."]
    ]
  },
  quiz: [
    { q: "What is a hallucination?", o: ["A visual glitch", "A confident but false AI output", "A data refresh error"], a: 1, why: "LLMs generate likely text, not verified facts." },
    { q: "What most improves Copilot answers on a model?", o: ["More visuals", "Clear names, descriptions and synonyms", "Bigger tables"], a: 1, why: "Copilot reads model metadata; clear metadata gives better grounding." },
    { q: "Practicing prompts with work data in a public chatbot is...", o: ["Fine if you delete the chat", "Not acceptable unless the tool is approved for that data", "Always fine"], a: 1, why: "Data handling rules apply regardless of the tool. Use mock data." }
  ],
  resources: [["Copilot in Power BI", "https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction"], ["AI visuals in Power BI", "https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-influencers"]]
},
{
  id: "pl300", track: "ship", title: "PL-300 exam prep", level: "Certification", time: "6 to 8 weeks", lab: "pl300",
  tools: ["Microsoft Learn", "Power BI Desktop", "Practice assessment"],
  summary: "A plan to earn Microsoft Certified: Power BI Data Analyst Associate by passing PL-300, built on the lessons in this lab.",
  why: "PL-300 is the standard Power BI credential employers look for. It tests applied skills in scenarios, so the lessons here double as exam preparation.",
  outcomes: ["Know the four domains and their weights", "Follow a week-by-week plan", "Use the free practice assessment and exam sandbox", "Book and sit the exam", "Keep the certification renewed"],
  terms: [["Skills measured", "Microsoft's official outline of exam objectives. The current version is dated April 20, 2026."], ["Practice assessment", "Free official practice questions on Microsoft Learn."], ["Exam sandbox", "A demo of the exam interface and question types."], ["Renewal", "Associate certifications renew yearly through a free online assessment."]],
  learn: [
    ["Read the official study guide", "It lists every objective and changes between versions. The four domains: Prepare the data (25 to 30%), Model the data (25 to 30%), Visualize and analyze the data (25 to 30%), Manage and secure Power BI (15 to 20%)."],
    ["Weeks 1 and 2: prepare the data", "Power Query lesson, data sources, profiling, cleaning, shaping, merge and append, Import vs DirectQuery."],
    ["Weeks 2 and 3: model the data", "Dimensional modeling and DAX lessons. Relationships, date tables, CALCULATE, time intelligence, performance."],
    ["Weeks 4 and 5: visualize and analyze", "Report design lesson plus AI visuals, drill-through, bookmarks, visual calculations and Copilot features."],
    ["Week 5: manage and secure", "Service administration lesson: workspaces, apps, RLS, refresh, gateways, sensitivity labels."],
    ["Week 6: practice and review", "Take the free practice assessment, review every wrong answer against the docs, and retake until you score well consistently. Try the exam sandbox for question formats."],
    ["Book and sit the exam", "Schedule through Microsoft Learn with Pearson VUE, online or at a test center. Passing score is 700 out of 1000. Check the current rules on accessing Microsoft Learn during the exam."]
  ],
  setup: [
    ["Create a Microsoft Learn profile", "learn.microsoft.com. Track modules, practice assessments and certifications in one place."],
    ["Bookmark the study guide", "Study from the latest official outline, not old blog summaries."],
    ["Check cost and discounts", "The US price has been about USD 165. Look for employer reimbursement and Microsoft discount vouchers from learning events."]
  ],
  apply: {
    scenario: "Turning study time into career value, not just a badge.",
    steps: [
      ["Build while you study", "Every lesson here produces a dashboard for your portfolio and GitHub."],
      ["Connect to your work", "Map each domain to something you already do: requirements, UAT, reconciling numbers."],
      ["Ask about reimbursement", "Many employers pay for certification exams and training."],
      ["Share the result", "Add the credential to LinkedIn and your resume, and link this site."]
    ]
  },
  quiz: [
    { q: "What is the PL-300 passing score?", o: ["600 out of 1000", "700 out of 1000", "800 out of 1000"], a: 1, why: "Microsoft role-based exams use a 700 passing score." },
    { q: "Which domain has the smallest weight?", o: ["Prepare the data", "Model the data", "Manage and secure Power BI"], a: 2, why: "Manage and secure is 15 to 20%; the other three are 25 to 30% each." },
    { q: "How do you renew the certification?", o: ["Retake PL-300 every year", "Pass a free online renewal assessment yearly", "It never expires"], a: 1, why: "Associate certifications renew annually with a free assessment on Microsoft Learn." }
  ],
  resources: [["Official PL-300 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300"], ["Power BI Data Analyst Associate", "https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/"]]
},
{
  id: "github", track: "ship", title: "Publish on GitHub", level: "Beginner", time: "2 to 3 hours",
  tools: ["Git", "GitHub", "GitHub Pages"],
  summary: "Put this site and every dashboard in a public repository, host the site free on GitHub Pages, and version Power BI projects.",
  why: "A public portfolio proves you can do the work. GitHub also teaches the source control habits BI teams increasingly expect.",
  outcomes: ["Create a repository with a clear structure", "Commit and push with Git", "Host this site on GitHub Pages", "Save Power BI work as a Power BI Project (.pbip)", "Keep secrets out of public repos"],
  terms: [["Repository", "A project folder tracked by Git, with full history."], ["Commit", "A saved snapshot with a message."], ["GitHub Pages", "Free static website hosting from a repository."], ["PBIP", "Power BI Project format: the report and model saved as text files that Git can diff."], [".gitignore", "A file listing things Git should never track."]],
  learn: [
    ["Plan the structure", "One repo for the whole lab, one folder per lesson.", `dashboard-lab/
  index.html              this site
  README.md               what the project is, screenshots, links
  lessons/
    01-mock-data/         generate_data.py, executions.csv
    06-star-schema/       model.pbip, screenshots/
    08-dax/               measures.md
  .gitignore`],
    ["Learn five commands", "Enough to work day to day.", `git clone https://github.com/<you>/dashboard-lab.git
git status
git add .
git commit -m "Add lesson 2 CSV cleanup"
git push`],
    ["Turn on GitHub Pages", "Repository Settings, Pages, deploy from branch main and root folder. Your site appears at <code>&lt;you&gt;.github.io/dashboard-lab</code>."],
    ["Save Power BI as PBIP", "File, Save as, Power BI Project. The model and report become text files, so Git shows what changed."],
    ["Write a strong README", "What it is, a screenshot, how to run it, what you learned. Recruiters read READMEs, not code."],
    ["Never commit secrets", "No passwords, connection strings or real data. Add <code>.env</code> and credential files to .gitignore."]
  ],
  setup: [
    ["Create a GitHub account", "github.com. Pick a professional username; it becomes part of your site URL."],
    ["Install Git or GitHub Desktop", "GitHub Desktop is the easiest start; VS Code has Git built in."],
    ["Create the repo", "New repository named dashboard-lab, public, with a README."]
  ],
  apply: {
    scenario: "Your team still emails .pbix files named final_v7.",
    steps: [
      ["Propose PBIP in source control", "Diffs, history and code review for reports."],
      ["Separate environments", "Branches or folders for dev and release, connected to deployment pipelines."],
      ["Use pull requests", "A second person reviews measure changes before release."],
      ["Keep internal repos internal", "Work code goes in your firm's approved platform, never a personal account."]
    ]
  },
  quiz: [
    { q: "Why save Power BI work as .pbip for Git?", o: ["Smaller files", "It is text-based, so changes can be diffed and reviewed", "Required for publishing"], a: 1, why: ".pbix is binary; PBIP stores definitions as text." },
    { q: "Which should never be committed?", o: ["README.md", "A connection string with a password", "Screenshots"], a: 1, why: "Public repos are scanned constantly for secrets." },
    { q: "What does GitHub Pages do?", o: ["Hosts static websites from a repo for free", "Runs databases", "Hosts Power BI reports"], a: 0, why: "Pages serves HTML, CSS and JS straight from your repository." }
  ],
  resources: [["GitHub Pages docs", "https://docs.github.com/en/pages"], ["Power BI Projects (PBIP)", "https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-overview"]]
}
];

const LOG = [
  ["2026-09-30", "Sep 30, 2026", "Published the site on GitHub Pages from the main branch and added the live link to the README."],
  ["2026-09-29", "Sep 29, 2026", "Rebuilt the site as a lesson library: 14 lessons across six tracks, each with its own page for learning steps, setup, work application and an interactive guide. Added data warehouse, Azure, Power BI Service, Power Platform, AI and PL-300 prep."],
  ["2026-09-29", "Sep 29, 2026", "Started the site. Picked a mock trading desk as the shared dataset and built the first dashboard entirely in the browser with Chart.js."]
];
