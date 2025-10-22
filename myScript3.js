
document.addEventListener("DOMContentLoaded", () => {
  let topZIndex = 1010;
  let popup3AutoCloseTid = null; // ✅ 예약완료 자동닫힘 타이머 ID (전역 관리)

  // 공통 안내창 (팝업 중앙) 유틸
  function showModalNotice(modalId, message, duration = 800){
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const mc = modal.querySelector(".modal-content");
    if (!mc) return;

    // 기존 오버레이 제거 후 새로 생성 (중복 방지)
    mc.querySelector(".notice-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "notice-overlay";
    overlay.innerHTML = `<div class="notice-box"><p class="notice-text">${message}</p></div>`;
    mc.appendChild(overlay);

    // 페이드아웃 후 제거
    setTimeout(()=>{
      const box = overlay.querySelector(".notice-box");
      box.classList.add("fade-out");
      setTimeout(()=> overlay.remove(), 220);
    }, duration);
  }
  window.showModalNotice = showModalNotice;

  // 공통: 특정 팝업 열기
  function openPopupById(id){
    const popup = document.getElementById(id);
    if (!popup) return;

    // ✅ popup3 오픈 전 안전 정리 & 리셋
    if (id === 'popup3') {
      if (popup3AutoCloseTid) { clearTimeout(popup3AutoCloseTid); popup3AutoCloseTid = null; }
      if (typeof window.resetPopup3StateToFirstPage === 'function') {
        window.resetPopup3StateToFirstPage();
      }
    }

    popup.classList.add("show");
    document.body.style.overflow = "hidden";
    popup.style.zIndex = ++topZIndex;
    const mc = popup.querySelector(".modal-content");
    if (mc) { mc.style.left = ""; mc.style.top = ""; mc.style.transform = ""; }
  }
  window.openPopupById = openPopupById;

  // 캐릭터 클릭 → 해당 팝업 열기
  document.querySelectorAll(".char-wrapper").forEach((char) => {
    char.addEventListener("click", () => {
      const popupId = char.dataset.popup;
      if (popupId) openPopupById(popupId);
    });
  });

  // 모달 클릭 시 z-index 상위
  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("mousedown", () => { 
        // CSS에서 !important를 제거해야 이 로직이 작동합니다.
        m.style.zIndex = ++topZIndex; 
    });
  });

  // 드래그: 타이틀바 한정
  document.querySelectorAll(".modal").forEach((modal) => {
    const content = modal.querySelector(".modal-content");
    const titlebar = modal.querySelector(".modal-titlebar");
    if (!content || !titlebar) return;

    let isDragging = false, startX, startY, origX, origY;

    titlebar.addEventListener("mousedown", (e) => {
      if ((e.target.closest("button") || e.target.closest("a")) || e.button !== 0) return;
      const r = content.getBoundingClientRect();
      origX = r.left; origY = r.top; startX = e.clientX; startY = e.clientY;
      isDragging = true; modal.style.zIndex = ++topZIndex; document.body.classList.add("dragging"); e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      content.style.left = `${origX + (e.clientX - startX)}px`;
      content.style.top  = `${origY + (e.clientY - startY)}px`;
      content.style.transform = "none";
    });
    window.addEventListener("mouseup", () => {
      if (isDragging){ isDragging=false; document.body.classList.remove("dragging"); }
    });
  });

  // 닫기 버튼
  document.querySelectorAll(".modal .close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal"); if (!modal) return;
      hardCloseModal(modal);
    });
  });

  /**
   * 팝업을 닫고 상태를 초기화하며 스크롤을 맨 위로 올립니다.
   * @param {HTMLElement} modalEl 
   */
  function hardCloseModal(modalEl){
    modalEl.classList.remove("show");

    // 팝업 내부 스크롤을 맨 위로 (✅ 스크롤을 가진 모든 컨테이너 초기화)
    const mc = modalEl.querySelector(".modal-content");
    if (mc) { mc.scrollTop = 0; }
    
    // 실제 스크롤바를 가진 요소 (popup-body 또는 popup3-container) 초기화
    const scrollContainer = modalEl.querySelector(".popup-body, .popup3-container");
    if (scrollContainer) { scrollContainer.scrollTop = 0; }


    // ✅ popup3 자동닫힘 타이머/상태 정리
    if (modalEl.id === "popup3") {
      if (popup3AutoCloseTid) { clearTimeout(popup3AutoCloseTid); popup3AutoCloseTid = null; }
      if (typeof window.resetPopup3StateToFirstPage === 'function') {
        window.resetPopup3StateToFirstPage(); // 다음 오픈 대비 항상 리셋
      }
    }

    // popup1(브랜드소개) 닫힐 때 초기화
    if (modalEl.id === "popup1") {
      if (typeof window.resetPopup1StateToFirstPage === 'function') {
        window.resetPopup1StateToFirstPage();
      }
    }

    // popup4(굿즈) 닫힐 때 초기화
    if (modalEl.id === "popup4") {
      if (typeof window.resetPopup4StateToFirstPage === 'function') {
        window.resetPopup4StateToFirstPage();
      }
    }

    // popup5(제품) 닫힐 때 초기화
    if (modalEl.id === "popup5") {
      if (typeof window.resetPopup5StateToFirstPage === 'function') {
        window.resetPopup5StateToFirstPage();
      }
    }

    // 모든 모달이 닫힌 경우 스크롤/ zIndex 초기화
    if (!document.querySelector(".modal.show")) {
      document.body.style.overflow = "";
      topZIndex = 1010;
    }
  }
  window.hardCloseModal = hardCloseModal;

  // Home 버튼
  document.getElementById("homeBtn")?.addEventListener("click",()=>{ window.location.href="index.html"; });

  /* ================= 팝업3: 컨설팅 예약 ================= */
  const popup3 = document.getElementById("popup3");
  const popup3Content = document.getElementById("popup3-content");
  const popup3NextBtn = document.getElementById("popup3-nextBtn");
  const reservationComplete = document.getElementById("reservation-complete");

  let currentPage = 0;
  let selectedDate = null;
  let selectedTime = null;
  let selectedStyleGlobal = null;

  const pages = [
    /* 0: 소개 */
    `
      <p class="title">
        <img src="img/icon2-2.png" alt="왼쪽 아이콘" class="icon-left" />
        컨설팅
        <img src="img/icon2.png"  alt="오른쪽 아이콘" class="icon-right" />
      </p>
      <p class="info">소요시간: 60분 <span class="divider">|</span> 장소: 치레이 오프라인 매장</p>
      <p class="quote">"모두가 주인공이 될 수 있는 메이크업 세계, 치레이에서 시작됩니다."</p>
      <p class="detail">
        치레이의 메이크업 컨설팅은 단순히 외모를 꾸미는 것이 아니라,<br>
        내면의 아름다움을 끌어내고 자신만의 독특한 스타일을<br>
        만들어가는 여정입니다.<br>
        <span class="spacer"></span>
        서브컬처 스타일부터 일상 속 새로운 나까지—<br>
        <span class="spacer"></span>
        수호천사들과 함께 당신만의 아름다움을 찾아보세요.
      </p>
      <div class="image-grid">
      <img src="img/Consulting.png" alt="상세이미지" class="Consulting" />
      </div>
    `,
    /* 1: 예약(캘린더) */
    `
      <div class="resv-head">
        <p class="title">
          <img src="img/icon2-2.png" alt="" class="icon-left" />
          컨설팅 예약
          <img src="img/icon2.png"   alt="" class="icon-right" />
        </p>
        <div class="resv-legend">
          <span><i class="dot dot-available"></i> 예약 가능</span>
          <span><i class="dot dot-closed"></i> 예약 불가능</span>
          <span><i class="dot dot-pending"></i> 오픈 예정</span>
        </div>
      </div>

      <div id="calendar" class="calendar">
        <div class="cal-header">
          <button class="cal-nav prev" aria-label="이전 달"><</button>
          <div class="cal-title"><span id="cal-year"></span>년 <span id="cal-month"></span>월</div>
          <button class="cal-nav next" aria-label="다음 달">></button>
        </div>
        <div class="cal-week">
          <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
        </div>
        <div id="cal-grid" class="cal-grid"></div>
      </div>

      <div id="timeSection" class="time-section" style="display:none;">
        <h3 class="time-title">시간 선택</h3>
        <div id="timeGrid" class="time-grid"></div>
      </div>

      <div class="calendar-next-wrap">
        <button id="calendarNextBtn" class="popup3-btn is-disabled" aria-disabled="true">다음</button>
      </div>
    `,
    /* 2: 마지막(스타일 선택) */
    `
    <div class="style-step">
      <p class="title">
        <img src="img/icon2-2.png" alt="왼쪽 아이콘" class="icon-left" />
        스타일 선택
        <img src="img/icon2.png" alt="오른쪽 아이콘" class="icon-right" />
      </p>

      <div class="style-head">
        <h3>당신의 스타일은 무엇인가요?</h3>
      </div>

      <div class="style-grid" id="styleGrid">
        <div class="style-card" data-style="cos"   aria-label="코스프레">
          <img class="style-img" src="img/C_k.png" alt="코스프레">
          <div class="style-name">코스프레</div>
        </div>
        <div class="style-card" data-style="garu"  aria-label="가루">
          <img class="style-img" src="img/C_gg.png" alt="가루">
          <div class="style-name">가루</div>
        </div>
        <div class="style-card" data-style="douin" aria-label="도우인">
          <img class="style-img" src="img/C_d.png" alt="도우인">
          <div class="style-name">도우인</div>
        </div>
        <div class="style-card" data-style="goth"  aria-label="고딕">
          <img class="style-img" src="img/C_g.png" alt="고딕">
          <div class="style-name">고딕</div>
        </div>
      </div>
    </div>
    `
  ];

  function showPopup3Page(index){
    const btn = popup3NextBtn;
    popup3Content.innerHTML = pages[index];
    btn.textContent = (index === pages.length-1) ? "예약" : "다음";

    if (index === 1) {
      btn.style.display = "none";
      selectedDate = null; selectedTime = null;
      setTimeout(initReservationCalendar, 0);
    } else {
      btn.style.display = "inline-block";
      if (index === 2) {
        btn.classList.add("is-disabled");
        btn.setAttribute("aria-disabled","true");
        selectedStyleGlobal = null;
        setTimeout(initStyleStep, 0);
      } else {
        btn.classList.remove("is-disabled");
        btn.setAttribute("aria-disabled","false");
      }
    }
  }

  // 최초 렌더
  showPopup3Page(currentPage);

  // 다음/예약 버튼
  popup3NextBtn.addEventListener("click", () => {
    if (currentPage === pages.length - 1) {
      if (!selectedStyleGlobal) { showModalNotice("popup3","스타일을 선택해 주세요."); return; }

      reservationComplete.style.display = "block";
      popup3NextBtn.style.display = "none";

      // ✅ 이전 타이머가 있으면 정리한 뒤 새로 설정
      if (popup3AutoCloseTid) { clearTimeout(popup3AutoCloseTid); popup3AutoCloseTid = null; }
      popup3AutoCloseTid = setTimeout(() => {
        popup3AutoCloseTid = null; // 발동 후 ID 초기화
        hardCloseModal(popup3);
      }, 1500);
      return;
    }
    if (currentPage < pages.length - 1) {
      currentPage++;
      showPopup3Page(currentPage);
    }
  });

  // 예약완료 닫기
  popup3.addEventListener("click",(e)=>{
    if(e.target && e.target.id==="reservation-closeBtn"){
      reservationComplete.style.display="none";
      if (popup3AutoCloseTid) { clearTimeout(popup3AutoCloseTid); popup3AutoCloseTid = null; } // ✅ 타이머 정리
      hardCloseModal(popup3);
    }
  });

  // 예약 데이터
  const BASE_YEAR = 2025;
  const BASE_MONTH = 10;
  function buildDateStatusForMonth(y, m){
    const ds = {}, pad2 = (n)=>String(n).padStart(2,"0");
    for(let d=1; d<=31; d++){
      const k = `${y}-${pad2(m)}-${pad2(d)}`;
      if (d <= 17) ds[k] = "closed";
      else if (d <= 24) ds[k] = "available";
      else ds[k] = "pending";
    }
    return ds;
  }
  const manualTimeStatus = {
    "2025-10-18": { "11:00":"available","12:00":"closed","13:00":"available","14:00":"available","15:00":"closed","16:00":"available","17:00":"available","18:00":"closed","19:00":"available","20:00":"available" },
    "2025-10-19": { "11:00":"available","12:00":"available","13:00":"closed","14:00":"available","15:00":"available","16:00":"closed","17:00":"available","18:00":"available","19:00":"closed","20:00":"available" },
    "2025-10-20": { "11:00":"closed","12:00":"available","13:00":"available","14:00":"closed","15:00":"available","16:00":"available","17:00":"closed","18:00":"available","19:00":"available","20:00":"available" },
    "2025-10-21": { "11:00":"available","12:00":"closed","13:00":"available","14:00":"available","15:00":"available","16:00":"closed","17:00":"available","18:00":"available","19:00":"available","20:00":"closed" },
    "2025-10-22": { "11:00":"available","12:00":"available","13:00":"available","14:00":"closed","15:00":"closed","16:00":"available","17:00":"available","18:00":"closed","19:00":"available","20:00":"available" },
    "2025-10-23": { "11:00":"closed","12:00":"available","13:00":"available","14:00":"available","15:00":"available","16:00":"available","17:00":"closed","18:00":"available","19:00":"available","20:00":"closed" },
    "2025-10-24": { "11:00":"available","12:00":"available","13:00":"closed","14:00":"available","15:00":"available","16:00":"available","17:00":"available","18:00":"closed","19:00":"available","20:00":"available" }
  };
  const resvConfig = {
    dateStatus: buildDateStatusForMonth(BASE_YEAR, BASE_MONTH),
    timeStatus: manualTimeStatus,
    initialYear: BASE_YEAR,
    initialMonth: BASE_MONTH
  };

  function monthCompare(y,m){
    if(y<BASE_YEAR) return -1; if(y>BASE_YEAR) return 1;
    if(m<BASE_MONTH) return -1; if(m>BASE_MONTH) return 1; return 0;
  }

  function updateNextVisual(){
    const nextB = document.getElementById("calendarNextBtn");
    if (!nextB) return;
    if (!selectedDate) {
      nextB.style.display = "none";
      nextB.classList.add("is-disabled");
      nextB.setAttribute("aria-disabled","true");
      return;
    }
    nextB.style.display = "inline-block";
    if (!selectedTime) {
      nextB.classList.add("is-disabled");
      nextB.setAttribute("aria-disabled","true");
    } else {
      nextB.classList.remove("is-disabled");
      nextB.setAttribute("aria-disabled","false");
    }
  }
  function hideTimes(){
    const sec = document.getElementById("timeSection"); const tg = document.getElementById("timeGrid");
    if (sec) sec.style.display = "none"; if (tg) tg.innerHTML = "";
  }

  function renderCalendar(year, month){
    const grid = document.getElementById("cal-grid");
    const yEl  = document.getElementById("cal-year");
    const mEl  = document.getElementById("cal-month");
    if (!grid) return;
    grid.innerHTML = ""; yEl.textContent = String(year); mEl.textContent = String(month);

    const comp = monthCompare(year, month);
    const first = new Date(year, month-1, 1);
    const startDay = first.getDay();
    const lastDate = new Date(year, month, 0).getDate();

    for (let i=0; i<startDay; i++){
      grid.appendChild(Object.assign(document.createElement("div"), { className: "cal-cell empty" }));
    }
    for (let d=1; d<=lastDate; d++){
      const cell = document.createElement("button");
      cell.type = "button"; cell.className = "cal-cell day";
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      let status;
      if (comp < 0) status = "closed";
      else if (comp > 0) status = "pending";
      else status = resvConfig.dateStatus[dateStr] || "available";
      cell.dataset.date = dateStr; cell.textContent = String(d);

      if (status === "pending"){
        cell.classList.add("pending");
        cell.addEventListener("click", () => showModalNotice("popup3","해당 날짜는 오픈 예정입니다."));
      } else if (status === "closed"){
        cell.classList.add("closed");
        cell.addEventListener("click", () => showModalNotice("popup3","해당 날짜는 예약이 불가능합니다."));
      } else {
        cell.classList.add("available");
        cell.addEventListener("click", () => {
          if (cell.classList.contains("selected")) {
            cell.classList.remove("selected"); selectedDate = null; selectedTime = null; hideTimes(); updateNextVisual(); return;
          }
          document.querySelectorAll(".cal-cell.day.selected").forEach(el => el.classList.remove("selected"));
          cell.classList.add("selected"); selectedDate = dateStr; selectedTime = null; renderTimes(dateStr);
          document.getElementById("timeSection").scrollIntoView({ behavior:"smooth", block:"start" }); updateNextVisual();
        });
      }
      grid.appendChild(cell);
    }
    updateNextVisual();
  }

  function renderTimes(dateStr){
    const sec = document.getElementById("timeSection"); const tg = document.getElementById("timeGrid");
    if (!sec || !tg) return;
    const [y,m] = dateStr.split("-").map(Number);
    if (monthCompare(y,m) !== 0){ hideTimes(); return; }

    sec.style.display = "block"; tg.innerHTML = "";
    const ordered = ["11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
    const map = resvConfig.timeStatus[dateStr] || {};
    ordered.forEach((time) => {
      const st = map[time] || "closed";
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "time-btn"; btn.textContent = time;
      if (st === "closed"){
        btn.classList.add("closed");
        btn.addEventListener("click", () => showModalNotice("popup3","해당 시간은 예약이 불가능합니다."));
      } else {
        btn.classList.add("available");
        btn.addEventListener("click", () => {
          if (btn.classList.contains("selected")){ btn.classList.remove("selected"); selectedTime = null; updateNextVisual(); return; }
          document.querySelectorAll(".time-btn.selected").forEach(el=>el.classList.remove("selected"));
          btn.classList.add("selected"); selectedTime = time; updateNextVisual();
        });
      }
      tg.appendChild(btn);
    });
    updateNextVisual();
  }

  function initReservationCalendar(){
    popup3NextBtn && (popup3NextBtn.style.display = "none");
    selectedDate = null; selectedTime = null;

    let y = resvConfig.initialYear  || new Date().getFullYear();
    let m = resvConfig.initialMonth || (new Date().getMonth()+1);
    renderCalendar(y,m);

    document.querySelector(".cal-nav.prev")?.addEventListener("click", () => { m--; if (m===0){ m=12; y--; } renderCalendar(y,m); });
    document.querySelector(".cal-nav.next")?.addEventListener("click", () => { m++; if (m===13){ m=1;  y++; } renderCalendar(y,m); });

    const localNext = document.getElementById("calendarNextBtn");
    localNext?.addEventListener("click", () => {
      if (!selectedDate){ showModalNotice("popup3","날짜를 선택해 주세요."); return; }
      if (!selectedTime){ showModalNotice("popup3","시간을 선택해 주세요."); return; }
      currentPage++; showPopup3Page(currentPage);
    });

    updateNextVisual();
  }

  function initStyleStep(){
    const cards = Array.from(document.querySelectorAll(".style-card"));
    const setReserveState = () => {
      if (selectedStyleGlobal) {
        popup3NextBtn.classList.remove("is-disabled");
        popup3NextBtn.setAttribute("aria-disabled","false");
      } else {
        popup3NextBtn.classList.add("is-disabled");
        popup3NextBtn.setAttribute("aria-disabled","true");
      }
    };
    setReserveState();
    cards.forEach(card => {
      card.addEventListener("click", () => {
        if (card.classList.contains("selected")) {
          card.classList.remove("selected");
          selectedStyleGlobal = null;
          setReserveState(); return;
        }
        cards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedStyleGlobal = card.dataset.style || null;
        setReserveState();
      });
    });
  }

  /** 팝업 3 (컨설팅 예약) 상태를 초기 페이지로 리셋합니다. */
  function resetPopup3StateToFirstPage(){
    // ✅ 자동닫힘 타이머도 함께 초기화
    if (popup3AutoCloseTid) { clearTimeout(popup3AutoCloseTid); popup3AutoCloseTid = null; }
    currentPage = 0; selectedDate = null; selectedTime = null; selectedStyleGlobal = null;
    reservationComplete.style.display = "none";
    popup3.querySelector(".notice-overlay")?.remove();
    showPopup3Page(currentPage);
    // 스크롤 위로
    const mc = popup3.querySelector(".modal-content");
    if (mc) mc.scrollTop = 0;
    const pb = popup3.querySelector(".popup3-container");
    if (pb) pb.scrollTop = 0;
  }
  // 전역 노출
  window.resetPopup3StateToFirstPage = resetPopup3StateToFirstPage;

  /* ================= 팝업2: 오프라인 매장 (지도/복사/휠) ================= */
  const ROAD_ADDR = '서울 마포구 잔다리로 30';
  const FLOOR_INFO = ', 1층';
  const JIBEON_ADDR = '서울 마포구 서교동 368-4';

  function renderTitle(label){
    return `
      <p class="title">
        <img src="img/icon2-2.png" alt="" class="icon-left" />
        ${label}
        <img src="img/icon2.png"   alt="" class="icon-right" />
      </p>
    `;
  }

  function renderOfflinePopup(){
    const body = document.querySelector('#popup2 .popup-body');
    if (!body) return;
    const q = encodeURIComponent(ROAD_ADDR);
    const mapSrc = `https://www.google.com/maps?q=${q}&hl=ko&z=16&output=embed`;
    const COPY_TEXT = `${ROAD_ADDR} ${FLOOR_INFO}`.trim();

    body.classList.add('offline-body');
    body.innerHTML = `
      <div class="content-grid">
        ${renderTitle('오프라인 매장')}
        <div class="map-wrap">
          <iframe class="map-iframe" title="치레이 오프라인 매장 지도"
                  loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                  src="${mapSrc}"></iframe>
        </div>
        <div class="address-box">
          <div class="address-line">
            <strong>${ROAD_ADDR}${FLOOR_INFO}</strong>
            ${JIBEON_ADDR ? `<div style="margin-top:6px; font-size:13px; opacity:.85;">지번: ${JIBEON_ADDR}</div>` : ''}
          </div>
          <div class="address-actions">
            <a class="map-link" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${q}">지도로 열기</a>
            <button type="button" class="copy-addr-btn" data-copy="${COPY_TEXT}">주소 복사</button>
          </div>
        </div>
      </div>
    `;

    // 지도에 마우스 올리면 스크롤은 지도에
    const wrap = body.querySelector('.map-wrap');
    wrap.addEventListener('mouseenter', () => wrap.classList.add('map-live'));
    wrap.addEventListener('mouseleave', () => wrap.classList.remove('map-live'));
  }

  // 주소 복사 → 팝업 중앙 안내창으로 노출
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-addr-btn');
    if (!btn) return;
    const text = btn.dataset.copy || '';
    navigator.clipboard.writeText(text).then(() => {
      // ✅ 중앙 안내
      showModalNotice('popup2', '주소가 복사되었습니다.');
    });
  });

  // 팝업2는 열릴 때마다 안전 렌더
  document.querySelector('[data-popup="popup2"]')?.addEventListener('click', renderOfflinePopup);
  // 처음 로드 시 1회 렌더(원하면 주석 처리 가능)
  renderOfflinePopup();

  /* ================= 팝업1: 브랜드 소개 ================= */
