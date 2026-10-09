import fetch from 'node-fetch';

const ADMIN_CHAT_ID = "7948579574"; 
const BOT_TOKEN = "8854457716:AAEca3kyrRii_0EYrtbZ_62p0zXQlsbnNAE";

global.pendingRecharges = global.pendingRecharges || {};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const update = req.body;

    if (req.body.action === 'submit_recharge') {
      const { phone, amt, utr, name, imgUrl } = req.body;
      const reqId = Date.now();
      
      global.pendingRecharges[reqId] = { phone, amt, utr, name };

      const caption = `🔔 नया रिचार्ज अनुरोध!\n📱 यूजर: ${phone}\n👤 नाम: ${name}\n💰 राशि: ₹${amt}\n🔢 UTR: ${utr}`;
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          photo: imgUrl,
          caption: caption,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Approve", callback_data: `app_${reqId}` },
                { text: "❌ Disapprove", callback_data: `dis_${reqId}` }
              ]
            ]
          }
        })
      });

      return res.status(200).json({ success: true });
    }

    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const [action, reqId] = data.split('_');
      const reqData = global.pendingRecharges[reqId];

      if (!reqData) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id, text: "यह रिक्वेस्ट पहले ही प्रोसेस हो चुकी है!" })
        });
        return res.status(200).json({ ok: true });
      }

      if (action === 'app') {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            message_id: callbackQuery.message.message_id,
            caption: `✅ अप्रूव्ड (Approved)\n📱 यूजर: ${reqData.phone}\n💰 राशि: ₹${reqData.amt}\n🔢 UTR: ${reqData.utr}`
          })
        });
      } else {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            message_id: callbackQuery.message.message_id,
            caption: `❌ डिस्अप्रूव्ड (Disapproved)\n📱 यूजर: ${reqData.phone}\n💰 राशि: ₹${reqData.amt}`
          })
        });
      }

      delete global.pendingRecharges[reqId];
      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  }
  
  return res.status(200).json({ message: "Server is running!" });
}
