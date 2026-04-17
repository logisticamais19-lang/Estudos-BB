const dataSvc = require('../services/dataService');
const planSvc = require('../services/planService');
const admin   = require('firebase-admin');

async function getProfile(req, res) {
  try {
    const profile = await dataSvc.getUserProfile(req.uid);
    res.json({ ok: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProfile(req, res) {
  try {
    const { name, dailyGoalH, monthlyGoalH } = req.body;
    await dataSvc.upsertUserProfile(req.uid, {
      name,
      dailyGoalH:   Number(dailyGoalH)   || 2,
      monthlyGoalH: Number(monthlyGoalH) || 60,
      plan:         'free',
      createdAt:    admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, dailyGoalH, monthlyGoalH } = req.body;
    await dataSvc.upsertUserProfile(req.uid, { name, dailyGoalH, monthlyGoalH });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteAccount(req, res) {
  try {
    await dataSvc.deleteUserData(req.uid);
    await admin.auth().deleteUser(req.uid);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProfile, createProfile, updateProfile, deleteAccount };
