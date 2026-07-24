#  Page Pulse - Website Auditor

Page Pulse is a full-stack SEO and web page performance auditing tool. Given any URL, it fetches the page content, analyzes key HTML structure, metadata, and performance indicators, and returns a clean audit report.

##  Features

- **SEO Metrics**: Extracts page title, meta description, and counts `<h1>` header tags.
- **Accessibility & Media**: Tracks images missing necessary `alt` attributes.
- **Performance & Content**: Measures server HTTP status code, response latency (ms), and estimated total word count.
- **Resilient Error Handling**: Robustly handles invalid URLs, non-HTML responses, request timeouts, and server errors without crashing.

##  Tech Stack

- **Backend**: Node.js, Express.js, Axios, Cheerio, CORS
- **Frontend**: HTML5, CSS3, JavaScript (Fetch API)

##  Project Structure

```text
page-pulse/
├── backend/
│   ├── index.js
│   └── package.json
└── frontend/
    └── index.html