function renderBrandPopup(){
  const body = document.querySelector('#popup1 .popup-body');
  if (!body) return;
  body.classList.add('brand-body');
  body.innerHTML = `
    <div class="content-grid">
      ${renderTitle('치레이란?')}

      <div class="brand-logo">
        <img src="img/logo.png" alt="치레이 로고" loading="lazy" />
      </div>

      <p class="quote">어서 오세요. 모두가 주인공이 되는 메이크업 세계, 치레이에.</p>

      <div class="p5-desc">
        이곳은 현실과 가상세계를 잇는 비밀스러운 다방.<br>
        그 안에는 당신의 빛을 찾아줄 다섯 명의 조력자가 기다리고 있습니다.
        <span class="spacer"></span>
         <img class="style-img" src="img/C_r.png" alt="레이">
        다방의 주인장이자 메이크업 아티스트 <strong>레이</strong>는<br>
        당신 안에 숨은 색을 깨워주는 안내자입니다.
        <span class="spacer"></span>
        <span class="spacer"></span>

        그리고 그 곁에는 각기 다른 매력을 지닌 네 명의 수호천사들이 함께하죠 —<br>
      <div class="style-row">
        <img class="style-img" src="img/C_k.png" alt="코스프레">
        <img class="style-img" src="img/C_gg.png" alt="갸루">
        <img class="style-img" src="img/C_d.png" alt="도우인">
        <img class="style-img" src="img/C_g.png" alt="고딕">
      </div>
        코스프레 메이크업의 수호천사, <strong>미카.</strong><br>
        갸루 메이크업의 수호천사,<strong>이치고.</strong><br>
        도우인 메이크업의 수호천사, <strong>마오.</strong><br>
        고딕 메이크업의 수호천사, <strong>루나.</strong>
        <span class="spacer"></span>
        <span class="spacer"></span>

        이들은 메이크업을 단순한 화장이 아닌,<br>
        <strong>‘나를 찾아가는 여정’</strong>으로 바라봅니다.<br>
        감정과 개성이 색으로 번져가는 과정 속에서,<br>
        당신은 스스로의 아름다움을 발견할 수 있습니다.
        <span class="spacer"></span>

        <strong>그럼 치레이에 방문하신걸 환영합니다. 주인공님.</strong>
      </div>
    </div>
  `;
}

  document.querySelector('[data-popup="popup1"]')?.addEventListener('click', renderBrandPopup);
  renderBrandPopup();

  // 팝업1 리셋 함수 (닫힐 때 사용)
  function resetPopup1StateToFirstPage(){
    renderBrandPopup();
    const modal = document.getElementById('popup1');
    const mc = modal?.querySelector('.modal-content');
    if (mc) mc.scrollTop = 0;
    const pb = modal?.querySelector('.popup-body');
    if (pb) pb.scrollTop = 0; 
  }
  window.resetPopup1StateToFirstPage = resetPopup1StateToFirstPage;

  /* ======================= 팝업5: 제품 ======================= */
