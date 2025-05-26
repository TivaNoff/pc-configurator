// backend/src/controllers/configController.js

const Config = require('../models/Config');
const Component = require('../models/Component');

// POST /api/configs
exports.createConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, components } = req.body;
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: 'Components array required' });
    }

    // Подсчёт totalPrice как сумма минимальных цен по каждому компоненту
    const comps = await Component.find({ opendb_id: { $in: components } });
    const totalPrice = comps.reduce((sum, c) => {
      const vals = Object.values(c.prices).filter(v => typeof v === 'number');
      return sum + (vals.length ? Math.min(...vals) : 0);
    }, 0);

    const cfg = await Config.create({
      user: userId,
      name: name || 'Моя збірка',
      components,
      totalPrice
    });
    res.status(201).json(cfg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/configs
exports.getConfigs = async (req, res) => {
  try {
    const userId = req.user.id;
    const configs = await Config.find({ user: userId }).sort({ createdAt: -1 });
    res.json(configs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// GET /api/configs/:id
exports.getConfigById = async (req, res) => {
  try {
    const cfg = await Config.findOne({ _id: req.params.id, user: req.user.id });
    if (!cfg) return res.status(404).json({ message: 'Not found' });
    res.json(cfg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE /api/configs/:id
exports.deleteConfig = async (req, res) => {
  try {
    const result = await Config.deleteOne({ _id: req.params.id, user: req.user.id });
    if (!result.deletedCount) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/configs/:id
exports.updateConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, components: compIds } = req.body;
    if (!Array.isArray(compIds)) {
      return res.status(400).json({ message: 'Components must be array' });
    }

    // Пересчёт цены
    const comps = await Component.find({ opendb_id: { $in: compIds } });
    const totalPrice = comps.reduce((sum, c) => {
      const vals = Object.values(c.prices).filter(v => typeof v === 'number');
      return sum + (vals.length ? Math.min(...vals) : 0);
    }, 0);

    const updated = await Config.findOneAndUpdate(
      { _id: id, user: userId },
      { name, components: compIds, totalPrice },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
