const planSvc = require('../services/planService');

async function getPlan(req, res) {
  try {
    const plan   = await planSvc.getUserPlan(req.uid);
    const limits = planSvc.getPlanLimits(plan);
    res.json({ ok: true, plan, limits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Chamado apenas por webhook de pagamento — proteger com secret
async function upgradePlan(req, res) {
  try {
    const { uid, plan, webhookSecret } = req.body;
    const expected = process.env.WEBHOOK_SECRET;
    if (!expected || webhookSecret !== expected) {
      return res.status(403).json({ error: 'Webhook não autorizado.' });
    }
    await planSvc.setPlan(uid, plan);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPlan, upgradePlan };
