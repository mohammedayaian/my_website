(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* duplicate marquee for seamless loop */
  var track = $('#track'); track.innerHTML += track.innerHTML;

  /* nav + progress + active link */
  var nav = $('#nav'), prog = $('#progress');
  var secs = $$('section[id]'), links = $$('#links a');
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (y / h * 100) + '%';
    nav.classList.toggle('scrolled', y > 30);
    var cur = '';
    secs.forEach(function(s){ if (s.offsetParent && y + 140 >= s.offsetTop) cur = s.id; });
    links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  $('#menu').onclick = function(){ $('#links').classList.toggle('open'); };
  links.forEach(function(a){ a.onclick = function(){ $('#links').classList.remove('open'); }; });

  /* typing roles */
  var words = ['KPI dashboards','SQL reports','ERP modules','smart meter analytics','APIs and webhooks'];
  var el = $('#typed'), wi = 0, ci = 0, del = false;
  function type(){
    var w = words[wi];
    if (reduce){ el.textContent = w; return; }
    el.textContent = w.slice(0, ci);
    if (!del && ci === w.length){ del = true; return setTimeout(type, 1400); }
    if (del && ci === 0){ del = false; wi = (wi + 1) % words.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 35 : 75);
  }
  type();

  /* reveal, counters, bars */
  function count(n){
    var end = parseFloat(n.dataset.count), dec = +n.dataset.dec || 0, fmt = n.dataset.fmt;
    var t0 = performance.now(), dur = 1600;
    function out(v){
      if (fmt === 'k') return v >= 1000 ? Math.round(v/1000) + 'k+' : Math.round(v);
      return v.toFixed(dec);
    }
    if (reduce){ n.textContent = out(end); return; }
    (function step(t){
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = out(end * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var revealMotion = ['motion-up', 'motion-left', 'motion-right', 'motion-zoom'];
  $$('.rv').forEach(function(n, i){ n.classList.add(revealMotion[i % revealMotion.length]); });
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      var t = e.target; t.classList.add('in');
      $$('[data-count]', t).forEach(count);
      $$('.val', t).forEach(function(b){ b.style.strokeDashoffset = 100 - b.dataset.w; });
      io.unobserve(t);
    });
  }, {threshold:.18});
  $$('.rv').forEach(function(n){ io.observe(n); });

  /* project filter */
  $$('.f').forEach(function(b){
    b.onclick = function(){
      $$('.f').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      $$('.card').forEach(function(c){
        var hide = b.dataset.f !== 'all' && c.dataset.t !== b.dataset.f;
        c.classList.toggle('hide', hide);
        if (!hide){
          c.classList.add('in');
          c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
        }
      });
    };
  });

  /* card tilt + spotlight */
  $$('.card').forEach(function(c){
    c.addEventListener('mousemove', function(e){
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (reduce) return;
      var rx = (y / r.height - .5) * -8, ry = (x / r.width - .5) * 8;
      c.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function(){ c.style.transform = ''; });
  });


  /* light / dark toggle */
  var root = document.documentElement, tb = $('#theme'), themeMenu = $('#theme-menu');
  var themeOptions = $$('.theme-option', themeMenu);
  var themes = ['dark', 'light', 'ocean', 'sunset', 'forest'];
  function setTheme(t){
    if (themes.indexOf(t) === -1) t = 'dark';
    root.setAttribute('data-theme', t);
    themeOptions.forEach(function(option){
      option.setAttribute('aria-pressed', option.dataset.themeChoice === t ? 'true' : 'false');
    });
    try{ localStorage.setItem('pm-theme', t); }catch(e){}
  }
  setTheme(root.getAttribute('data-theme') || 'dark');
  tb.onclick = function(){
    var open = tb.getAttribute('aria-expanded') === 'true';
    tb.setAttribute('aria-expanded', String(!open));
    themeMenu.hidden = open;
  };
  themeOptions.forEach(function(option){
    option.onclick = function(){
      setTheme(option.dataset.themeChoice);
      themeMenu.hidden = true;
      tb.setAttribute('aria-expanded', 'false');
    };
  });
  document.addEventListener('click', function(e){
    if (!e.target.closest('.theme-picker')){
      themeMenu.hidden = true;
      tb.setAttribute('aria-expanded', 'false');
    }
  });
  addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !themeMenu.hidden){
      themeMenu.hidden = true;
      tb.setAttribute('aria-expanded', 'false');
      tb.focus();
    }
  });

  /* project detail pop-ups */
  var DET = [
    {d:'A scorecard report for TPDDL that shows performance district by district in one screen.', l:['District-wise tabs that switch without reloading the page (HTMX)','Grand Total rows for each view','MySQL queries built for the daily review by managers']},
    {d:'A KPI dashboard for Meter Reading and Bill Distribution.', l:['Cards for Meter Reading and for Bill Distribution','Separate counts for each of the 6 regional groups','All counts pulled from MySQL']},
    {d:'A dashboard over smart meter reading data of about 3 lakh rows.', l:['Sidebar listing every characteristic code with its count','Click a code to filter the readings','Built with PHP and MySQL']},
    {d:'A report that lets you drill down through three connected levels of detail.', l:['Click anywhere on a row to open the next level','Three linked levels of detail','HTMX loads each level without a page reload']},
    {d:'A points system that rewards smart plugs for staying green.', l:['Awards points when a plug reaches 16 or more green days in a month','Points are saved to a ledger in MySQL','Month-wise and date-wise calendar data served as JSON for the app']},
    {d:'An interactive dashboard analysing IPL 2025.', l:['Team and player performance in one place','Built in Power BI']},
    {d:'A personal analysis project on online food order data.', l:['Cleaned the order data with Pandas and NumPy','Stored the cleaned data in MySQL','Queried it for ordering trends and insights']},
    {d:'A ticketing system for raising and tracking support tickets inside the ERP.', l:['Ticket list and detail views that update without a page reload (HTMX)','Built on PHP and MySQL','Part of the company ERP platform']},
    {d:'A page where consumers book a home audit slot.', l:['Book or reschedule a slot','Pick the location on a map','WhatsApp notifications for confirmations','Built with PHP and HTMX']},
    {d:'An HR tool that generates offer letters as PDF.', l:['Fill a form and get a formatted offer letter','PDF created with mPDF','Used by HR for new joiners']},
    {d:'A workspace for evaluating vendors on a tender or RFP.', l:['Tree, list and edit views','Grade each vendor against the RFP','HTMX loads each view without a page reload']}
  ];
  var modal = $('#modal'), lastFocus;
  function openM(i){
    var c = $$('.card')[i], v = DET[i];
    $('#mn').textContent = $('.n', c).textContent;
    $('#mt').textContent = $('h3', c).textContent;
    $('#md').textContent = v.d;
    $('#ml').innerHTML = v.l.map(function(x){ return '<li>' + x + '</li>'; }).join('');
    $('#mp').innerHTML = $('.pills', c).innerHTML;
    lastFocus = document.activeElement;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden'; $('#mx').focus();
  }
  function closeM(){
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = ''; if (lastFocus) lastFocus.focus();
  }
  $$('.card').forEach(function(c, i){
    c.setAttribute('tabindex','0'); c.setAttribute('role','button');
    var m = document.createElement('span'); m.className = 'more'; m.textContent = 'View details →'; c.appendChild(m);
    c.addEventListener('click', function(){ openM(i); });
    c.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openM(i); } });
  });
  $('#mx').onclick = closeM;
  modal.addEventListener('click', function(e){ if (e.target === modal) closeM(); });
  addEventListener('keydown', function(e){ if (e.key === 'Escape' && modal.classList.contains('open')) closeM(); });

  /* Power BI gallery: shows only screenshots that exist */
  var GALLERY = [
    {src:'assets/images/gallery/ipl-dashboard-1.png', title:'IPL 2025 dashboard'},
    {src:'assets/images/gallery/ipl-dashboard-2.png', title:'IPL 2025 dashboard: player view'},
    {src:'assets/images/gallery/ipl-dashboard-3.png', title:'IPL 2025 dashboard: team view'}
  ];
  (function(){
    var ok = [], left = GALLERY.length;
    GALLERY.forEach(function(g, k){
      var im = new Image();
      im.onload = function(){ ok[k] = g; done(); };
      im.onerror = done;
      im.src = g.src;
    });
    function done(){ if (--left === 0) build(ok.filter(Boolean)); }
    function build(list){
      if (!list.length) return;
      var sec = $('#gallery'); sec.hidden = false;
      var tr = $('#galTrack'), dots = $('#gDots'), idx = 0, timer;
      tr.innerHTML = list.map(function(g){ return '<figure><img src="' + g.src + '" alt="' + g.title + '" loading="lazy"><figcaption>' + g.title + '</figcaption></figure>'; }).join('');
      dots.innerHTML = list.map(function(_, k){ return '<button aria-label="Slide ' + (k+1) + '"></button>'; }).join('');
      var db = $$('button', dots);
      function go(n){ idx = (n + list.length) % list.length; tr.style.transform = 'translateX(' + (-idx * 100) + '%)'; db.forEach(function(b, k){ b.classList.toggle('on', k === idx); }); }
      function auto(){ clearInterval(timer); if (!reduce && list.length > 1) timer = setInterval(function(){ go(idx + 1); }, 4500); }
      $('#gPrev').onclick = function(){ go(idx - 1); auto(); };
      $('#gNext').onclick = function(){ go(idx + 1); auto(); };
      db.forEach(function(b, k){ b.onclick = function(){ go(k); auto(); }; });
      if (list.length < 2){ $('#gPrev').style.display = $('#gNext').style.display = dots.style.display = 'none'; }
      go(0); auto();
    }
  })();

  /* cursor glow */
  var glow = $('#glow');
  addEventListener('mousemove', function(e){ glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

  /* data-network background */
  var cv = $('#net'), cx = cv.getContext('2d'), W, H, pts = [], mouse = {x:-999,y:-999};
  function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight;
    var n = Math.min(70, Math.floor(W * H / 22000)); pts = [];
    for (var i = 0; i < n; i++) pts.push({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35}); }
  size(); addEventListener('resize', size);
  addEventListener('mousemove', function(e){ mouse.x = e.clientX; mouse.y = e.clientY; });
  function draw(){
    cx.clearRect(0,0,W,H);
    for (var i = 0; i < pts.length; i++){
      var p = pts[i];
      if (!reduce){ p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1; }
      cx.fillStyle = 'rgba(94,234,212,.8)'; cx.beginPath(); cx.arc(p.x,p.y,1.6,0,6.283); cx.fill();
      for (var j = i + 1; j < pts.length; j++){
        var q = pts[j], d = Math.hypot(p.x-q.x, p.y-q.y);
        if (d < 130){ cx.strokeStyle = 'rgba(129,140,248,' + (1 - d/130) * .5 + ')'; cx.lineWidth = .7;
          cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(q.x,q.y); cx.stroke(); }
      }
      var dm = Math.hypot(p.x-mouse.x, p.y-mouse.y);
      if (dm < 160){ cx.strokeStyle = 'rgba(244,114,182,' + (1 - dm/160) * .7 + ')';
        cx.beginPath(); cx.moveTo(p.x,p.y); cx.lineTo(mouse.x,mouse.y); cx.stroke(); }
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  draw();
})();

/* ===== trending UI extras ===== */
(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* second marquee loop */
  var t2=$('#track2'); if(t2) t2.innerHTML+=t2.innerHTML;

  /* custom cursor */
  var dot=$('.cur-dot'), ring=$('.cur-ring'), mx=0,my=0,rx=0,ry=0;
  addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;dot.style.transform='translate('+mx+'px,'+my+'px)';});
  (function loop(){rx+=(mx-rx)*.15;ry+=(my-ry)*.15;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop);})();
  document.addEventListener('mouseover',function(e){ring.classList.toggle('big',!!e.target.closest('a,button,.card,.bt'));});

  /* magnetic buttons */
  $$('.btn,.theme-btn,#top-btn').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)';});
    b.addEventListener('mouseleave',function(){b.style.transform='';});
  });

  /* heading scramble */
  var chars='01<>/{}[]#$%&*';
  function scramble(el){
    var txt=el.dataset.t||(el.dataset.t=el.textContent), n=0;
    var id=setInterval(function(){
      el.textContent=txt.split('').map(function(c,i){return c===' '?' ':(i<n?c:chars[Math.floor(Math.random()*chars.length)]);}).join('');
      n+=1.2; if(n>=txt.length+1){el.textContent=txt;clearInterval(id);}
    },30);
  }
  var heads=$$('.head h2').filter(function(h){return !h.children.length;});
  var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){scramble(e.target);so.unobserve(e.target);}});},{threshold:.6});
  heads.forEach(function(h){so.observe(h);});

  /* terminal typing */
  var term=$('#term');
  if(term){
    var code='<span class="kw">SELECT</span> district, <span class="fn">COUNT</span>(*) <span class="kw">AS</span> meters\n<span class="kw">FROM</span> meter_readings\n<span class="kw">GROUP BY</span> district\n<span class="kw">ORDER BY</span> meters <span class="kw">DESC</span>;\n\n<span class="ok">&#10003; 3,00,000 rows scanned</span>\n<span class="ok">&#10003; report ready: Excel + PDF</span>';
    var parts=code.split(/(<[^>]+>)/), out='', started=false;
    var flat=[]; parts.forEach(function(p){ if(p[0]==='<') flat.push({tag:p}); else p.split('').forEach(function(c){flat.push({c:c});}); });
    function run(i){
      if(i>=flat.length){term.innerHTML=out+'<span class="cur"></span>';return;}
      var f=flat[i]; out+=(f.tag||(f.c==='\n'?'\n':f.c));
      term.innerHTML=out+'<span class="cur"></span>';
      setTimeout(function(){run(i+1)}, f.tag?0:28);
    }
    var to=new IntersectionObserver(function(es){if(es[0].isIntersecting&&!started){started=true;run(0);to.disconnect();}},{threshold:.4});
    to.observe(term);
  }

  /* bento tiles reveal (sparkline draw) */
  var bo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');bo.unobserve(e.target);}});},{threshold:.3});
  $$('.bt').forEach(function(b){bo.observe(b);});

  /* back to top */
  var tb=$('#top-btn');
  addEventListener('scroll',function(){tb.classList.toggle('show',scrollY>600);},{passive:true});
  tb.onclick=function(){scrollTo({top:0,behavior:'smooth'});};
})();
