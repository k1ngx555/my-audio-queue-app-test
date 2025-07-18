const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const queueRoutes = require("./queue");
const donationRoutes = require("./donation");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/queue", queueRoutes);
app.use("/api/donation", donationRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
