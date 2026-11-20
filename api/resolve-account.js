// Vercel serverless function: POST /api/resolve-account
// Uses PAYSTACK_SECRET_KEY from Vercel env vars (never in frontend code).
// Calls Paystack bank/resolve and returns only the account name.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const account_number = String(body.account_number || '').trim();
  const bank_code = String(body.bank_code || '').trim();
  if (!/^\d{10}$/.test(account_number) || !bank_code) {
    return res.status(400).json({ ok: false, error: 'Enter a valid 10-digit account number and select a bank.' });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ ok: false, error: 'Account validation is not configured yet.' });
  }
  try {
    const url = 'https://api.paystack.co/bank/resolve?account_number=' + encodeURIComponent(account_number) + '&bank_code=' + encodeURIComponent(bank_code);
    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json' } });
    const data = await r.json();
    if (!r.ok || !data.status || !data.data || !data.data.account_name) {
      return res.status(400).json({ ok: false, error: (data && data.message) || 'Could not resolve this account. Check the number and bank.' });
    }
    return res.status(200).json({ ok: true, account_name: data.data.account_name, account_number, bank_code });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Could not reach Paystack. Try again.' });
  }
}
