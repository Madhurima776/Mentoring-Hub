require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/auth",  require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/mentor", require("./routes/mentorRoutes"));
app.use("/student", require("./routes/studentRoutes"));
app.use("/coordinator", require("./routes/coordinatorRoutes"));

app.get("/", (req, res) => res.send("API running..."));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    msg: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));