(function () {
  const popup5Body = document.getElementById('popup5-body');

  // 공통 타이틀 (기존 .title 스타일 그대로 사용)
  const headerHTML = `
    <p class="title">
      <img src="img/icon2-2.png" alt="" class="icon-left" />
      제품
      <img src="img/icon2.png"  alt="" class="icon-right" />
    </p>
  `;

  // 첫 화면(사계절 컬렉션 선택)
  function renderList() {
    popup5Body.innerHTML = `
      ${headerHTML}
      <p class="title p5-subtitle">사계절 컬렉션</p>
      <div class="p5-desc">
        치레이의 시즌 컬렉션은 사계절마다 디저트 모양의 새로운 제품이 공개됩니다.<br>
        각 컬렉션에는 세계관 속 캐릭터의 무드에 맞춘 아이 팔레트, 블러셔, 립 제품이 하나씩 포함되어 있으며,<br>
        세 가지를 함께 사용하면 마치 게임 속 ‘세트 아이템’처럼 완성도 높은 메이크업 룩이 완성됩니다.<br>
        단품으로도 매력적이지만, 세트를 모두 모았을 때 비로소 열리는 캐릭터의 시그니처 스타일을 경험해보세요.
      </div>

      <div class="p5-grid">
        <button class="p5-card" data-key="spring">
          <img src="img/prod_eye_spring.png" alt="봄" class="p5-card-img" />
          <div class="p5-card-name">봄</div>
        </button>
        <button class="p5-card" data-key="summer">
          <img src="img/prod_eye_summer.png" alt="여름" class="p5-card-img" />
          <div class="p5-card-name">여름</div>
        </button>
        <button class="p5-card" data-key="autumn">
          <img src="img/prod_eye_autumn.png" alt="가을" class="p5-card-img" />
          <div class="p5-card-name">가을</div>
        </button>
        <button class="p5-card" data-key="winter">
          <img src="img/prod_eye_winter.png" alt="겨울" class="p5-card-img" />
          <div class="p5-card-name">겨울</div>
        </button>
      </div>
    `;

    popup5Body.querySelectorAll('.p5-card').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const key = btn.dataset.key;
        if (key === 'spring') renderSpringDetail();
        else if (key === 'summer') renderSummerDetail();
        else if (key === 'autumn') renderAutumnDetail();
        else if (key === 'winter') renderWinterDetail();
        else renderComingSoon(key);
      });
    });
  }

  // 상세페이지(봄) – 요청 레이아웃 그대로 (영상 → QR 이미지)
  function renderSpringDetail(){
    popup5Body.innerHTML = `
      ${headerHTML}
      <div class="p5-detail-wrap">
        <div class="p5-collection-title2">벚꽃 컬렉션</div>
        <img src="img/season_spring.png" alt="벚꽃" class="p5-hero-c" />

        <div class="p5-block">
         <div class="p5-collection-title">컨셉</div>
          <p>벚꽃이 흩날리는 사랑스러운 봄의 한낮에서 영감을 받은 컬렉션입니다.<br>
          벚꽃처럼 따스하고 달콤한 공기 속에서, 당신의 얼굴에도 <br> 봄이 피어나는 듯한 생기를 전해드립니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">컬러 톤</div>
          <p>봄 웜톤 스타일의 라이트 코랄 핑크톤으로<br>
           발그레한 색감으로 생기 있는 사랑스러움을 전달합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">시그니처 & 수호천사</div>
          <p>대표 디저트는 벚꽃 마카롱이며,<br>
          컬렉션을 담당하는 천사는 갸루 수호천사 <strong>이치고</strong>입니다.</p>
        </div>

        <div class="p5-collection-title2">제품 구성</div>

        <div class="p5-item">
          <img src="img/prod_eye_spring.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">아이 팔레트 — 봄날의 벚꽃 아이팔레트</div>
              <p>벚꽃 우유 크림: 라이트 핑크 코랄 베이스 컬러로 눈가에 화사함을 더합니다.
              <br>벚꽃 브라운: 소프트 핑크 브라운 음영으로 부드러운 깊이를 표현합니다.
              <br>벚꽃잼: 코랄 핑크 포인트 컬러로 생기를 살립니다.
              <br>벚꽃비: 핑크 화이트 오팔 글리터로 눈가에 은은한 반짝임을 더합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_blush_spring.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">블러셔 — 봄바람 발그레 치크</div>
            <p>라이트 핑크 코랄 톤으로,  <br> 봄 햇살에 물든 듯한 따뜻한 혈색을 표현합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_lip_spring.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">립 — 봄날의 젤리밤</div>
            <p>촉촉한 글로우 텍스처의 코랄 핑크 립으로, <br> 입술에 투명한 윤기를 더해 생기 넘치는 봄 무드를 완성합니다.</p>
          </div>
        </div>

        <div class="p5-collection-title2">벚꽃 컬렉션 QR</div>
        <div class="p5-video">
          <img src="img/qrcode_spring.png" alt="벚꽃 컬렉션 QR" class="p5-qrcode" />
          <div class="p5-item-text">
          <p>스캔하여 영상을 확인하세요.</p>
          </div>
        </div>

        <div class="p5-back">
          <button class="popup5-btn" id="p5-back-btn">뒤로 가기</button>
        </div>
      </div>
    `;

    document.getElementById('p5-back-btn')?.addEventListener('click', renderList);
  }

  // 여름 상세페이지 (영상 → QR)
  function renderSummerDetail(){
    popup5Body.innerHTML = `
      ${headerHTML}
      <div class="p5-detail-wrap">
        <div class="p5-collection-title">소다 컬렉션</div>
        <img src="img/season_summer.png" alt="소다" class="p5-hero-c" />

        <div class="p5-block">
          <div class="p5-collection-title">컨셉</div>
          <p>뜨거운 여름날 물방울이 맺힌 블루소다의 청량함을 표현한 컬렉션입니다.<br>
          여름 쿨 블루·화이트톤으로 시원하고 맑은 무드를 연출합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">컬러톤</div>
          <p>여름 쿨 스타일의 블루·화이트 조합으로<br> 청량하고 맑은 톤을 사용합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">시그니처 & 수호천사</div>
          <p>대표 디저트는 블루소다이며,<br>
          컬렉션을 담당하는 천사는 코스프레 수호천사 <strong>미카</strong>입니다.</p>
        </div>

        <div class="p5-collection-title2">제품 구성</div>

        <div class="p5-item">
          <img src="img/prod_eye_summer.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">아이 팔레트 — 한낮의 블루소다 아이팔레트</div>
              <p>밀크 블루: 파스텔 블루 베이스로 전체적으로 부드러운 전체톤을 만듭니다.
              <br>그늘 속 블루: 블루 그레이 음영으로 깊이를 더합니다.
              <br>소다 휘핑: 화이트 포인트로 하이라이트를 넣습니다.
              <br>소다 얼음: 화이트·블루 쉬머 펄로 화려함을 더합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_blush_summer.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">블러셔 — 한낮의 익은 볼 치크</div>
            <p>쿨한 레드 컬러로, 여름 햇빛에 붉어진듯<br>자연스러운 혈색을 더해 균형을 맞춰줍니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_lip_summer.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">립 — 한낮의 맑은 체리 틴트</div>
            <p>쿨 MLBB 레드 계열의 틴트로<br> 자연스러운 채도와 맑은 생기를 제공합니다.</p>
          </div>
        </div>

        <div class="p5-collection-title2">소다 컬렉션 QR</div>
         <div class="p5-video">
          <img src="img/qrcode_summer.png" alt="소다 컬렉션 QR" class="p5-qrcode" />
          <div class="p5-item-text">
          <p>스캔하여 영상을 확인하세요.</p>
          </div>
        </div>

        <div class="p5-back">
          <button class="popup5-btn" id="p5-back-btn-summer">뒤로 가기</button>
        </div>
      </div>
    `;
    document.getElementById('p5-back-btn-summer')?.addEventListener('click', renderList);
  }

  // 가을 상세페이지 (영상 → QR)
  function renderAutumnDetail(){
    popup5Body.innerHTML = `
      ${headerHTML}
      <div class="p5-detail-wrap">
        <div class="p5-collection-title">밤 컬렉션</div>
        <img src="img/season_autumn.png" alt="밤" class="p5-hero-c" />

        <div class="p5-block">
          <div class="p5-collection-title">컨셉</div>
          <p>포근하고 묵직한 가을 밤 공기를 닮은 컬렉션입니다.<br>
          딥하고 고혹적인 가을 음영으로 강렬하면서도 따뜻한 분위기를 전달합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">컬러 톤</div>
          <p>가을 웜톤 스타일의 딥 브라운 계열로, <br>거의 블랙에 가까운 다크한 무드를 사용합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">시그니처 & 수호천사</div>
          <p>대표 디저트는 몽블랑이며,<br>
          컬렉션을 담당하는 천사는 고딕 수호천사 <strong>루나</strong>입니다.</p>
        </div>

        <div class="p5-collection-title">제품 구성</div>

        <div class="p5-item">
          <img src="img/prod_eye_autumn.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">아이 팔레트 — 가을 밤의 몽블랑 아이팔레트</div>
              <p>마롱 크림: 연브라운 베이스로 전체 톤을 잡아줍니다.
              <br>딥 로즈 마롱: 딥 퍼플 브라운 음영으로 깊은 눈매를 만듭니다.
              <br>마롱 블랑: 연 브라운 포인트로 자연스러운 명암을 줍니다.
              <br>마롱 슈가: 골드 브라운 쉬머 펄로 은은한 반짝임을 더합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_blush_autumn.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">블러셔 — 가을 밤의 마롱 베일 치크</div>
            <p>딥한 로즈 브라운 컬러로 <br>가을의 포근한 무드를 강조합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_lip_autumn.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">립 — 가을 밤의 마롱 글레이즈 틴트</div>
            <p>딥한 퍼플 브라운 계열의 틴트로 <br>고혹적인 분위기를 완성합니다.</p>
          </div>
        </div>

        <div class="p5-collection-title2">밤 컬렉션 QR</div>
         <div class="p5-video">
          <img src="img/qrcode_autumn.png" alt="밤 컬렉션 QR" class="p5-qrcode" />
          <div class="p5-item-text">
          <p>스캔하여 영상을 확인하세요.</p>
          </div>
        </div>

        <div class="p5-back">
          <button class="popup5-btn" id="p5-back-btn-autumn">뒤로 가기</button>
        </div>
      </div>
    `;
    document.getElementById('p5-back-btn-autumn')?.addEventListener('click', renderList);
  }

  // 겨울 상세페이지 (영상 → QR)
  function renderWinterDetail(){
    popup5Body.innerHTML = `
      ${headerHTML}
      <div class="p5-detail-wrap">
        <div class="p5-collection-title">슈가 컬렉션</div>
        <img src="img/season_winter.png" alt="슈가" class="p5-hero-c" />

        <div class="p5-block">
          <div class="p5-collection-title">컨셉</div>
          <p>하얀 눈이 쌓인 딸기 밭 속의 눈 요정이 연상되는 컬렉션입니다.<br>
          차분하고 몽환적인 핑크·로즈·화이트 톤으로 요정같은 무드를 연출합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">컬러 톤</div>
          <p>쿨 뮤트 핑크·로즈·화이트 중심의 팔레트로<br> 화려한듯 몽환적인 감성을 표현합니다.</p>
        </div>

        <div class="p5-block">
          <div class="p5-collection-title">시그니처 & 수호천사</div>
          <p>대표 디저트는 슈가 파우더가 듬뿍 올라간 딸기 바닐라 컵케이크이며,<br>
          컬렉션을 담당하는 천사는 도우인 수호천사 <strong>마오</strong>입니다.</p>
        </div>

        <div class="p5-collection-title">제품 구성</div>

        <div class="p5-item">
          <img src="img/prod_eye_winter.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">아이 팔레트 — 눈요정의 슈가 컵케이크 아이팔레트</div>
              <p>스트로베리 밀크: 화이트 핑크 베이스로 부드러운 톤을 제공합니다.
              <br>슈가 브라운: 소프트 핑크 브라운 음영으로 은은한 깊이를 더합니다.
              <br>크림 베리: 로즈 포인트로 얼굴에 색감을 얹어줍니다.
              <br>슈가 파우더: 화이트 글리터로 반짝이는 포인트를 연출합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_blush_winter.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">블러셔 — 눈요정의 딸기 크림 치크</div>
            <p>맑은 쿨핑크 컬러로 <br>은은하고 몽환적인 혈색을 표현합니다.</p>
          </div>
        </div>

        <div class="p5-item">
          <img src="img/prod_lip_winter.png" alt="" class="p5-item-icon" />
          <div class="p5-item-text">
            <div class="p5-item-title">립 — 눈요정의 러브잼 글로스</div>
            <p>뮤트한 핑크 브릭 글로스로 <br>부드러운 광택과 색감을 제공합니다.</p>
          </div>
        </div>

        <div class="p5-collection-title2">슈가 컬렉션 QR</div>
         <div class="p5-video">
          <img src="img/qrcode_winter.png" alt="슈가 컬렉션 QR" class="p5-qrcode" />
          <div class="p5-item-text">
          <p>스캔하여 영상을 확인하세요.</p>
          </div>
        </div>

        <div class="p5-back">
          <button class="popup5-btn" id="p5-back-btn-winter">뒤로 가기</button>
        </div>
      </div>
    `;
    document.getElementById('p5-back-btn-winter')?.addEventListener('click', renderList);
  }

  // 여름/가을/겨울은 동일 레이아웃 유지 + 준비중 표기
  function renderComingSoon(seasonKey){
    const name = seasonKey==='summer'?'여름 컬렉션':seasonKey==='autumn'?'가을 컬렉션':'겨울 컬렉션';
    popup5Body.innerHTML = `
      ${headerHTML}
      <div class="p5-detail-wrap">
        <div class="p5-collection-title">${name}</div>
        <div class="p5-coming">상세페이지가 곧 공개됩니다.</div>
        <div class="p5-back">
          <button class="popup5-btn" id="p5-back-btn">뒤로 가기</button>
        </div>
      </div>
    `;
    document.getElementById('p5-back-btn')?.addEventListener('click', renderList);
  }

  // 팝업5 열릴 때마다 목록부터
  function boot(){ renderList(); }
  document.querySelector('[data-popup="popup5"]')?.addEventListener('click', boot);
  boot();

  // 팝업5 리셋 함수 (닫힐 때)
  function resetPopup5StateToFirstPage(){
    boot();
    const modal = document.getElementById('popup5');
    const mc = modal?.querySelector('.modal-content');
    if (mc) mc.scrollTop = 0;
    const pb = modal?.querySelector('#popup5-body');
    if (pb) pb.scrollTop = 0; // 팝업 5 본문 스크롤 초기화
  }
  window.resetPopup5StateToFirstPage = resetPopup5StateToFirstPage;

})(); // popup5 IIFE 끝

  /* ================= 팝업4: 굿즈 페이지 ================= */
