// backend/src/routes/configs.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const {
  createConfig,
  getConfigs,
  getConfigById,
  deleteConfig
} = require('../controllers/configController');

// Все роуты защищены
router.use(authMiddleware);
// после router.use(authMiddleware)
router.put('/:id', updateConfig);


router.post('/', createConfig);
router.get('/', getConfigs);
router.get('/:id', getConfigById);
router.delete('/:id', deleteConfig);

module.exports = router;
