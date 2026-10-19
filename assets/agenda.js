(function(){
  var h=new URLSearchParams(location.hash.slice(1));
  var q=h.get('e');
  if(q){
    var n=q.normalize('NFC').replace(/[^\p{L}\p{M} &.,'-]/gu,'').replace(/\s+/g,' ').trim().slice(0,40);
    if(n.length>=2){document.getElementById('titulo').textContent='Conversa de 20 minutos — '+n;
      document.title='Conversa de 20 minutos — '+n;}
  }
  var s=h.get('sim');
  if(s && /^[\w=&.%-]{1,300}$/.test(s)){
    var link=location.origin+location.pathname.replace(/agenda\.html$/,'simulador.html')+'#'+s;
    var box=document.getElementById('sim-box'),b=document.getElementById('sim-copiar');box.hidden=false;
    b.onclick=function(){
      var ok=function(){b.textContent='Link copiado'};
      if(navigator.clipboard){navigator.clipboard.writeText(link).then(ok,function(){window.prompt('Copie o link:',link)})}
      else{window.prompt('Copie o link:',link)}
    };
  }
})();
