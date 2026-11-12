# DSA Practice Tracker

A responsive, browser-based dashboard for logging data-structures-and-algorithms practice and tracking progress over time.

## Features

- Log solved problems with topic, difficulty, date, optional duration, and optional link
- Dashboard totals for problems solved, weekly activity, current streak, and practice time
- Topic progress bars and a seven-day activity chart
- Filter recent problems by topic and remove entries
- Saves data in your browser with `localStorage`; no account or backend required
- Responsive layout for desktop and mobile

## Run locally

Open `index.html` in a browser, or serve the project folder with:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Data and privacy

Practice entries are stored only in this browser on this device. Clearing browser site data removes them. There is no server or analytics integration.

## Project files

- `index.html` — dashboard structure
- `styles.css` — responsive styling
- `script.js` — practice log, local storage, and progress calculations

## License

MIT. See [LICENSE](LICENSE).
