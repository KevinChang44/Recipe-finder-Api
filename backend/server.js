const express = require("express");
const cors = require("cors");
const pool = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1 as connected");
    res.json({ message: "Recipe Finder API is running!", db_connected: true });
  } catch (error) {
    res.json({
      message: "API running",
      db_connected: false,
      error: error.message,
    });
  }
});

// --- USER ROUTES ---
app.post("/api/user", async (req, res) => {
  const { username } = req.body;

  try {
    // Insert or get existing user
    await pool.query(
      "INSERT INTO users (username) VALUES (?) ON DUPLICATE KEY UPDATE username=username",
      [username],
    );

    const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- FAVORITE ROUTES ---
app.post("/api/favorites", async (req, res) => {
  const { userId, mealId, mealName, mealThumb } = req.body;

  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const [result] = await pool.query(
      "INSERT IGNORE INTO favorites (user_id, meal_id, meal_name, meal_thumb) VALUES (?, ?, ?, ?)",
      [userId, mealId, mealName, mealThumb],
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Already saved" });
    }
    res.json({ success: true, favoriteId: result.insertId });
  } catch (error) {
    console.error("User Route Error:", error);
    res.status(500).json({ error: "Could not process user" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [favorites] = await pool.query(
      "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/favorites/:userId/:mealId", async (req, res) => {
  const { userId, mealId } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND meal_id = ?",
      [userId, mealId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MEALDB PROXY ---
app.get("/api/search", async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`,
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("MySQL connection pool active");
});
