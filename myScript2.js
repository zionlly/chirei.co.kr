document.addEventListener('DOMContentLoaded', () => {
  const typewriter = document.getElementById('typewriter');
  const answerBox  = document.getElementById('answerBox');
  const nextBtn    = document.getElementById('nextBtn');

  // 인트로 문구
  const introTexts = [
    `어서 오세요, 치레이에 오신 걸 환영해요.<br>당신은... 처음 뵙는 손님이군요? 후훗, 반가워요.`,
    `저는 이 다방의 주인장이자, 메이크업 아티스트 레이라고 해요.<br>괜찮으시다면, 간단한 취향 테스트부터 시작해도 될까요?`,
    `편하게 생각하셔도 좋아요. 당신과 가장 잘 어울리는 수호천사를 소개해드릴 수 있답니다.<br>그럼 시작해볼까요? 편하게 질문을 읽고 가장 끌리는 답변에 응답해주세요.`
  ];

  // 질문/답변
  const questions = [
    { q: "메이크업 하는 이유가 무엇이라고 생각하시나요?",
      a: ["반짝 빛나게 꾸미고 싶어서","화려하고 쿨한 미녀가 되고 싶어서","캐릭터로 변신하고 싶어서","비밀스러운 분위기를 원해서"],
      t: ["gal","dou","cos","got"] },
    { q: "딱 하나의 메이크업 제품을 쓸 수 있다면?",
      a: ["블러셔","속눈썹","아이라인","립"],
      t: ["gal","dou","cos","got"] },
    { q: "가장 자주 입는 옷 스타일은?",
      a: ["러블리하고 키치","화려하고 샤랄라","개성있는 스타일","다크하고 펑크"],
      t: ["gal","dou","cos","got"] },
    { q: "메이크업할 때 듣고 싶은 음악은?",
      a: ["소녀 감성 노래","클래식","만화 주제가","록"],
      t: ["gal","dou","cos","got"] },
    { q: "당신을 동물에 비유한다면?",
      a: ["토끼","백조","공작새","검은 고양이"],
      t: ["gal","dou","cos","got"] },
    { q: "카메라를 켠다면 어디서?",
      a: ["인형뽑기방","몽환적인 전시회","이벤트 부스","어두운 골목"],
      t: ["gal","dou","cos","got"] },
    { q: "지금 당신을 한 단어로 표현한다면?",
      a: ["러블리","몽환적인","화려한","다크"],
      t: ["gal","dou","cos","got"] },
  ];

  // 결과 (detail 뒤 2줄은 type별 common으로 분리, 공용 CTA는 cta)
  const results = {
    gal: {
      intro: `테스트가 끝났네요. 고생하셨어요.<br>이제 결과를 바탕으로, 당신과 가장 잘 어울리는 수호천사를 소개해드릴게요.`,
      detail: `당신은 갸루 타입이 가장 잘 어울리는 분이네요.<br>보는 것만으로도 주변을 환하게 만드는, 햇살 같은 존재죠.`,
      common: `핑크빛 블러셔와 반짝이는 글리터, 그리고 키치한 감성이 특히 잘 어울려요.<br>이런 당신에게는 갸루 수호천사 이치고가 당신의 사랑스러운 에너지를 더욱 빛나게 만들어줄 거랍니다.`
    },
    dou: {
      intro: `테스트가 끝났네요. 고생하셨어요.<br>이제 결과를 바탕으로, 당신과 가장 잘 어울리는 수호천사를 소개해드릴게요.`,
      detail: `당신은 도우인 타입이 가장 잘 어울리는 분이군요.<br>마치 꿈속을 거니는 요정처럼, 묘하게 사람을 끌어당기는 매력을 지니고 있어요.`,
      common: `섬세하게 반짝이는 아이섀도우, 길고 화려한 속눈썹….<br>이런 당신에게는 도우인 수호천사 마오가 당신의 아름다움을, 더 화려하고 몽환적이게 표현해줄 거랍니다.`
    },
    got: {
      intro: `테스트가 끝났네요. 고생하셨어요.<br>이제 결과를 바탕으로, 당신과 가장 잘 어울리는 수호천사를 소개해드릴게요.`,
      detail: `당신은 고딕 타입이 가장 잘 어울리는 분이네요.<br>당신의 아름다움은 밝은 조명보다, 그림자 속에서 더 선명해져요.`,
      common: `깊은 눈매와 강렬한 립 컬러는 이미 당신 안에 있죠.<br>이런 당신에게는 고딕 수호천사 루나가 그 고요하지만 강렬한 감정을 메이크업으로 완성해줄 거예요.`
    },
    cos: {
      intro: `테스트가 끝났네요. 고생하셨어요.<br>이제 결과를 바탕으로, 당신과 가장 잘 어울리는 수호천사를 소개해드릴게요.`,
      detail: `당신은 코스프레 타입이 가장 잘 어울리는 분이네요.<br>단순한 꾸밈을 넘어서, 변신 그 자체를 즐길 줄 아는 분이시죠.`,
      common: `당신에게 메이크업은 현실과 상상의 경계를 넘나드는 하나의 예술이에요.<br>이런 당신에게는 코스프레 수호천사 미카가 당신의 무한한 상상력을 캐릭터 스타일로 연결해줄 거랍니다.`
    },
    cta: `이렇게 당신에게 가장 잘 어울리는 스타일이 정해졌네요.<br>혹시, 이 타입에 어울리는 메이크업 팁과 추천 제품들을 더 알고 싶으신가요?<br>그럼, 오프라인 매장에서 이 스타일로 직접 메이크업을 받아보실 수 있도록<br>제가 컨설팅 예약을 도와드릴게요. 준비되셨다면, 따라오세요. 후훗`
  };

  let introIndex = 0;
  let qIndex = 0;
  let scores = { gal: 0, dou: 0, cos: 0, got: 0 };

  /* ───── 폰트 로드 대기 (Typekit wf-active + FontLoading API) ───── */
  async function waitFonts() {
    try {
      const htmlEl = document.documentElement;
      if (!htmlEl.classList.contains('wf-active')) {
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, 2500);
          const obs = new MutationObserver(() => {
            if (htmlEl.classList.contains('wf-active')) {
              clearTimeout(timeout); obs.disconnect(); resolve();
            }
          });
          obs.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
        });
      }
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
        await document.fonts.load("1rem 'yoon-px-pixman'"); // 실제 패밀리명 확인해서 수정 가능
      }
    } catch (e) {}
  }

  /* ───── 유틸: 텍스트 노드를 그래핌 단위 span으로 래핑 (태그는 그대로) ───── */
  function wrapTextNodesAsSpans(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    const spans = [];
    const seg = (typeof Intl !== 'undefined' && Intl.Segmenter)
      ? new Intl.Segmenter('ko', { granularity: 'grapheme' })
      : null;

    for (const tn of textNodes) {
      const val = tn.nodeValue;
      if (!val || !val.trim().length) continue;

      const frag = document.createDocumentFragment();
      const graphemes = seg
        ? Array.from(seg.segment(val), s => s.segment)
        : Array.from(val); // fallback: 코드포인트

      for (const g of graphemes) {
        const s = document.createElement('span');
        s.textContent = g;
        s.style.opacity = 0;           // 최초 숨김
        s.style.willChange = 'opacity';
        frag.appendChild(s);
        spans.push(s);
      }
      tn.parentNode.replaceChild(frag, tn);
    }
    return spans;
  }

  /* ───── 한글자 타이핑: opacity로 한 글자씩 켜기 ─────
     - html을 한 번에 렌더 → 텍스트만 span처리 → opacity만 변경
     - cps: 초당 글자 수
  ---------------------------------------------------------------- */
  function typeByChar(element, html, { cps = 30 } = {}, done) {
    nextBtn.style.display = 'none';

    // 1) 전체 HTML 먼저 렌더 (레이아웃 안정화)
    element.innerHTML = html || '';

    // 2) 텍스트 노드만 그래핌 단위 span으로 교체
    const spans = wrapTextNodesAsSpans(element);
    if (spans.length === 0) { if (done) done(); return; }

    // 3) 시간 기준으로 부드럽게 n자씩 켜기
    let shown = 0;
    const perMs = cps / 1000; // ms당 몇 글자
    let last = performance.now();

    function step(now) {
      const dt = now - last;
      last = now;

      let toShow = shown + Math.max(1, Math.floor(dt * perMs)) - shown;
      while (toShow-- > 0 && shown < spans.length) {
        spans[shown++].style.opacity = 1;
      }

      if (shown < spans.length) {
        requestAnimationFrame(step);
      } else {
        if (done) done();
      }
    }
    requestAnimationFrame(step);
  }

  // 기존 시그니처 유지
  function typeText(html, done) {
    // 속도 조절: cps를 늘리면 더 빨라짐 (예: 40~60)
    typeByChar(typewriter, html, { cps: 100 }, done);
  }

  /* ───── 유틸: <br> 분할 → 2줄 묶기 ───── */
  const splitByBr = (html) => (html || '').split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
  const groupByTwo = (lines) => { const p=[]; for (let i=0;i<lines.length;i+=2) p.push(lines.slice(i,i+2).join('<br>')); return p; };

  /* 결과 페이지 intro → detail → (타입별)common → cta */
  function buildResultPages(typeKey) {
    const pkg = results[typeKey];
    return [
      ...groupByTwo(splitByBr(pkg.intro)),
      ...groupByTwo(splitByBr(pkg.detail)),
      ...groupByTwo(splitByBr(pkg.common)),
      ...groupByTwo(splitByBr(results.cta)),
    ];
  }

  /* 인트로 */
  function showIntro() {
    if (introIndex < introTexts.length) {
      typeText(introTexts[introIndex], () => {
        nextBtn.style.display = 'inline-block';
        nextBtn.onclick = () => { introIndex++; showIntro(); };
      });
    } else { showQuestion(); }
  }

  /* 질문 */
  function showQuestion() {
    nextBtn.style.display = 'none';
    answerBox.innerHTML = '';
    const question = questions[qIndex];

    typeText(question.q, () => {
      question.a.forEach((answer, idx) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.onclick = () => {
          scores[question.t[idx]]++;
          qIndex++;
          if (qIndex < questions.length) showQuestion();
          else showResult();
        };
        answerBox.appendChild(btn);
      });
    });
  }

  /* 결과 및 CTA */
  function showResult() {
    answerBox.innerHTML = '';
    const topType = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
    const pages = buildResultPages(topType);
    let pageIndex = 0;

    const renderPage = () => {
      typeText(pages[pageIndex], () => {
        if (pageIndex < pages.length - 1) {
          nextBtn.style.display = 'inline-block';
          nextBtn.onclick = () => { pageIndex++; renderPage(); };
        } else {
          nextBtn.style.display = 'none';
          renderFinalButtons();
        }
      });
    };

    const renderFinalButtons = () => {
      answerBox.innerHTML = '';
      const wrap = document.createElement('div'); wrap.id = 'finalButtons';

      const reserveBtn = document.createElement('button');
      reserveBtn.textContent = '컨설팅 예약하러 가기';
      reserveBtn.onclick = () => {
      sessionStorage.setItem('chirei_open', 'popup3'); // 다음 페이지에서 팝업3 열라는 신호
      window.location.href = 'index3.html';            // 실제 메인 페이지 파일명으로
    };
      const homeBtn = document.createElement('button');
      homeBtn.textContent = '예약말고 홈페이지 구경가기';
      homeBtn.onclick = () => { window.location.href = 'index3.html'; };

      wrap.appendChild(reserveBtn);
      wrap.appendChild(homeBtn);
      answerBox.appendChild(wrap);
    };

    renderPage();
  }

  /* 시작: 폰트 로드 대기 후 인트로 (깨짐 방지) */
  (async () => {
    typewriter.style.visibility = 'hidden';
    await waitFonts();
    typewriter.style.visibility = '';
    showIntro();
  })();
});