function renderGoodsPopup() {
  const body = document.querySelector('#popup4 .popup-body');
  if (!body) return;

  body.classList.add('goods-body');
  body.innerHTML = `
    <div class="goods-wrap">
      <p class="title">
        <img src="img/icon2-2.png" alt="" class="icon-left" />
        굿즈
        <img src="img/icon2.png" alt="" class="icon-right" />
      </p>
      <p class="goods-desc">
        치레이의 세계관 속 캐릭터와 메이크업 감성을 담은 오리지널 굿즈입니다.<br>
        수호천사들의 매력을 일상 속에서도 느껴보세요.
      </p>

      <div class="goods-item">
        <img src="img/goods_carabiner.png" alt="카라비너" class="goods-img" />
        <div class="p5-block">
          <div class="p5-collection-title">카라비너</div>
          <p>치레이의 심볼로 제작된 아크릴 카라비너입니다.<br>
          화장품 파우치나 가방에 포인트로 달 수 있으며, 화장품을 키링처럼 달고 다닐 수 있게 도와줍니다.</p>
        </div>
      </div>

      <div class="goods-item">
        <img src="img/goods_badge.png" alt="핀뱃지" class="goods-img" />
        <div class="p5-block">
          <div class="p5-collection-title">핀 뱃지</div>
          <p>치레이의 캐릭터로 제작된 미니 뱃지 세트입니다.<br>
          재킷, 가방, 파우치 등에 부착하여 개성을 표현할 수 있습니다.</p>
        </div>
      </div>

      <div class="goods-item">
        <img src="img/goods_pouch.png" alt="파우치" class="goods-img" />
        <div class="p5-block">
          <div class="p5-collection-title">화장품 파우치</div>
          <p>치레이의 수호천사가 새겨진 파우치로, 메이크업 소품을 깔끔하게 보관할 수 있습니다.<br>
          부드러운 소재감과 은은한 색감으로 실용성과 감성을 모두 담았습니다.</p>
        </div>
      </div>

      <div class="goods-item">
        <img src="img/goods_mirror.png" alt="거울 키링" class="goods-img" />
       <div class="p5-block">
          <div class="p5-collection-title">거울 키링</div>
          <p>아이팔레트 디자인에서 영감을 얻은 미니 거울 키링입니다.<br>
          외출 시 가볍게 들고 다니며 언제든 나의 빛을 확인할 수 있습니다.</p>
        </div>
      </div>

      <div class="goods-item">
        <img src="img/goods_k.png" alt="쿠션 키링" class="goods-img" />
        <div class="p5-block">
          <div class="p5-collection-title">쿠션 키링</div>
          <p>일상에서도 수호천사들과 함께 할 수 있는 쿠션 키링입니다.<br>
          외출 시 언제나 나의 수호천사와 함께 할 수 있습니다.</p>
        </div>
      </div>
    </div>
  `;
}
document.querySelector('[data-popup="popup4"]')?.addEventListener('click', renderGoodsPopup);
renderGoodsPopup();

