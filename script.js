const STORAGE_KEY = 'gpsCheckins';

const form = document.getElementById('checkin-form');
const nameInput = document.getElementById('checkin-name');
const statusEl = document.getElementById('checkin-status');
const historyEl = document.getElementById('checkin-history');
const button = document.getElementById('checkin-button');

function renderHistory() {
  const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  if (!items.length) {
    historyEl.innerHTML = '<p class="empty">ยังไม่มีข้อมูล check-in</p>';
    return;
  }

  historyEl.innerHTML = items
    .slice(0, 6)
    .map((item) => {
      const mapsLink = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
      return `
        <article class="history-item">
          <strong>${item.name}</strong>
          <p>${item.time}</p>
          <p>${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}</p>
          <a href="${mapsLink}" target="_blank" rel="noreferrer">เปิดบน Google Maps</a>
        </article>
      `;
    })
    .join('');
}

function saveCheckin(name, lat, lng) {
  const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newItem = {
    name,
    lat,
    lng,
    time: new Date().toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 10)));
  renderHistory();
  return newItem;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();

  if (!name) {
    statusEl.textContent = 'กรุณากรอกชื่อก่อนทำการ check-in';
    statusEl.className = 'status error';
    return;
  }

  button.disabled = true;
  button.textContent = 'กำลังค้นหาตำแหน่ง...';
  statusEl.textContent = 'กำลังขอสิทธิ์ตำแหน่งจากอุปกรณ์...';
  statusEl.className = 'status';

  if (!navigator.geolocation) {
    statusEl.textContent = 'เบราว์เซอร์ของคุณไม่รองรับ GPS';
    statusEl.className = 'status error';
    button.disabled = false;
    button.textContent = 'Check-in ด้วย GPS';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      saveCheckin(name, latitude, longitude);
      statusEl.textContent = `Check-in สำเร็จที่ ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      statusEl.className = 'status success';
      form.reset();
      button.disabled = false;
      button.textContent = 'Check-in ด้วย GPS';
    },
    (error) => {
      let message = 'ไม่สามารถดึงตำแหน่งได้';
      if (error.code === 1) {
        message = 'คุณปฏิเสธสิทธิ์การเข้าถึงตำแหน่ง กรุณาอนุญาตในเบราว์เซอร์';
      } else if (error.code === 2) {
        message = 'ไม่พบตำแหน่งในขณะนี้';
      } else if (error.code === 3) {
        message = 'คำขอเข้าถึงตำแหน่งเกินเวลา';
      }

      statusEl.textContent = message;
      statusEl.className = 'status error';
      button.disabled = false;
      button.textContent = 'Check-in ด้วย GPS';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
});

renderHistory();
