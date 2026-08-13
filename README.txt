VEYN — FINANCE SIMPLIFIED
============================================================

Static GitHub Pages site for Veyn's finance education articles.

PUBLISHING TARGET
-----------------
Repository: https://github.com/finance-simplified/github.io
Pages URL:  https://finance-simplified.github.io/github.io/
Branch:     main
Site path:  repository root

DEPLOYMENT
----------
1. Extract the deployment ZIP.
2. Place every extracted file and folder at the root of the main branch.
   index.html must be at repository root; do not add an outer veyn folder.
3. In GitHub, open Settings > Pages.
4. Under Build and deployment, select Deploy from a branch, main, and /(root).
5. Save and wait for GitHub Pages to finish deploying.

ARTICLE PUBLISHING PLUGIN
-------------------------
The site is compatible with:
D:\publish_plugin\item_github.py

The plugin discovers agent/publish-config.json, writes published articles to
data/articles.json, and returns an article.html?id=ARTICLE_ID URL. Keep these
paths and the existing article field names unchanged.

Both index.html and articles.html load data/articles.json dynamically. New
published entries appear automatically, sorted by date from newest to oldest.
Draft and review entries are not displayed. Category filters are generated
from the published article data.

CONTENT FILES
-------------
data/profile.json          Public identity and biography data
data/articles.json         Published article metadata and body content
data/research.json         Story Desk series and project data
agent/profile.json         Editorial voice and audience rules
agent/content-schema.json  Article JSON validation schema
agent/content-plan.json    Content topics and cadence
agent/publish-config.json  GitHub Pages publishing target
agent/writing-style.json   Editorial and citation rules

LOCAL PREVIEW
-------------
Use a local web server so the browser can request JSON files. For example,
from the extracted site root:

    python -m http.server 8000

Then open http://127.0.0.1:8000/. Opening index.html directly with file:// will
prevent the browser from loading article data.

EDITORIAL NOTE
--------------
All content is educational and does not constitute investment advice. Review
new articles and sources before publication.