// 팝업4 리셋 함수 (닫힐 때)
function resetPopup4StateToFirstPage(){
  renderGoodsPopup();
  const modal = document.getElementById('popup4');
  const mc = modal?.querySelector('.modal-content');
  if (mc) mc.scrollTop = 0;
  const pb = modal?.querySelector('.popup-body');
  if (pb) pb.scrollTop = 0; // 팝업 4 본문 스크롤 초기화
}
window.resetPopup4StateToFirstPage = resetPopup4StateToFirstPage;

/* ================= 자동 오픈 (URL ?open=popup3 또는 세션키) ================= */
  const params = new URLSearchParams(window.location.search);
  const want = params.get("open") || sessionStorage.getItem('chirei_open');
  if (want === 'popup3') {
    sessionStorage.removeItem('chirei_open');
    openPopupById('popup3');
    if (params.get("open")) {
      history.replaceState({}, document.title, window.location.pathname);
    }
  }
});

// 비활성 next/예약 클릭 안내 (팝업 중앙)
document.addEventListener('click', (e) => {
  // 캘린더 단계 local next
  const calNext = e.target.closest('#calendarNextBtn.is-disabled');
  if (calNext) {
    const msg = (document.querySelector('.time-btn.selected'))
      ? '날짜를 선택해 주세요.'
      : (document.querySelector('.cal-cell.day.selected') ? '시간을 선택해 주세요.' : '날짜를 선택해 주세요.');
    showModalNotice('popup3', msg);
    e.preventDefault();
    return;
  }

  // 마지막 단계 전역 예약 버튼
  const popup3Next = e.target.closest('#popup3-nextBtn.is-disabled');
  if (popup3Next) {
    showModalNotice('popup3', '스타일을 선택해 주세요.');
    e.preventDefault();
  }
});