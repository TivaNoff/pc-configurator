const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const {
  createConfig,
  getConfigs,
  getConfigById,
  deleteConfig,
} = require("../controllers/configController");

router.use(authMiddleware);

router.post("/", createConfig);
router.get("/", getConfigs);
router.get("/:id", getConfigById);
router.delete("/:id", deleteConfig);

module.exports = router;
