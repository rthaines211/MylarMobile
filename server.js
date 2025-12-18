import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection cache for pooling
const dbConnections = new Map();
const MAX_POOL_SIZE = 5;

function getDatabase(dbPath) {
  if (dbConnections.has(dbPath)) {
    return dbConnections.get(dbPath);
  }

  if (dbConnections.size >= MAX_POOL_SIZE) {
    // Close oldest connection
    const oldestKey = dbConnections.keys().next().value;
    dbConnections.get(oldestKey)?.close();
    dbConnections.delete(oldestKey);
  }

  const db = new Database(dbPath, { readonly: true });
  dbConnections.set(dbPath, db);
  return db;
}

// Cleanup on exit
process.on('exit', () => {
  dbConnections.forEach(db => db.close());
});

// Get weekly pull list from mylar.db
app.get('/api/weekly', (req, res) => {
  const { dbPath, weekNumber, year, status, search } = req.query;

  if (!dbPath) {
    return res.status(400).json({
      success: false,
      error: 'dbPath query parameter is required'
    });
  }

  if (!existsSync(dbPath)) {
    return res.status(404).json({
      success: false,
      error: `Database file not found: ${dbPath}`
    });
  }

  try {
    const db = getDatabase(dbPath);

    let query = `
      SELECT
        w.rowid,
        w.SHIPDATE,
        w.PUBLISHER,
        w.COMIC,
        w.ISSUE,
        w.STATUS,
        w.ComicID,
        w.IssueID,
        w.DynamicName,
        w.weeknumber,
        w.year,
        w.volume,
        w.seriesyear,
        w.format,
        c.ComicImage,
        c.ComicImageURL
      FROM weekly w
      LEFT JOIN comics c ON w.ComicID = c.ComicID
      WHERE 1=1
    `;

    const params = [];

    if (weekNumber) {
      query += ' AND w.weeknumber = ?';
      params.push(weekNumber);
    }

    if (year) {
      query += ' AND w.year = ?';
      params.push(year);
    }

    if (status && status !== 'all') {
      if (status === 'pull') {
        // Pull list = everything except Skipped
        query += " AND w.STATUS != 'Skipped'";
      } else {
        query += ' AND w.STATUS = ?';
        params.push(status);
      }
    }

    // Search filter - case insensitive search in COMIC and PUBLISHER
    if (search && search.trim()) {
      query += ' AND (w.COMIC LIKE ? OR w.PUBLISHER LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY w.SHIPDATE DESC, w.PUBLISHER, w.COMIC';

    const rows = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available weeks
app.get('/api/weekly/weeks', (req, res) => {
  const { dbPath } = req.query;

  if (!dbPath) {
    return res.status(400).json({
      success: false,
      error: 'dbPath query parameter is required'
    });
  }

  if (!existsSync(dbPath)) {
    return res.status(404).json({
      success: false,
      error: `Database file not found: ${dbPath}`
    });
  }

  try {
    const db = getDatabase(dbPath);

    const rows = db.prepare(`
      SELECT DISTINCT weeknumber, year, MIN(SHIPDATE) as firstDate
      FROM weekly
      GROUP BY weeknumber, year
      ORDER BY year DESC, weeknumber DESC
      LIMIT 52
    `).all();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get weekly stats
app.get('/api/weekly/stats', (req, res) => {
  const { dbPath, weekNumber, year } = req.query;

  if (!dbPath) {
    return res.status(400).json({
      success: false,
      error: 'dbPath query parameter is required'
    });
  }

  if (!existsSync(dbPath)) {
    return res.status(404).json({
      success: false,
      error: `Database file not found: ${dbPath}`
    });
  }

  try {
    const db = getDatabase(dbPath);

    let whereClause = '';
    const params = [];

    if (weekNumber && year) {
      whereClause = 'WHERE weeknumber = ? AND year = ?';
      params.push(weekNumber, year);
    }

    const stats = db.prepare(`
      SELECT
        STATUS,
        COUNT(*) as count
      FROM weekly
      ${whereClause}
      GROUP BY STATUS
    `).all(...params);

    const result = {
      total: 0,
      byStatus: {}
    };

    stats.forEach(row => {
      result.byStatus[row.STATUS] = row.count;
      result.total += row.count;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get general statistics from mylar.db
app.get('/api/stats', (req, res) => {
  const { dbPath } = req.query;

  if (!dbPath) {
    return res.status(400).json({
      success: false,
      error: 'dbPath query parameter is required'
    });
  }

  if (!existsSync(dbPath)) {
    return res.status(404).json({
      success: false,
      error: `Database file not found: ${dbPath}`
    });
  }

  try {
    const db = getDatabase(dbPath);

    // Total comics
    const comicsCount = db.prepare('SELECT COUNT(*) as count FROM comics').get();

    // Comics by status
    const comicsByStatus = db.prepare(`
      SELECT Status, COUNT(*) as count
      FROM comics
      GROUP BY Status
    `).all();

    // Issues by status
    const issuesByStatus = db.prepare(`
      SELECT Status, COUNT(*) as count
      FROM issues
      GROUP BY Status
    `).all();

    // Total issues
    const totalIssues = db.prepare('SELECT COUNT(*) as count FROM issues').get();

    // Weekly stats
    const weeklyStats = db.prepare(`
      SELECT STATUS, COUNT(*) as count
      FROM weekly
      GROUP BY STATUS
    `).all();

    // Publishers
    const publishers = db.prepare(`
      SELECT ComicPublisher as publisher, COUNT(*) as count
      FROM comics
      WHERE ComicPublisher IS NOT NULL AND ComicPublisher != ''
      GROUP BY ComicPublisher
      ORDER BY count DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      data: {
        comics: {
          total: comicsCount?.count || 0,
          byStatus: Object.fromEntries(comicsByStatus.map(r => [r.Status, r.count]))
        },
        issues: {
          total: totalIssues?.count || 0,
          byStatus: Object.fromEntries(issuesByStatus.map(r => [r.Status, r.count]))
        },
        weekly: {
          byStatus: Object.fromEntries(weeklyStats.map(r => [r.STATUS, r.count]))
        },
        topPublishers: publishers
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`MylarMobile backend server running on port ${PORT}`);
});
