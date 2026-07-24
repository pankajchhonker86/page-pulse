const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Audit Endpoint
app.post('/api/audit', async (req, res) => {
  const { url } = req.body;

  // 1. Validate URL Presence and Format
  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  let validUrl;
  try {
    validUrl = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format. Please enter a valid web address.' });
  }

  const startTime = Date.now();

  try {
    // 2. Fetch the page with timeout and custom User-Agent
    const response = await axios.get(validUrl.toString(), {
      timeout: 8000, // 8 second timeout
      headers: {
        'User-Agent': 'PagePulseBot/1.0 (+https://pagepulse.example.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      },
      maxRedirects: 5,
      responseType: 'text'
    });

    const responseTime = Date.now() - startTime;
    const contentType = response.headers['content-type'] || '';

    // 3. Handle non-HTML responses
    if (!contentType.includes('text/html')) {
      return res.status(400).json({
        error: `Target URL returned non-HTML content type: ${contentType}`
      });
    }

    // 4. Parse HTML content with Cheerio
    const $ = cheerio.load(response.data);

    // Page Title
    const pageTitle = $('title').first().text().trim() || 'N/A';

    // Meta Description
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                           $('meta[property="og:description"]').attr('content')?.trim() || 
                           'N/A';

    // H1 Tag Count
    const h1Count = $('h1').length;

    // Images missing alt attribute or with empty alt
    let imagesMissingAlt = 0;
    $('img').each((_, element) => {
      const alt = $(element).attr('alt');
      if (alt === undefined || alt.trim() === '') {
        imagesMissingAlt++;
      }
    });

    // Approximate Word Count (extract text from body, clean whitespace)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText ? bodyText.split(' ').length : 0;

    // 5. Return Audit Report
    return res.json({
      url: validUrl.toString(),
      status: response.status,
      responseTimeMs: responseTime,
      pageTitle,
      metaDescription,
      h1Count,
      imagesMissingAlt,
      wordCount
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Handle Network / HTTP Errors cleanly
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out after 8 seconds.' });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: `Server responded with status code ${error.response.status} (${error.response.statusText})`
      });
    } else if (error.request) {
      return res.status(502).json({ error: 'Unable to reach the destination server. Please check the URL.' });
    }

    return res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Page Pulse Server running on port ${PORT}`);
});