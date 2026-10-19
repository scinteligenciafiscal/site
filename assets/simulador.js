/* Simulador Simples × Lucro Presumido 2026 — SC Inteligência Fiscal. GERADO por _simulador_if.py a partir do
   motor fiscal aferido; não editar à mão. Roda só no navegador: nenhum dado é enviado. */
(function (root) {
'use strict';
var T = {"faixas": {"I": [[180000, 0.04, 0], [360000, 0.073, 5940], [720000, 0.095, 13860], [1800000, 0.107, 22500], [3600000, 0.143, 87300], [4800000, 0.19, 378000]], "III": [[180000, 0.06, 0], [360000, 0.112, 9360], [720000, 0.135, 17640], [1800000, 0.16, 35640], [3600000, 0.21, 125640], [4800000, 0.33, 648000]], "V": [[180000, 0.155, 0], [360000, 0.18, 4500], [720000, 0.195, 9900], [1800000, 0.205, 17100], [3600000, 0.23, 62100], [4800000, 0.305, 540000]]}, "margem_padrao": 0.3, "icms_padrao": 0.18, "limite": 3600000.0, "fgts": 0.08, "fator_r_corte": 0.28, "presuncao": {"servicos": 0.32, "comercio": 0.08}, "irpj": 0.15, "irpj_adic": 0.1, "irpj_adic_limite_ano": 240000.0, "csll": 0.09, "csll_pres_serv": 0.32, "csll_pres_com": 0.12, "pis": 0.0065, "cofins": 0.03, "cpp": 0.2, "rat": 0.02, "terceiros": 0.058, "conferido_em": "16/10/2026", "fontes": "LC 123/2006, Anexos I, III e V; Res. CGSN 140/2018, art. 26; Leis 9.249/1995, 9.430/1996, 9.718/1998 e 8.212/1991"};
function r2(v) { return Math.round((v + Number.EPSILON) * 100) / 100; }
function faixa(r) { var f = T.faixas.I; for (var i = 0; i < f.length; i++) { if (r <= f[i][0]) return i + 1; } return 6; }
function efetiva(anexo, r) { var l = T.faixas[anexo][faixa(r) - 1]; return (r * l[1] - l[2]) / r; }
function pyround(v) { /* round() do Python: meio para o par — igualdade ao centavo com a referência */
  var f = Math.floor(v), d = v - f; if (Math.abs(d - 0.5) < 1e-9) return (f % 2 === 0) ? f : f + 1; return Math.round(v); }
function simular(atv, receita, sal, pl, issMun, rat, terc, margem, icmsAliq) {
  if (rat == null) rat = T.rat; if (terc == null) terc = T.terceiros; if (issMun == null) issMun = 0.05;
  if (margem == null) margem = T.margem_padrao; if (icmsAliq == null) icmsAliq = T.icms_padrao;
  if (['comercio', 'servicos_fr', 'servicos_iii'].indexOf(atv) < 0) throw new Error('atividade');
  if (!(receita >= 1000 && receita <= T.limite)) throw new Error('fora');
  if (!(sal >= 0 && pl >= 0 && issMun >= 0.02 && issMun <= 0.05 && rat >= 0.005 && rat <= 0.06 && terc >= 0 &&
        terc <= 0.06 && margem >= 0 && margem <= 0.9 && icmsAliq >= 0 && icmsAliq <= 0.25)) throw new Error('faixa');
  var folhaFr = sal + pl + T.fgts * sal, fr = folhaFr / receita, anexo, ef, simples, nota;
  if (atv === 'comercio') {
    anexo = 'I'; ef = efetiva('I', receita); simples = receita * ef;
    nota = 'DAS completo (inclui ICMS, contribuição patronal e tributos federais)';
  } else {
    var iii = pyround(folhaFr * 100) >= pyround(T.fator_r_corte * receita * 100);   /* corte em centavos */
    anexo = (atv === 'servicos_fr') ? (iii ? 'III' : 'V') : 'III';
    ef = efetiva(anexo, receita); simples = receita * ef;
    nota = 'DAS completo (inclui a contribuição patronal e o ISS)';
  }
  var serv = atv !== 'comercio', baseIr = receita * (serv ? T.presuncao.servicos : T.presuncao.comercio);
  var basePc = receita - (serv ? 0 : receita * icmsAliq);
  var p = { IRPJ: r2(baseIr * T.irpj), IRPJ_adicional: r2(Math.max(0, baseIr - T.irpj_adic_limite_ano) * T.irpj_adic),
    CSLL: r2(receita * (serv ? T.csll_pres_serv : T.csll_pres_com) * T.csll), PIS: r2(basePc * T.pis),
    COFINS: r2(basePc * T.cofins), ISS: r2(serv ? receita * issMun : 0), ICMS: r2(serv ? 0 : icmsAliq * margem * receita),
    CPP: r2(T.cpp * (sal + pl) + (rat + terc) * sal) };
  var tot = 0; for (var k in p) tot += p[k];
  var o = { anexo: anexo, aliquota_efetiva: Math.round(ef * 1e6) / 1e6, fator_r: Math.round(fr * 1e6) / 1e6,
    simples: r2(simples), presumido: r2(tot), presumido_det: p, nota_simples: nota,
    falta_folha_anexo_iii: atv === 'servicos_fr' ? (anexo === 'III' ? 0 : r2(Math.max(0, T.fator_r_corte * receita - folhaFr))) : null };
  o.diferenca = r2(o.presumido - o.simples);
  return o;
}
root.SCSimulador = { simular: simular, tabelas: T, efetiva: efetiva, faixa: faixa };
if (typeof module !== 'undefined') module.exports = root.SCSimulador;
})(typeof window !== 'undefined' ? window : globalThis);
