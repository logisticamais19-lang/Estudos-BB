const dataSvc = require('../services/dataService');

async function getAll(req, res) {
  try {
    const data = await dataSvc.loadUserData(req.uid);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function saveDoc(req, res) {
  try {
    const { key, data } = req.body;
    await dataSvc.saveUserDoc(req.uid, key, data);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function saveBatch(req, res) {
  try {
    await dataSvc.saveUserDataBatch(req.uid, req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getAll, saveDoc, saveBatch };
