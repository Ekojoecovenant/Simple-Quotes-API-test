const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const port = 2000;

const dataFile = path.join(__dirname, "quotes.json");

// Body parser middleware
app.use(express.json());

// To read the quotes from the json file
let quotes = [];

function loadQuotes() {
  try {
    const data = fs.readFileSync(dataFile, "utf8");
    quotes = JSON.parse(data);
  } catch (err) {
    console.error("Failed to load quotes: ", err);
    quotes = [];
  }
}

loadQuotes(); // load on server start

// Routes here...

// This sends the whole quotes array
app.get("/quotes", (req, res) => {
  res.json(quotes);
});

// This sends a random quote
app.get("/quotes/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json(quotes[randomIndex]);
});

// This lets users search quotes containing keywords using a query like: '/quotes/search?q=imagination'
app.get("/quotes/search", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: "Search query 'q' is required." });
  }

  const keyword = query.toLowerCase();

  const results = quotes.filter(
    (quote) =>
      quote.text.toLowerCase().includes(keyword) ||
      quote.author.toLowerCase().includes(keyword)
  );

  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ message: "No matching quotes found." });
  }
});

// This sends the quote of a specific author
app.get("/quotes/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  const filteredQuotes = quotes.filter(
    (quote) => quote.author.toLowerCase() === author
  );

  if (filteredQuotes.length > 0) {
    res.json(filteredQuotes);
  } else {
    res.status(404).json({ message: "No quotes found for that author." });
  }
});

// This adds a new quote
app.post("/quotes", (req, res) => {
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ message: "Author and text are required." });
  }

  const newQuote = { author, text };
  quotes.push(newQuote);

  fs.writeFile(dataFile, JSON.stringify(quotes, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to save quote." });
    }
    res.status(201).json({ message: "Quote added successfully!", newQuote });
  });
});

app.listen(port, () => {
  console.log(`QuoteVault running at http://localhost:${port}`);
});
