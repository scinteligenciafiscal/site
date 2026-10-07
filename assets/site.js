(function(){
  var h=document.querySelector('.hdr');
  var fixo=h.classList.contains('fixo');
  function topo(){ if(!fixo){ h.classList.toggle('solido', window.scrollY>40); } }
  topo(); window.addEventListener('scroll', topo, {passive:true});
  var b=document.querySelector('.menu-btn');
  if(b){ b.addEventListener('click', function(){ var a=h.classList.toggle('aberto'); b.setAttribute('aria-expanded', a?'true':'false'); });
    document.querySelectorAll('.nav a').forEach(function(l){ l.addEventListener('click', function(){ h.classList.remove('aberto'); b.setAttribute('aria-expanded','false'); }); }); }
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){ els.forEach(function(x){x.classList.add('on');}); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('on'); io.unobserve(en.target); } }); },{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(x){ io.observe(x); });
})();
