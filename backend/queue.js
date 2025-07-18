const express = require("express");
const router = express.Router();

// Simple in-memory queue (demo)
let queue = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" }
];
let currentSpeaker = null;

// Get queue
router.get("/", (req, res) => {
  res.json({ queue, currentSpeaker });
});

// Join queue
router.post("/join", (req, res) => {
  const { name } = req.body;
  if (!name || queue.find(u => u.name === name)) {
    return res.status(400).json({ error: "Invalid name or already in queue" });
  }
  const user = { id: Date.now().toString(), name };
  queue.push(user);
  res.json({ queue });
});

// Leave queue
router.post("/leave", (req, res) => {
  const { name } = req.body;
  queue = queue.filter(u => u.name !== name);
  if (currentSpeaker && currentSpeaker.name === name) currentSpeaker = null;
  res.json({ queue, currentSpeaker });
});

// Promote to speaker
router.post("/promote", (req, res) => {
  const { id } = req.body;
  const user = queue.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  currentSpeaker = user;
  queue = queue.filter(u => u.id !== id);
  res.json({ queue, currentSpeaker });
});

// End speaker
router.post("/endSpeaker", (req, res) => {
  currentSpeaker = null;
  res.json({ currentSpeaker });
});

// Remove from queue
router.post("/remove", (req, res) => {
  const { id } = req.body;
  queue = queue.filter(u => u.id !== id);
  res.json({ queue });
});

module.exports = router;
