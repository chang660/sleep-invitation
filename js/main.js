/* ============================================
   山东睡眠疗愈交流会 · H5 邀请函
   Main JavaScript — 全部功能
   ============================================ */

(function () {
  'use strict';

  // ========== 配置 ==========
  const CONFIG = {
    musicFile: 'assets/background.mp3',
    mapUrl: 'https://uri.amap.com/marker?position=116.7582,36.7958&name=齐河阿尔卡迪亚温泉高尔夫国际酒店',
    // 活动日期（修改这里即可更新倒计时 + 成功页日期）
    eventDate: '2026-06-18T12:00:00',
    eventDateText: '2026年6月18日',
    // 报名提交 API（替换为你的后端地址）
    apiUrl: '',
  };

  // ========== DOM 快捷引用 ==========
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ========== 1. 星空粒子 + 流星 Canvas ==========
  function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let meteors = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        stars = Array.from({ length: Math.min(Math.floor(w * h / 3000), 120) }, () => ({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        }));
      }, 200);
    });
    resize();

    stars = Array.from({ length: Math.min(Math.floor(w * h / 3000), 120) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    // 生成一颗新流星
    function spawnMeteor() {
      const angle = Math.PI / 4 + Math.random() * Math.PI / 6; // 30°~60° 倾斜
      const speed = 6 + Math.random() * 4;
      const len = 60 + Math.random() * 40;
      meteors.push({
        x: Math.random() * w * 1.2 - w * 0.1,
        y: -len,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: len,
        alpha: 1,
        life: 1,
        width: 1.5 + Math.random() * 1,
      });
    }

    // 定时生成流星
    let lastSpawn = -10000; // 打开页面立刻出流星
    function trySpawnMeteor(time) {
      const interval = 3000 + Math.random() * 4000; // 3~7 秒
      if (time - lastSpawn > interval) {
        spawnMeteor();
        lastSpawn = time;
      }
    }

    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      const time = now / 1000;

      // 画星星
      stars.forEach((s) => {
        const flicker = Math.sin(time * s.speed * 5 + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha * flicker})`;
        ctx.fill();
      });

      // 画流星
      trySpawnMeteor(now);
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= 0.006;
        m.life -= 0.006;

        if (m.alpha <= 0 || m.x > w + 50 || m.y > h + 50) {
          meteors.splice(i, 1);
          continue;
        }

        // 流星尾迹（渐变线条）
        const tailX = m.x - m.vx / m.vy * m.len * 0.6;
        const tailY = m.y - m.len;
        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
        gradient.addColorStop(0.3, `rgba(200,220,255,${m.alpha * 0.6})`);
        gradient.addColorStop(0.7, `rgba(150,180,255,${m.alpha * 0.2})`);
        gradient.addColorStop(1, `rgba(100,150,255,0)`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = m.width * m.alpha;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 流星头部发光
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
        glow.addColorStop(0, `rgba(255,255,255,${m.alpha * 0.8})`);
        glow.addColorStop(1, `rgba(200,220,255,0)`);
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // ========== 2. Loading 过渡 ==========
  function initLoading(onDone) {
    const overlay = document.getElementById('loadingOverlay');
    const bar = document.getElementById('loadingBar');
    if (!overlay) { onDone(); return; }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        bar.style.width = '100%';
        setTimeout(() => {
          overlay.classList.add('hide');
          setTimeout(onDone, 800);
        }, 400);
      }
      bar.style.width = Math.min(progress, 100) + '%';
    }, 200);
  }

  // ========== 3. 背景音乐 ==========
  function initMusic() {
    const btn = document.getElementById('musicBtn');
    if (!btn) return;
    const audio = new Audio(CONFIG.musicFile);
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.3;
    let audioLoaded = false;
    let playPending = false;
    let isPlaying = false;
    let userInteracted = false;

    // 预加载
    audio.addEventListener('canplaythrough', () => {
      audioLoaded = true;
      if (playPending) {
        playPending = false;
        audio.play().then(() => {
          isPlaying = true;
          btn.classList.remove('muted');
          btn.textContent = '🎵';
        }).catch(() => {});
      }
    });
    audio.load();

    function doPlay() {
      if (audioLoaded) {
        audio.play().then(() => {
          isPlaying = true;
          btn.classList.remove('muted');
          btn.textContent = '🎵';
        }).catch(() => {
          btn.classList.add('muted');
          btn.textContent = '🎵';
        });
      } else {
        // 还没加载完，标记等加载后播放
        playPending = true;
        btn.textContent = '⏳';
      }
    }

    function tryAutoPlay() {
      if (userInteracted) return;
      userInteracted = true;
      doPlay();
    }
    document.addEventListener('touchstart', tryAutoPlay, { once: true });
    document.addEventListener('click', tryAutoPlay, { once: true });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        btn.classList.add('muted');
        btn.textContent = '🎵';
      } else {
        audio.play().then(() => {
          isPlaying = true;
          btn.classList.remove('muted');
          btn.textContent = '🎵';
        }).catch(() => { showToast('请先点击页面'); });
      }
    });
  }

  // ========== 4. 页码指示器 ==========
  function initIndicator() {
    const dots = $$('.page-dot');
    if (!dots.length) return;
    window._updateIndicator = function (index) {
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
  }

  // ========== 5. Swiper 初始化（Cube 3D + Parallax） ==========
  function initSwiper() {
    if (typeof Swiper === 'undefined') {
      // 如果 Swiper 还没加载，等一会再试
      setTimeout(initSwiper, 300);
      return;
    }
    window._swiper = new Swiper('.swiper', {
      direction: 'vertical',
      loop: false,
      speed: 500,
      parallax: true,
      mousewheel: {
        sensitivity: 1,
      },
      threshold: 10,
      watchSlidesProgress: true,
      on: {
        init: function () {
          animateSlide(0);
          if (window._updateIndicator) window._updateIndicator(0);
          updateScrollHint(0);
        },
        slideChangeTransitionStart: function () {
          animateSlide(this.activeIndex);
          if (window._updateIndicator) window._updateIndicator(this.activeIndex);
          updateScrollHint(this.activeIndex);
        },
      },
    });
  }

  // ========== 6. 页面进入动画 + 滚动引导 ==========
  const animatedSlides = new Set();

  function animateSlide(index) {
    const slides = $$('.swiper-slide');
    if (!slides[index]) return;
    // 防止滑动回看时重复触发动画
    if (animatedSlides.has(index)) return;
    animatedSlides.add(index);
    const els = slides[index].querySelectorAll('.anim-on-enter');
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 100);
    });
  }

  function updateScrollHint(index) {
    const hints = $$('.scroll-hint');
    const total = $$('.swiper-slide').length;
    hints.forEach((h) => {
      h.style.display = index >= total - 1 ? 'none' : 'flex';
    });
  }

  // 倒计时已移除

  // ========== 8. Toast 提示 ==========
  let toastTimer = null;
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ========== 9. 3D 团队球体 ==========
  function initTeamSphere() {
    const container = document.getElementById('sphere');
    if (!container) return;

    const TEAM = [
      { name:'雨虹', role:'运营总监', color:'rgba(255,215,0,0.12)', initial:'雨', avatar:'assets/team/yuhong.jpg' },
      { name:'以安', role:'技术导师', color:'rgba(100,200,255,0.12)', initial:'以', avatar:'assets/team/yian.jpg' },
      { name:'莎莎', role:'疗愈顾问', color:'rgba(100,255,150,0.12)', initial:'莎', avatar:'assets/team/shasha.jpg' },
      { name:'王美婷', role:'运营专员', color:'rgba(255,150,200,0.12)', initial:'王', avatar:'assets/team/wangmeiting.jpg' },
      { name:'灵枫', role:'品牌策划', color:'rgba(200,150,255,0.12)', initial:'灵', avatar:'assets/team/lingfeng.jpg' },
      { name:'郭慧', role:'客服经理', color:'rgba(255,200,100,0.12)', initial:'郭', avatar:'assets/team/guohui.jpg' },
      { name:'君禾', role:'空间设计', color:'rgba(100,200,200,0.12)', initial:'君', avatar:'assets/team/junhe.jpg' },
      { name:'鑫晨', role:'市场推广', color:'rgba(200,100,100,0.12)', initial:'鑫', avatar:'assets/team/xinchen.jpg' },
      { name:'董小黑', role:'技术导师', color:'rgba(100,150,255,0.12)', initial:'董', avatar:'assets/team/dongxiaohei.jpg' },
      { name:'张慧', role:'运营专员', color:'rgba(255,100,150,0.12)', initial:'张', avatar:'assets/team/zhanghui.jpg' },
      { name:'焦娟', role:'客户关系', color:'rgba(150,200,100,0.12)', initial:'焦', avatar:'assets/team/jiaojuan.jpg' },
      { name:'龙飞', role:'渠道拓展', color:'rgba(255,180,80,0.12)', initial:'龙', avatar:'assets/team/longfei.jpg' },
      { name:'王顺溜儿', role:'内容运营', color:'rgba(80,200,255,0.12)', initial:'王', avatar:'assets/team/wangshunliuer.jpg' },
      { name:'语桐', role:'活动执行', color:'rgba(255,130,180,0.12)', initial:'语', avatar:'assets/team/yutong.jpg' },
      { name:'申佳', role:'客服专员', color:'rgba(140,220,140,0.12)', initial:'申', avatar:'assets/team/shenjia.jpg' },
      { name:'煊大', role:'技术研发', color:'rgba(180,140,220,0.12)', initial:'煊', avatar:'assets/team/xuanda.jpg' },
      { name:'郭敬', role:'项目助理', color:'rgba(255,160,100,0.12)', initial:'郭', avatar:'assets/team/guojing.jpg' },
      { name:'畅景恒', role:'AI技术总监', color:'rgba(200,100,200,0.12)', initial:'畅', avatar:'assets/team/changjingheng.jpg' },
    ];

    const radius = 135;
    const total = TEAM.length;
    const items = [];

    // 使用黄金角度在球面上均匀分布
    const phi = Math.PI * (3 - Math.sqrt(5));

    TEAM.forEach((t, i) => {
      const y = 1 - (i / (total - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const avatarHtml = t.avatar
        ? `<div class="si-avatar-wrap"><img class="si-avatar" src="${t.avatar}" alt="${t.name}"><div class="si-avatar si-avatar--init" style="background:${t.color}">${t.initial}</div></div>`
        : `<div class="si-avatar si-avatar--init" style="background:${t.color}">${t.initial}</div>`;

      const el = document.createElement('div');
      el.className = 'sphere-item';
      el.innerHTML = `<div class="sphere-item-inner" style="border-color:${t.color.replace('0.12','0.2')}">
        ${avatarHtml}
        <div class="si-name">${t.name}</div>
      </div>`;
      container.appendChild(el);
      items.push({ el, x, y, z, baseX: x, baseY: y, baseZ: z });
    });

    let angleX = 0.3;
    let angleY = 0.5;
    let isDragging = false;
    let lastMX = 0, lastMY = 0;
    let autoRotate = true;

    function project() {
      const sinX = Math.sin(angleX), cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY), cosY = Math.cos(angleY);

      items.forEach((item) => {
        let x = item.baseX;
        let y = item.baseY;
        let z = item.baseZ;

        // 绕 Y 轴旋转
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        x = x1; z = z1;

        // 绕 X 轴旋转
        let y1 = y * cosX - z * sinX;
        let z2 = y * sinX + z * cosX;
        y = y1; z = z2;

        const scale = 200 / (200 + z * radius);
        const px = x * radius * scale;
        const py = y * radius * scale;
        const opacity = Math.max(0.2, (z + radius) / (radius * 2));

        item.el.style.transform = `translate(-50%,-50%) translate(${px}px,${py}px) scale(${scale})`;
        item.el.style.opacity = opacity;
        item.el.style.zIndex = Math.round(z * 100);
      });
    }

    // 自动旋转
    let animId;
    function animate() {
      if (autoRotate && !isDragging) {
        angleY += 0.003;
        angleX += 0.0005;
      }
      project();
      animId = requestAnimationFrame(animate);
    }

    // 触摸/鼠标交互
    function onDown(e) {
      isDragging = true;
      autoRotate = false;
      const pos = e.touches ? e.touches[0] : e;
      lastMX = pos.clientX;
      lastMY = pos.clientY;
    }
    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      const pos = e.touches ? e.touches[0] : e;
      const dx = pos.clientX - lastMX;
      const dy = pos.clientY - lastMY;
      angleY += dx * 0.008;
      angleX += dy * 0.008;
      angleX = Math.max(-1.2, Math.min(1.2, angleX));
      lastMX = pos.clientX;
      lastMY = pos.clientY;
    }
    function onUp() {
      isDragging = false;
      setTimeout(() => { autoRotate = true; }, 2000);
    }

    container.addEventListener('touchstart', onDown, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: false });
    container.addEventListener('touchend', onUp);
    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    animate();
  }

  // ========== 10. 报名支付流程 ==========
  function initReg() {
    const regBtn = document.getElementById('regBtn');
    const payGuide = document.getElementById('payGuide');
    const payClose = document.getElementById('payGuideClose');
    const payGuideBtn = document.getElementById('payGuideBtn');
    const paySection = document.getElementById('paySection');
    const formSection = document.getElementById('formSection');
    if (!regBtn || !payGuide || !paySection || !formSection) return;

    regBtn.addEventListener('click', () => payGuide.classList.add('show'));

    if (payClose) {
      payClose.addEventListener('click', () => payGuide.classList.remove('show'));
    }
    payGuide.addEventListener('click', (e) => {
      if (e.target === payGuide) payGuide.classList.remove('show');
    });

    // 点击"已支付" → 展示确认页
    if (payGuideBtn && paySection && formSection) {
      payGuideBtn.addEventListener('click', () => {
        payGuide.classList.remove('show');
        paySection.style.display = 'none';
        formSection.style.display = 'flex';
        formSection.querySelectorAll('.anim-on-enter').forEach((el, i) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, i * 100);
        });
      });
    }

    // 重新支付按钮
    const payAgainBtn = document.getElementById('payAgainBtn');
    if (payAgainBtn) {
      payAgainBtn.addEventListener('click', () => {
        paySection.style.display = 'flex';
        formSection.style.display = 'none';
        paySection.querySelectorAll('.anim-on-enter').forEach((el, i) => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, i * 100);
        });
      });
    }
  }

  // ========== 11. 地图导航 ==========
  function initMap() {
    $$('.map-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.open(CONFIG.mapUrl, '_blank');
      });
    });
  }

  // 分享功能已移除

  // ========== 14. PWA — 注册 Service Worker ==========
  function initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // Service Worker 注册失败——不影响主功能
      });
    }
  }

  // ========== 15. 启动所有功能 ==========
  function init() {
    initStarCanvas();
    initMusic();
    initIndicator();
    initSwiper();
    initTeamSphere();

    // Loading 淡出
    initLoading(() => {});

    initReg();
    initMap();
    initPWA();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
