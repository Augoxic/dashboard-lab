# Dashboard Lab

Learning to build dashboards, in public. A working notebook that goes from fake data to the Microsoft PL-300 exam, with an interactive page for every lesson.

**Live site:** https://YOUR-USERNAME.github.io/dashboard-lab (update after enabling GitHub Pages)

All data in this project is synthetic: a mock trading execution desk with five venues. No real or confidential data is used anywhere.

## What's inside

14 lessons across six tracks:

| Track | Lessons |
|---|---|
| Foundations | Mock data with code, Excel and CSV, Build a small database |
| Data engineering | Data warehouse and ETL/ELT, Azure data services |
| Power BI core | Dimensional modeling, Power Query and M, DAX measures, Report design |
| Power BI Service | Service administration (workspaces, RLS, refresh, gateways) |
| Power Platform and AI | Power Automate and Power Apps, AI and generative AI in BI |
| Certify and ship | PL-300 exam prep, Publish on GitHub |

Each lesson page has: overview, steps to learn, steps to set up, how to apply it at work, and an interactive guide with a progress checklist, a quiz and (on some lessons) a hands-on lab.

## Run it locally

No build step. Open `index.html` in a browser, or use the VS Code Live Server extension.

To generate the lesson 1 dataset:

```bash
cd lessons/01-mock-data
pip install pandas numpy
python generate_data.py
```

## Project structure

```
index.html        page shell
css/style.css     all styles, light and dark themes
js/lessons.js     lesson content (edit this to add or change lessons)
js/app.js         router, lesson pages and interactive labs
lessons/          code, data scripts and Power BI projects per lesson
```

## Built with

Plain HTML, CSS and JavaScript, Chart.js, and Python for data generation.
