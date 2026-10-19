(function(){
'use strict';
var S=window.SCSimulador; if(!S)return;
var $=function(i){return document.getElementById(i)};
var BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
var BRL2=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
var PCT=function(v,c){return (v*100).toLocaleString('pt-BR',{minimumFractionDigits:c||1,maximumFractionDigits:c||1})+'%'};
/* lê "1.200.000", "1.200.000,50", "1200000.5", "R$ 900 mil", "1,2 mi", "2 milhões"; nunca notação científica */
function num(s){
  s=String(s||'').toLowerCase().trim();
  var mult=1;
  if(/milh(ão|ao|ões|oes)|\bmi\b|\bmm\b/.test(s))mult=1e6;else if(/\bmil\b|\bk\b/.test(s))mult=1e3;
  if(/-/.test(s))return -1;
  s=s.replace(/[^\d,.]/g,'');
  if(!s)return NaN;
  var c=(s.match(/,/g)||[]).length,p=(s.match(/\./g)||[]).length;
  if(c>1&&p===0)s=s.replace(/,/g,'');                               /* 1,200,000 */
  else if(c===1){s=s.replace(/\./g,'').replace(',','.');}           /* 1.200.000,50 ou 1,2 */
  else if(p>1||(p===1&&/\.\d{3}$/.test(s)&&mult===1))s=s.replace(/\./g,'');  /* 1.200.000 ou 900.000 */
  var v=parseFloat(s)*mult;return isFinite(v)?v:NaN;
}
function el(t,a,txt){var x=document.createElement(t);if(a)for(var k in a)x.setAttribute(k,a[k]);if(txt!=null)x.textContent=txt;return x}
var NOMES={IRPJ:'IRPJ',IRPJ_adicional:'Adicional do IRPJ',CSLL:'CSLL',PIS:'PIS',COFINS:'Cofins',ISS:'ISS',ICMS:'ICMS (estimado pela margem)',CPP:'Contribuição patronal (INSS)'};
function ler(){return{atv:$('atv').value,r:num($('rec').value),s:num($('sal').value)||0,p:num($('pl').value)||0,
  iss:num($('iss').value)/100,rat:num($('rat').value)/100,ter:num($('ter').value)/100,
  mg:num($('mg').value)/100,ic:num($('ic').value)/100}}
function entendemos(){[['rec','ent-rec'],['sal','ent-sal'],['pl','ent-pl']].forEach(function(p){
  var v=num($(p[0]).value);$(p[1]).textContent=($(p[0]).value&&isFinite(v)&&v>=0)?'Entendemos: '+BRL2.format(v):''})}
function erro(out,t){out.appendChild(el('p',{'class':'erro'},t));$('sintese').textContent=t}
function curva(v){
  var W=600,H=260,L=12,B=40,pts=[],mx=0,i,x,o;
  for(i=0;i<=40;i++){x=v.r*0.0125*i;o=S.simular(v.atv,v.r,x,v.p,v.iss,v.rat,v.ter,v.mg,v.ic);pts.push([x,o.simples,o.presumido]);mx=Math.max(mx,o.simples,o.presumido)}
  var sx=function(a){return L+(a/(v.r*0.5))*(W-L-12)},sy=function(b){return H-B-(b/mx)*(H-B-30)};
  var eu=S.simular(v.atv,v.r,Math.min(v.s,v.r*0.5),v.p,v.iss,v.rat,v.ter,v.mg,v.ic);
  var rot='Carga anual conforme as remunerações: no seu ponto, Simples '+BRL.format(eu.simples)+' e Lucro Presumido '+BRL.format(eu.presumido)+'. Valores completos na tabela acima.';
  var svg='<svg class="curva" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+rot+'">';
  svg+='<line x1="'+L+'" y1="'+(H-B)+'" x2="'+(W-12)+'" y2="'+(H-B)+'" stroke="#8E887C"/>';
  svg+='<polyline fill="none" stroke-width="3" stroke="#13805F" stroke-dasharray="8 5" points="'+pts.map(function(q){return sx(q[0]).toFixed(1)+','+sy(q[1]).toFixed(1)}).join(' ')+'"/>';
  svg+='<polyline fill="none" stroke-width="3" stroke="#1F2A44" points="'+pts.map(function(q){return sx(q[0]).toFixed(1)+','+sy(q[2]).toFixed(1)}).join(' ')+'"/>';
  var u=pts[pts.length-1];
  svg+='<text x="'+(W-14)+'" y="'+(sy(u[1])-8).toFixed(1)+'" font-size="18" fill="#13805F" text-anchor="end" font-weight="700">Simples</text>';
  svg+='<text x="'+(W-14)+'" y="'+(sy(u[2])-8).toFixed(1)+'" font-size="18" fill="#1F2A44" text-anchor="end" font-weight="700">Presumido</text>';
  var cx=sx(Math.min(v.s,v.r*0.5));svg+='<line x1="'+cx.toFixed(1)+'" y1="6" x2="'+cx.toFixed(1)+'" y2="'+(H-B)+'" stroke="#8a6d2f" stroke-dasharray="4 4"/>';
  svg+='<text x="'+(cx+5).toFixed(1)+'" y="22" font-size="18" fill="#6b5323">você</text>';
  svg+='<text x="'+L+'" y="'+(H-12)+'" font-size="17" fill="#4A5160">remunerações: 0</text><text x="'+(W-12)+'" y="'+(H-12)+'" font-size="17" fill="#4A5160" text-anchor="end">50% do faturamento</text></svg>';
  return svg;
}
function desenhar(){
  entendemos();
  var v=ler(),out=$('saida'),com=v.atv==='comercio';
  $('campo-iss').style.display=com?'none':'';$('campos-com').style.display=com?'':'none';
  out.textContent='';
  if($('rec').value===''){out.appendChild(el('p',null,'Preencha o faturamento para ver a comparação.'));return}
  if(!isFinite(v.r)||v.r<0||v.s<0||v.p<0)return erro(out,'Use só valores positivos, como 1.200.000 ou 1,2 mi.');
  if(v.r<1000)return erro(out,'Informe o faturamento dos 12 meses (a partir de R$ 1 mil).');
  if(v.r>S.tabelas.limite)return erro(out,'Acima de R$ 3,6 milhões em 12 meses entram o sublimite e a última faixa do Simples, com regras próprias. Essa conta fazemos com você numa conversa.');
  if(!com&&!(v.iss>=0.02&&v.iss<=0.05))return erro(out,'O ISS municipal vai de 2% a 5%.');
  if(com&&!(v.mg>=0&&v.mg<=0.9&&v.ic>=0&&v.ic<=0.25))return erro(out,'Margem de 0% a 90% e ICMS de 0% a 25%.');
  if(!(v.rat>=0.005&&v.rat<=0.06&&v.ter>=0&&v.ter<=0.06))return erro(out,'Nos ajustes avançados: RAT de 0,5% a 6% e terceiros de 0% a 6%.');
  var o;try{o=S.simular(v.atv,v.r,v.s,v.p,v.iss,v.rat,v.ter,v.mg,v.ic)}catch(x){return erro(out,'Não foi possível calcular com esses números. Confira os campos.')}
  var g=el('div',{'class':'res'});
  [['Simples Nacional · Anexo '+o.anexo,BRL.format(o.simples),'alíquota efetiva '+PCT(o.aliquota_efetiva)],
   ['Lucro Presumido',BRL.format(o.presumido),'tributos federais + '+(com?'ICMS estimado':'ISS')+' + INSS patronal'],
   ['Diferença por ano',BRL.format(Math.abs(o.diferenca)),o.diferenca===0?'empate':'a menos no '+(o.diferenca>0?'Simples':'Presumido')]]
  .forEach(function(c){var k=el('div',{'class':'kc'});k.appendChild(el('span',null,c[0]));k.appendChild(el('b',null,c[1]));k.appendChild(el('span',null,c[2]));g.appendChild(k)});
  out.appendChild(g);
  var frase=o.diferenca===0?'Nesta simulação de 2026, os dois regimes empatam.':
    'Nesta simulação de 2026, com as premissas abaixo, o '+(o.diferenca>0?'Simples':'Lucro Presumido')+' soma '+BRL.format(Math.abs(o.diferenca))+' a menos por ano que o '+(o.diferenca>0?'Lucro Presumido':'Simples')+' ('+PCT(Math.abs(o.diferenca)/v.r)+' do faturamento).';
  out.appendChild(el('p',{'class':'frase'},frase));
  out.appendChild(el('p',{'class':'ressalva'},'É uma conta aritmética, não uma recomendação: a escolha do regime é feita com a sua contabilidade.'));
  $('sintese').textContent=frase;
  out.appendChild(el('p',{'class':'aviso'},'Comparação de 2026. A opção de regime feita em janeiro vale para 2027, quando o PIS e a Cofins dão lugar à CBS, cuja alíquota de referência ainda não foi fixada; isso pode mudar a comparação, sobretudo em serviços.'));
  if(com)out.appendChild(el('p',{'class':'aviso'},'No comércio, o resultado depende muito da margem: o ICMS do Lucro Presumido foi estimado pela margem de '+PCT(v.mg,0)+' e pela alíquota de '+PCT(v.ic,0)+'. Substituição tributária, benefícios e diferenças de alíquota mudam a conta.'));
  if(o.falta_folha_anexo_iii!==null){out.appendChild(el('p',{'class':'aviso'},'Fator R de '+PCT(o.fator_r,2)+(o.anexo==='III'?': a empresa fica no Anexo III.':': Anexo V. Faltariam '+BRL2.format(o.falta_folha_anexo_iii)+' de folha em 12 meses para chegar a 28% e ir ao Anexo III — lembrando que aumentar folha ou pró-labore também aumenta encargos, INSS e IRPF do sócio, que esta conta não mostra.')))}
  var t=el('table',{'class':'tab'});Object.keys(o.presumido_det).forEach(function(k){if(!o.presumido_det[k])return;var tr=el('tr');tr.appendChild(el('td',null,NOMES[k]||k));tr.appendChild(el('td',null,BRL.format(o.presumido_det[k])));t.appendChild(tr)});
  out.appendChild(el('p',{'style':'margin:18px 0 0;font-weight:600;color:#1F2A44'},'Lucro Presumido, por tributo'));out.appendChild(t);
  var c=el('div');c.innerHTML=curva(v);out.appendChild(c);   /* SVG montado SÓ com números calculados aqui e textos fixos */
  out.appendChild(el('p',{'style':'margin:18px 0 0;color:#1F2A44'},'O que esta conta não vê: débitos e parcelamentos, retenções, o Fator R mês a mês, a substituição tributária e o efeito da CBS a partir de 2027. É isso que olhamos em 20 minutos, com os números reais da empresa — sem custo e sem compromisso.'));
  var a=el('div',{'class':'acoes'});
  var hashSim=new URLSearchParams({a:v.atv,r:v.r,s:v.s,p:v.p,i:+(v.iss*100).toFixed(2),m:+(v.mg*100).toFixed(2),c:+(v.ic*100).toFixed(2)}).toString();
  var b1=el('a',{'class':'btn btn-e','href':'agenda.html#sim='+encodeURIComponent(hashSim)},'Agendar a conversa de 20 minutos (a simulação vai junto)');
  var b2=el('button',{'class':'btn btn-c','type':'button'},'Copiar o link desta simulação');
  b2.onclick=function(){
    history.replaceState(null,'','#'+hashSim);
    var ok=function(){b2.textContent='Link copiado'};
    if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(ok,function(){window.prompt('Copie o link:',location.href)})}
    else{window.prompt('Copie o link:',location.href)}
  };
  var b3=el('button',{'class':'btn btn-c','type':'button'},'Imprimir ou salvar em PDF');b3.onclick=function(){window.print()};
  a.appendChild(b1);a.appendChild(b2);a.appendChild(b3);out.appendChild(a);
  out.appendChild(el('p',{'style':'font-size:12px;color:#5B6270;margin-top:10px'},'O link copiado guarda os números no próprio endereço (depois do #), que não vai a servidor nenhum; só vê quem receber o link.'));
}
var h=new URLSearchParams(location.hash.slice(1)),ok=['comercio','servicos_fr','servicos_iii'];
if(h.get('r')){
  $('atv').value=ok.indexOf(h.get('a'))>-1?h.get('a'):'comercio';
  [['r','rec'],['s','sal'],['p','pl'],['i','iss'],['m','mg'],['c','ic']].forEach(function(p){var x=h.get(p[0]);if(x&&/^[\d.]{1,12}$/.test(x))$(p[1]).value=String(x).replace('.',',')});
}
['atv','rec','sal','pl','iss','rat','ter','mg','ic'].forEach(function(i){$(i).addEventListener('input',desenhar);$(i).addEventListener('change',desenhar)});
desenhar();
})();
