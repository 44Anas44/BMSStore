// ── Send via Resend HTTP API (works on Render free — no SMTP needed) ──────────
async function send(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EMAIL_PASS}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BMS STORE <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend API error: ${res.status} ${err}`)
  }
}

// ── Order email ───────────────────────────────────────────────────────────────
async function sendOrderEmail(order) {
  const rows = order.items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price.toFixed(2)} TND</td>
    </tr>`).join('')

  await send(
    process.env.ADMIN_EMAIL,
    `🛒 New Order #${order._id} — ${order.customer.name}`,
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#9c155f;color:#fff;padding:24px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;font-size:22px">BMS STORE</h1>
        <p style="margin:6px 0 0;opacity:0.8">New order received</p>
      </div>
      <div style="padding:24px;background:#f9f9f9">
        <h2 style="margin:0 0 16px;font-size:16px">Customer</h2>
        <p style="margin:4px 0"><strong>Name:</strong> ${order.customer.name}</p>
        <p style="margin:4px 0"><strong>Phone:</strong> ${order.customer.phone}</p>
        <p style="margin:4px 0"><strong>Address:</strong> ${order.customer.address}</p>
        ${order.customer.email ? `<p style="margin:4px 0"><strong>Email:</strong> ${order.customer.email}</p>` : ''}
        <h2 style="margin:24px 0 12px;font-size:16px">Items</h2>
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden">
          <thead><tr style="background:#eee">
            <th style="padding:10px;text-align:left">Product</th>
            <th style="padding:10px;text-align:center">Qty</th>
            <th style="padding:10px;text-align:right">Price</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td colspan="2" style="padding:10px;font-weight:bold">Total</td>
            <td style="padding:10px;text-align:right;font-weight:bold">${order.total.toFixed(2)} TND</td>
          </tr></tfoot>
        </table>
      </div>
      <div style="padding:16px 24px;background:#eee;border-radius:0 0 12px 12px;font-size:12px;color:#666">
        Order ID: ${order._id} · ${new Date().toLocaleString()}
      </div>
    </div>`
  )
}

// ── Stock alert emails ────────────────────────────────────────────────────────
async function sendOutOfStockEmail(product) {
  await send(
    process.env.ADMIN_EMAIL,
    `🚨 Out of Stock: ${product.name}`,
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff3f3;border:2px solid #ef4444;border-radius:12px">
      <h2 style="color:#ef4444">Product Out of Stock</h2>
      <p><strong>Product:</strong> ${product.name}</p>
      <p><strong>ID:</strong> ${product._id}</p>
      <p><strong>Stock:</strong> <span style="color:#ef4444;font-weight:bold">0</span></p>
      <p style="font-size:12px;color:#999">${new Date().toLocaleString()}</p>
    </div>`
  )
}

async function sendLowStockEmail(product, remaining) {
  const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || 5)
  await send(
    process.env.ADMIN_EMAIL,
    `⚠️ Low Stock: ${product.name} (${remaining} left)`,
    `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fffbeb;border:2px solid #f59e0b;border-radius:12px">
      <h2 style="color:#d97706">Low Stock Warning</h2>
      <p><strong>Product:</strong> ${product.name}</p>
      <p><strong>Remaining:</strong> <span style="color:#d97706;font-weight:bold">${remaining}</span></p>
      <p><strong>Threshold:</strong> ${threshold} units</p>
      <p style="font-size:12px;color:#999">${new Date().toLocaleString()}</p>
    </div>`
  )
}

// ── Push notifications ────────────────────────────────────────────────────────
async function sendPushNotification({ title, body, data = {} }) {
  const tokens = (() => { try { return JSON.parse(process.env.PUSH_TOKENS || '[]') } catch { return [] } })()
  if (!tokens.length) return
  const messages = tokens.map(token => ({ to: token, sound: 'default', title, body, data, priority: 'high', channelId: 'admin-alerts' }))
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
  } catch (e) { console.warn('Push notification failed:', e.message) }
}

module.exports = { sendOrderEmail, sendOutOfStockEmail, sendLowStockEmail, sendPushNotification }
