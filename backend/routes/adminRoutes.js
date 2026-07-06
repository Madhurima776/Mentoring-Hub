const express = require("express");
const router  = express.Router();
const upload  = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  bulkUploadUsers,
  getAllUsers,
  toggleUser,
  deleteUser,
  getStats,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.post("/upload-users",    upload.single("file"), bulkUploadUsers);
router.get("/users",            getAllUsers);
router.put("/users/:id/toggle", toggleUser);
router.delete("/users/:id",     deleteUser);
router.get("/stats",            getStats);

module.exports = router;