"use strict";

const CHAVE_SAVE = "ascensaoImperios_zero_v1";

const dadosConstrucoes = {
  fortaleza: { nome: "Fortaleza", icone: "🏰", ouro: 0, elixir: 0, tempo: 0 },
  arsenal: { nome: "Arsenal", icone: "⚒️", ouro: 400, elixir: 200, tempo: 60 },
  acampamento1: { nome: "Acampamento 1", icone: "🏕️", ouro: 300, elixir: 0, tempo: 45 },
  torreBombardeira: { nome: "Torre Bombardeira", icone: "💣", ouro: 500, elixir: 0, tempo: 90 },
  mina1: { nome: "Mina de Ouro", icone: "⛏️", ouro: 250, elixir: 0, tempo: 40 },
  coletor1: { nome: "Coletor de Elixir", icone: "🧪", ouro: 0, elixir: 250, tempo: 40 },
  depositoOuro: { nome: "Depósito de Ouro", icone: "📦", ouro: 350, elixir: 0, tempo: 50 },
  depositoElixir: { nome: "Depósito de Elixir", icone: "🫙", ouro: 0, elixir: 350, tempo: 50 },
  torreRaposa: { nome: "Torre Raposa", icone: "🦊", ouro: 450, elixir: 0, tempo: 70 },
  centroEvolucao: { nome: "Centro de Evolução", icone: "🔮", ouro: 800, elixir: 500, tempo: 180 },
  lancaPedras: { nome: "Lança-Pedras", icone: "🪨", ouro: 3000, elixir: 0, tempo: 3600 },
  poco: { nome: "Poço Escondido", icone: "🕳️", ouro: 500, elixir: 0, tempo: 30 },
  catapulta: { nome: "Catapulta Pesada", icone: "🏹", ouro: 5000, elixir: 0, tempo: 3600 },
  santuario: { nome: "Santuário Místico", icone: "✨", ouro: 1200, elixir: 800, tempo: 300 }
};

const tropasDados = {
  coelho: {
    nome: "Coelho Guerreiro", icone: "🐰", espacos: 1,
    nivel: 1, dano: 30, vida: 100, ouro: 20, elixir: 10
  },
  raposa: {
    nome: "Raposa Arqueira", icone: "🦊", espacos: 1,
    nivel: 2, dano: 45, vida: 90, ouro: 25, elixir: 25
  },
  cabrito: {
    nome: "Cabrito Nervoso", icone: "🐐", espacos: 2,
    nivel: 3, dano: 80, vida: 220, ouro: 50, elixir: 40
  },
  gato: {
    nome: "Gato Quebra-Muro", icone: "🐱", espacos: 2,
    nivel: 3, dano: 60, vida: 180, ouro: 40, elixir: 50
  },
  tartaruga: {
    nome: "Tartaruga Blindada", icone: "🐢", espacos: 4,
    nivel: 3, dano: 50, vida: 650, ouro: 70, elixir: 100
  },
  dragao: {
    nome: "Dragão Jovem", icone: "🐉", espacos: 5,
    nivel: 4, dano: 100, vida: 500, ouro: 100, elixir: 150
  }
};

function novoEstado() {
  return {
    ouro: 1000,
    elixir: 1000,
    diamantes: 0,
    fortaleza: 1,
    construcoes: {
      fortaleza: { nivel: 1, termina: 0 },
      arsenal: { nivel: 1, termina: 0 },
      acampamento1: { nivel: 1, termina: 0 },
      torreBombardeira: { nivel: 1, termina: 0 }
    },
    tropas: { coelho: 30, raposa: 0, cabrito: 0, gato: 0, tartaruga: 0, dragao: 0 },
    evolucoes: {},
    trabalhadoresComprados: 0,
    missoesReclamadas: [],
    batalhas: 0,
    vitorias: 0,
    ultimaBatalha: null
  };
}

let estado = carregarEstado();
let cena, camera, renderizador, controles;
let objetosVila = [];
let avisoTimer;
let selecaoAtaque = {};
let alvoSelecionado = null;
let batalha = null;
let timerBatalha = null;
let loopCombate = null;
const rivais = [
  {id:'clareira', nome:'Clareira do Javali', emoji:'🐗', nivel:1, cor:'#c58a51', botao:'Leve', ouro:320, elixir:300, torres:1, buildings:[['🏰','Fortaleza',240,50,52],['🗼','Torre Vigia',135,25,28],['🛖','Casa do Clã',100,70,30],['🪙','Armazém',85,52,72]]},
  {id:'bosque', nome:'Bosque da Raposa', emoji:'🦊', nivel:2, cor:'#8c6948', botao:'Médio', ouro:430, elixir:390, torres:2, buildings:[['🏰','Fortaleza',280,48,52],['🗼','Torre Vigia',145,25,25],['🗼','Torre de Pedra',160,72,31],['🛖','Cabana',100,70,72],['📦','Armazém',115,50,78]]},
  {id:'penhasco', nome:'Penhasco do Urso', emoji:'🐻', nivel:3, cor:'#77725f', botao:'Desafio', ouro:550, elixir:500, torres:2, buildings:[['🏰','Fortaleza',320,47,50],['🗼','Torre Vigia',175,23,26],['🗼','Torre de Pedra',180,74,30],['🏚️','Salão',140,69,70],['📦','Armazém',130,48,77],['🛖','Cabana',110,24,73]]}
];
const erasFortaleza = [
  ["Aldeia do Despertar", "O primeiro estandarte foi fincado."], ["Vigília de Pedra", "Muralhas e coletores entram no ritmo."], ["Bosque das Trilhas", "O Centro de Evolução desperta."], ["Forja do Crepúsculo", "Catapultas e relíquias chegam ao reino."], ["Coroa de Cinzas", "Novas fronteiras aguardam exploração."]
];
const heroiBase = { nome: "Aruan, o Leão-Guardião", icone: "🦁", nivel: 1, xp: 0, habilidade: "Rugido de Brasa" };

function carregarEstado() {
  try {
    const salvo = localStorage.getItem(CHAVE_SAVE);
    if (!salvo) return novoEstado();

    const recebido = JSON.parse(salvo);
    const base = novoEstado();

    return {
      ...base,
      ...recebido,
      construcoes: { ...base.construcoes, ...(recebido.construcoes || {}) },
      tropas: { ...base.tropas, ...(recebido.tropas || {}) },
      evolucoes: recebido.evolucoes || {},
      missoesReclamadas: recebido.missoesReclamadas || [],
      heroi: { ...heroiBase, ...(recebido.heroi || {}) },
      selecaoAtaque: recebido.selecaoAtaque || {}
    };
  } catch (erro) {
    console.error("Não foi possível carregar o salvamento:", erro);
    return novoEstado();
  }
}

function salvar() {
  localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
}

function formatar(valor) {
  return Math.floor(valor).toLocaleString("pt-BR");
}

function notificar(mensagem) {
  const caixa = document.getElementById("notificacao");
  caixa.textContent = mensagem;
  caixa.classList.add("visivel");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => caixa.classList.remove("visivel"), 3000);
}

function nivelConstrucao(id) {
  return estado.construcoes[id]?.nivel || 0;
}

function fortalezaNecessaria(id) {
  const regras = {
    fortaleza: 1,
    arsenal: 1,
    acampamento1: 1,
    torreBombardeira: 1,
    mina1: 2,
    coletor1: 2,
    depositoOuro: 2,
    depositoElixir: 2,
    torreRaposa: 2,
    centroEvolucao: 3,
    lancaPedras: 3,
    poco: 3,
    catapulta: 4,
    santuario: 4
  };
  return regras[id] || 1;
}

function capacidadeAcampamentos() {
  let total = 0;
  Object.entries(estado.construcoes).forEach(([id, construcao]) => {
    if (!id.startsWith("acampamento")) return;
    if (construcao.nivel === 1) total += 30;
    if (construcao.nivel === 2) total += 50;
    if (construcao.nivel === 3) total += 75;
    if (construcao.nivel >= 4) total += 125;
  });
  return total;
}

function espacosOcupados() {
  return Object.entries(estado.tropas).reduce((total, [id, quantidade]) => {
    return total + quantidade * tropasDados[id].espacos;
  }, 0);
}

function totalTropas() {
  return Object.values(estado.tropas).reduce((soma, qtd) => soma + qtd, 0);
}

function trabalhadoresTotal() {
  return 1 + estado.trabalhadoresComprados;
}

function trabalhadoresOcupados() {
  const agora = Date.now();
  return Object.values(estado.construcoes).filter(c => c.termina > agora).length;
}

function trabalhadoresLivres() {
  return trabalhadoresTotal() - trabalhadoresOcupados();
}

function concluirTemporizadores() {
  const agora = Date.now();
  let mudou = false;

  for (const [id, c] of Object.entries(estado.construcoes)) {
    if (c.termina && c.termina <= agora) {
      c.termina = 0;
      mudou = true;

      if (id === "fortaleza") {
        estado.fortaleza = c.nivel;
      }
    }
  }

  if (mudou) {
    salvar();
    atualizarTudo();
    reconstruirVila();
    notificar("Uma melhoria foi concluída!");
  }
}

function tempoRestante(termina) {
  const segundos = Math.max(0, Math.ceil((termina - Date.now()) / 1000));
  if (!segundos) return "Concluído";

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const seg = segundos % 60;

  if (horas) return `${horas}h ${minutos}min`;
  if (minutos) return `${minutos}min ${seg}s`;
  return `${seg}s`;
}

function custoMelhoria(id, nivelAtual) {
  const base = dadosConstrucoes[id];
  if (!base) return { ouro: 0, elixir: 0, tempo: 0 };

  const multiplicador = Math.max(1, nivelAtual);
  let custo = {
    ouro: Math.floor(base.ouro * multiplicador),
    elixir: Math.floor(base.elixir * multiplicador),
    tempo: Math.floor(base.tempo * multiplicador)
  };

  if (id === "fortaleza") {
    custo = {
      ouro: nivelAtual === 1 ? 1000 : Math.floor(3000 * Math.pow(nivelAtual, 1.45)),
      elixir: nivelAtual === 1 ? 1000 : Math.floor(2500 * Math.pow(nivelAtual, 1.4)),
      tempo: nivelAtual === 1 ? 120 : Math.floor(Math.min(86400, 900 * Math.pow(nivelAtual, 1.55)))
    };
  }

  return custo;
}

function iniciarMelhoria(id) {
  concluirTemporizadores();

  const atual = estado.construcoes[id];
  if (!atual) return notificar("Essa construção ainda não existe.");

  if (atual.termina > Date.now()) {
    return notificar("Essa construção já está em melhoria.");
  }

  if (trabalhadoresLivres() <= 0) {
    return notificar("Todos os trabalhadores estão ocupados.");
  }

  const maximo = id === "fortaleza" ? 4 : 4;
  if (atual.nivel >= maximo) return notificar(id === "fortaleza" ? "Você alcançou o marco atual: Fortaleza 4." : "Essa construção já atingiu o nível máximo desta etapa.");

  const proximoNivel = atual.nivel + 1;

  const custo = custoMelhoria(id, atual.nivel);

  if (estado.ouro < custo.ouro || estado.elixir < custo.elixir) {
    return notificar("Você não tem recursos suficientes.");
  }

  estado.ouro -= custo.ouro;
  estado.elixir -= custo.elixir;
  atual.nivel = proximoNivel;
  atual.termina = Date.now() + custo.tempo * 1000;

  if (id === "fortaleza") {
    estado.fortaleza = proximoNivel;
  }

  salvar();
  atualizarTudo();
  reconstruirVila();

  notificar(`Melhoria iniciada: ${dadosConstrucoes[id].nome}.`);
}

function construir(id) {
  concluirTemporizadores();

  const regraNivel = fortalezaNecessaria(id);
  if (estado.fortaleza < regraNivel) {
    return notificar(`Essa construção exige Fortaleza nível ${regraNivel}.`);
  }

  if (estado.construcoes[id]) return notificar("Essa construção já existe.");

  if (id === "poco") {
    const quantidade = Object.keys(estado.construcoes).filter(k => k.startsWith("poco")).length;
    if (quantidade >= 2) return notificar("Você só pode ter 2 Poços Escondidos.");
  }

  if (id === "catapulta" && estado.construcoes.catapulta) {
    return notificar("Você só pode ter uma Catapulta Pesada.");
  }

  if (id === "acampamento2" && estado.fortaleza < 2) {
    return notificar("A Fortaleza 2 libera o segundo acampamento.");
  }

  if (id === "acampamento3" && estado.fortaleza < 4) {
    return notificar("O terceiro acampamento exige Fortaleza 4.");
  }

  if (trabalhadoresLivres() <= 0) return notificar("Não há trabalhadores livres.");

  const base = dadosConstrucoes[id] || {
    nome: id.startsWith("acampamento") ? "Acampamento" : "Construção",
    ouro: 500, elixir: 0, tempo: 60
  };

  const custo = {
    ouro: base.ouro || 0,
    elixir: base.elixir || 0,
    tempo: base.tempo || 60
  };

  if (estado.ouro < custo.ouro || estado.elixir < custo.elixir) {
    return notificar("Você não tem recursos suficientes.");
  }

  estado.ouro -= custo.ouro;
  estado.elixir -= custo.elixir;
  estado.construcoes[id] = {
    nivel: 1,
    termina: Date.now() + custo.tempo * 1000
  };

  salvar();
  atualizarTudo();
  reconstruirVila();
  notificar(`${base.nome} em construção.`);
}

function coletarRecursos() {
  let ouro = 0;
  let elixir = 0;

  Object.entries(estado.construcoes).forEach(([id, c]) => {
    if (c.termina > Date.now()) return;

    if (id.startsWith("mina")) ouro += 100 * c.nivel;
    if (id.startsWith("coletor")) elixir += 100 * c.nivel;
  });

  if (!ouro && !elixir) {
    ouro = 50;
    elixir = 50;
  }

  estado.ouro += ouro;
  estado.elixir += elixir;
  salvar();
  atualizarTudo();
  notificar(`Você recebeu ${formatar(ouro)} ouro e ${formatar(elixir)} elixir.`);
}

function montarProgresso() {
  const painel = document.getElementById("painelProgresso");
  if (!painel) return;
  const atual = Math.max(1, Math.min(4, estado.fortaleza));
  const era = erasFortaleza[Math.min(erasFortaleza.length - 1, Math.floor((atual - 1) / 4))];
  painel.innerHTML = `<div class="era-head"><div><p class="sobretitulo">MAPA DE ASCENSÃO</p><h3>${era[0]}</h3></div><strong>FORTALEZA ${atual}/4</strong></div><div class="era-track">${Array.from({length:4},(_,i)=>`<span class="era-step ${i+1<atual?'conquistado ':''}${i+1===atual?'atual':''}" title="Fortaleza ${i+1}">${i+1}</span>`).join('')}</div><p class="era-note">${era[1]} Próxima era: <strong>${atual < 4 ? `Fortaleza ${atual + 1}` : 'marco atual alcançado'}</strong>. Os marcos acima são a trilha planejada de progressão.</p>`;
}

function montarHeroi() {
  const painel = document.getElementById("painelHeroi");
  if (!painel) return;
  const h = estado.heroi || heroiBase;
  const xpProx = h.nivel * 100;
  painel.innerHTML = `<article class="heroi-card"><div class="heroi-portrait">${h.icone}</div><div><p class="sobretitulo">CAMPEÃO NÍVEL ${h.nivel}</p><h3>${h.nome}</h3><p class="descricao">Um líder original que cresce com as expedições do seu reino.</p><div class="hero-stat"><span>Experiência</span><strong>${h.xp} / ${xpProx} XP</strong></div><div class="barra-progresso"><span style="width:${Math.min(100, h.xp / xpProx * 100)}%"></span></div><div class="hero-stat"><span>Habilidade</span><strong>${h.habilidade}</strong></div><div class="equip-slot"><span>🔥</span><div><strong>Medalhão da Aurora</strong><small>Relíquia inicial • +8% poder do herói</small></div></div><div class="equip-slot"><span>🛡️</span><div><strong>Couraça do Vale</strong><small>🔒 Desbloqueia no Centro de Evolução nível 2</small></div></div><div class="bonus-unlock">Próximo marco: <strong>${estado.fortaleza >= 3 ? 'equipamentos ativos' : 'Fortaleza 3'}</strong>. Login e nuvem serão adicionados apenas com backend seguro; este protótipo salva no navegador.</div></div></article>`;
}

function montarSelecaoAtaque() {
  const el = document.getElementById("selecaoAtaque");
  if (!el) return;
  const ids = Object.entries(estado.tropas).filter(([id,q]) => q > 0);
  if (!ids.length) { el.innerHTML = '<p class="descricao">Treine tropas na Companhia para formar um destacamento.</p>'; return; }
  el.innerHTML = ids.map(([id,q]) => { const t=tropasDados[id]; const valor=Math.min(q, Number(selecaoAtaque[id] || 0)); return `<label class="selecao-unidade"><span class="unit-emoji">${t.icone}</span><span class="unit-info"><strong>${t.nome}</strong><small>${q} disponíveis · ${t.espacos} espaço(s)</small></span><input type="number" min="0" max="${q}" value="${valor}" data-selecao="${id}" aria-label="Quantidade ${t.nome}"></label>`; }).join('');
  el.querySelectorAll('[data-selecao]').forEach(input => input.addEventListener('input', () => { selecaoAtaque[input.dataset.selecao] = Math.max(0, Math.min(Number(input.max), Number(input.value) || 0)); atualizarResumoAtaque(); }));
  atualizarResumoAtaque();
}
function quantidadeSelecionada(){return Object.values(selecaoAtaque).reduce((a,b)=>a+(Number(b)||0),0)}
function atualizarResumoAtaque(){
 const n=quantidadeSelecionada(), espacos=Object.entries(selecaoAtaque).reduce((a,[id,q])=>a+(Number(q)||0)*(tropasDados[id]?.espacos||1),0);
 const r=document.getElementById('resumoAtaque'); if(r)r.textContent=n?`${n} tropa(s) · ${espacos}/${capacidadeAcampamentos()} espaços · toque para desembarcar`:'Escolha unidades para formar seu destacamento.';
 const btn=document.getElementById('btnAtacar'); if(btn){btn.disabled=!alvoSelecionado||n===0||espacos>capacidadeAcampamentos();btn.textContent=alvoSelecionado?'⚔️ INICIAR ATAQUE':'⚔️ ESCOLHA UM ALVO';}
}
function montarRivais(){
 const box=document.getElementById('listaRivais');if(!box)return;
 box.innerHTML=rivais.map(r=>`<button class="rival-card ${alvoSelecionado===r.id?'selecionado':''}" data-rival="${r.id}"><span class="rival-art">${r.emoji}</span><span class="rival-info"><b>${r.nome}</b><small>Fortaleza ${r.nivel} · ${r.torres} defesa(s) · risco ${r.botao}</small><small>🪙 ${r.ouro} · 🧪 ${r.elixir}</small></span><strong>INSPECIONAR</strong></button>`).join('');
 box.querySelectorAll('[data-rival]').forEach(b=>b.onclick=()=>{alvoSelecionado=rivais.find(r=>r.id===b.dataset.rival);montarRivais();const d=document.getElementById('resumoAlvo');d.innerHTML=`<b>${alvoSelecionado.emoji} ${alvoSelecionado.nome} selecionado</b><span>Base: ${alvoSelecionado.buildings.length} construções · ${alvoSelecionado.torres} torres. Recompensa máxima: 🪙 ${alvoSelecionado.ouro} + 🧪 ${alvoSelecionado.elixir}. O campo revelará a posição dos edifícios durante o ataque.</span>`;atualizarResumoAtaque()});
}

function atualizarRecursos() {
  document.getElementById("ouro").textContent = formatar(estado.ouro);
  document.getElementById("elixir").textContent = formatar(estado.elixir);
  document.getElementById("diamantes").textContent = formatar(estado.diamantes);
  document.getElementById("trabalhadores").textContent =
    `${trabalhadoresLivres()} / ${trabalhadoresTotal()}`;
  document.getElementById("nivelFortaleza").textContent = estado.fortaleza;
  document.getElementById("tituloFortaleza").textContent = `Fortaleza nível ${estado.fortaleza}`;
  ["perfilNivel", "profileLevel", "switchLevel"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = id === "perfilNivel" ? estado.fortaleza : `Fortaleza nível ${estado.fortaleza} • salvo aqui`; });
  const trofeus = document.getElementById("trofeus"); if (trofeus) trofeus.textContent = formatar((estado.vitorias || 0) * 12);
  document.getElementById("resumoNivel").textContent = `Nível ${estado.fortaleza}`;
  document.getElementById("resumoTropas").textContent = formatar(totalTropas());
  document.getElementById("resumoCapacidade").textContent = `${capacidadeAcampamentos()} espaços`;
  document.getElementById("tropasExercito").textContent = formatar(totalTropas());
  document.getElementById("espacosOcupados").textContent =
    `${espacosOcupados()} / ${capacidadeAcampamentos()}`;
}

function htmlBotao(texto, acao, desabilitado = false, classe = "botao-pequeno") {
  return `<button class="${classe}" data-acao="${acao}" ${desabilitado ? "disabled" : ""}>${texto}</button>`;
}

function montarListaConstrucoes() {
  const lista = document.getElementById("listaConstrucoes");
  const ids = [
    "fortaleza", "arsenal", "acampamento1", "acampamento2",
    "mina1", "coletor1", "depositoOuro", "depositoElixir",
    "torreBombardeira", "torreRaposa", "centroEvolucao",
    "lancaPedras", "poco", "catapulta", "santuario"
  ];

  lista.innerHTML = "";

  ids.forEach(id => {
    const dados = dadosConstrucoes[id] || {
      nome: id.startsWith("acampamento") ? "Acampamento" : id,
      icone: "🏕️", ouro: 500, elixir: 0, tempo: 60
    };

    const atual = estado.construcoes[id];
    const exigido = fortalezaNecessaria(id);

    if (!atual && estado.fortaleza < exigido) return;

    if (atual) {
      const ocupado = atual.termina > Date.now();
      const maximo = id === "fortaleza" ? 4 : 4;
      const custo = custoMelhoria(id, atual.nivel);

      lista.innerHTML += `
        <article class="construcao">
          <div class="construcao-topo">
            <span class="icone-construcao">${dados.icone}</span>
            <div>
              <h4>${dados.nome}</h4>
              <p>Nível ${atual.nivel}${atual.nivel >= maximo ? " • Máximo atual" : ""}</p>
            </div>
          </div>
          ${ocupado ? `
            <p>⏳ Em melhoria: ${tempoRestante(atual.termina)}</p>
            <div class="barra-progresso"><span style="width:${Math.max(5, 100 - (atual.termina - Date.now()) / (Math.max(1, custo.tempo) * 10))}%"></span></div>
          ` : `
            <div class="detalhe-custo">🪙 ${formatar(custo.ouro)} • 🧪 ${formatar(custo.elixir)} • ⏱️ ${formatar(custo.tempo)}s</div>
            ${atual.nivel < maximo
              ? htmlBotao("Melhorar", `melhorar:${id}`, false)
              : `<p>${id === "fortaleza" ? "Marco atual alcançado." : "Nível máximo desta construção."}</p>`}
          `}
        </article>`;
    } else {
      lista.innerHTML += `
        <article class="construcao">
          <div class="construcao-topo">
            <span class="icone-construcao">${dados.icone}</span>
            <div><h4>${dados.nome}</h4><p>Nova construção</p></div>
          </div>
          <div class="detalhe-custo">🪙 ${formatar(dados.ouro)} • 🧪 ${formatar(dados.elixir)} • ⏱️ ${formatar(dados.tempo)}s</div>
          ${htmlBotao("Construir", `construir:${id}`)}
        </article>`;
    }
  });

  lista.innerHTML += `
    <article class="construcao">
      <div class="construcao-topo"><span class="icone-construcao">🌲</span><div><h4>Recursos da vila</h4><p>Coleta de recursos para continuar evoluindo.</p></div></div>
      <div class="detalhe-custo">Receba ouro e elixir.</div>
      ${htmlBotao("Coletar recursos", "coletar")}
    </article>`;
}

function montarListaTropas() {
  const lista = document.getElementById("listaTropas");
  lista.innerHTML = "";

  Object.entries(tropasDados).forEach(([id, tropa]) => {
    const desbloqueada = estado.fortaleza >= 1 && nivelConstrucao("arsenal") >= tropa.nivel;
    const quantidade = estado.tropas[id] || 0;
    const custoTreinoOuro = tropa.ouro;
    const custoTreinoElixir = tropa.elixir;
    const espacoLivre = capacidadeAcampamentos() - espacosOcupados();
    const podeTreinar = desbloqueada && espacoLivre >= tropa.espacos &&
      estado.ouro >= custoTreinoOuro && estado.elixir >= custoTreinoElixir;

    lista.innerHTML += `
      <article class="tropa-card">
        <div class="construcao-topo">
          <span class="icone-construcao">${tropa.icone}</span>
          <div><h4>${tropa.nome}</h4><p>${quantidade} treinadas • ${tropa.espacos} espaço(s)</p></div>
        </div>
        <p>⚔️ Dano-base: ${tropa.dano} • ❤️ Vida-base: ${tropa.vida}</p>
        <p>Desbloqueio: Arsenal nível ${tropa.nivel}</p>
        ${desbloqueada
          ? `<div class="detalhe-custo">🪙 ${custoTreinoOuro} + 🧪 ${custoTreinoElixir}</div>
             ${htmlBotao("Treinar 1", `treinar:${id}`, !podeTreinar)}`
          : `<p>🔒 Ainda bloqueada.</p>`}
      </article>`;
  });
}

function treinarTropa(id) {
  const tropa = tropasDados[id];

  if (!tropa || nivelConstrucao("arsenal") < tropa.nivel) {
    return notificar("Seu Arsenal ainda não desbloqueou essa tropa.");
  }

  if (espacosOcupados() + tropa.espacos > capacidadeAcampamentos()) {
    return notificar("Não há espaço suficiente nos acampamentos.");
  }

  if (estado.ouro < tropa.ouro || estado.elixir < tropa.elixir) {
    return notificar("Recursos insuficientes para treinar essa tropa.");
  }

  estado.ouro -= tropa.ouro;
  estado.elixir -= tropa.elixir;
  estado.tropas[id] = (estado.tropas[id] || 0) + 1;

  salvar();
  atualizarTudo();
  notificar(`${tropa.nome} treinado!`);
}

const missoes = [
  { id: "primeira", titulo: "Primeiros passos", texto: "Tenha sua Fortaleza nível 1.", premio: 25, verifica: () => estado.fortaleza >= 1 },
  { id: "arsenal2", titulo: "Arsenal melhorado", texto: "Melhore seu Arsenal para nível 2.", premio: 50, verifica: () => nivelConstrucao("arsenal") >= 2 },
  { id: "primeiraBatalha", titulo: "Primeira batalha", texto: "Participe de uma batalha.", premio: 50, verifica: () => estado.batalhas >= 1 },
  { id: "vitoria", titulo: "Vitória inicial", texto: "Conquiste uma vitória em batalha.", premio: 100, verifica: () => estado.vitorias >= 1 },
  { id: "fortaleza2", titulo: "Expansão do reino", texto: "Alcance a Fortaleza nível 2.", premio: 100, verifica: () => estado.fortaleza >= 2 },
  { id: "fortaleza3", titulo: "Poder imperial", texto: "Alcance a Fortaleza nível 3.", premio: 150, verifica: () => estado.fortaleza >= 3 },
  { id: "fortaleza4", titulo: "Ascensão imperial", texto: "Alcance a Fortaleza nível 4.", premio: 250, verifica: () => estado.fortaleza >= 4 }
];

function montarMissoes() {
  const lista = document.getElementById("listaMissoes");
  lista.innerHTML = "";

  missoes.forEach(missao => {
    const concluida = missao.verifica();
    const reclamada = estado.missoesReclamadas.includes(missao.id);

    lista.innerHTML += `
      <article class="missao ${reclamada ? "concluida" : ""}">
        <h4>${reclamada ? "✅ " : concluida ? "🎁 " : "📜 "}${missao.titulo}</h4>
        <p>${missao.texto}</p>
        <p>Recompensa: 💎 ${missao.premio} diamantes</p>
        ${reclamada
          ? "<strong>Recompensa recebida</strong>"
          : htmlBotao(concluida ? "Resgatar" : "Em andamento", `missao:${missao.id}`, !concluida)}
      </article>`;
  });
}

function resgatarMissao(id) {
  const missao = missoes.find(m => m.id === id);
  if (!missao || estado.missoesReclamadas.includes(id) || !missao.verifica()) {
    return notificar("Essa missão ainda não pode ser resgatada.");
  }

  estado.diamantes += missao.premio;
  estado.missoesReclamadas.push(id);
  salvar();
  atualizarTudo();
  notificar(`Você recebeu ${missao.premio} diamantes!`);
}

const custosTrabalhadores = [300, 500, 700, 1000, 1200, 1500];

function montarLojaTrabalhadores() {
  const loja = document.getElementById("lojaTrabalhadores");
  loja.innerHTML = "";

  custosTrabalhadores.forEach((custo, indice) => {
    const comprado = estado.trabalhadoresComprados > indice;
    loja.innerHTML += `
      <div class="loja-trabalhador">
        <div><strong>Trabalhador ${indice + 2}</strong><p class="descricao">${comprado ? "Já contratado" : `Custo: 💎 ${custo}`}</p></div>
        ${comprado ? "<span>✅</span>" : htmlBotao("Contratar", `trabalhador:${indice}`, estado.diamantes < custo)}
      </div>`;
  });
}

function contratarTrabalhador(indice) {
  if (indice !== estado.trabalhadoresComprados) {
    return notificar("Contrate os trabalhadores em ordem.");
  }

  const custo = custosTrabalhadores[indice];
  if (custo === undefined) return notificar("Todos os trabalhadores disponíveis já foram contratados.");
  if (estado.diamantes < custo) return notificar("Diamantes insuficientes.");

  estado.diamantes -= custo;
  estado.trabalhadoresComprados++;
  salvar();
  atualizarTudo();
  notificar("Novo trabalhador contratado!");
}

function atualizarTudo() {
  atualizarRecursos();
  montarProgresso();
  montarSelecaoAtaque();
  montarRivais();
  montarHeroi();
  montarListaConstrucoes();
  montarListaTropas();
  montarMissoes();
  montarLojaTrabalhadores();

  document.getElementById("historicoBatalha").textContent =
    estado.ultimaBatalha || "Você ainda não participou de nenhuma batalha.";
}

function fecharPaineis() {
  document.querySelectorAll(".game-panel").forEach(p => p.classList.remove("open"));
  document.querySelector(".overlay-scrim")?.classList.remove("visible");
}
function abrirPainel(id) {
  fecharPaineis();
  document.getElementById(id)?.classList.add("open");
  document.querySelector(".overlay-scrim")?.classList.add("visible");
}
function fecharPainel(id) {
  document.getElementById(id)?.classList.remove("open");
  if (!document.querySelector(".game-panel.open")) document.querySelector(".overlay-scrim")?.classList.remove("visible");
}

function trocarTela(nome) {
  document.body.classList.toggle("subscreen", nome !== "vila");
  document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("ativo"));

  document.getElementById(`tela-${nome}`).classList.add("ativa");
  document.querySelector(`[data-tela="${nome}"]`).classList.add("ativo");

  if (nome === "vila") setTimeout(ajustarRenderizador, 100);
}

document.querySelector(".navegacao").addEventListener("click", evento => {
  const botao = evento.target.closest("[data-tela]");
  if (botao) trocarTela(botao.dataset.tela);
});

document.addEventListener("click", evento => {
  const telaBotao = evento.target.closest("[data-tela]");
  if (telaBotao && !telaBotao.disabled) {
    evento.preventDefault();
    trocarTela(telaBotao.dataset.tela);
    fecharPaineis();
    return;
  }
  const abrir = evento.target.closest("[data-open]");
  if (abrir) { evento.preventDefault(); abrirPainel(abrir.dataset.open); return; }
  const fechar = evento.target.closest("[data-close]");
  if (fechar) { evento.preventDefault(); fecharPainel(fechar.dataset.close); return; }
  if (evento.target.closest("[data-close-all]")) { fecharPaineis(); return; }
  if (evento.target.closest("#abrirPerfil")) { abrirPainel("profilePanel"); return; }
  const botao = evento.target.closest("[data-acao]");
  if (!botao || botao.disabled) return;

  const [acao, id] = botao.dataset.acao.split(":");

  if (acao === "melhorar") iniciarMelhoria(id);
  if (acao === "construir") construir(id);
  if (acao === "coletar") coletarRecursos();
  if (acao === "treinar") treinarTropa(id);
  if (acao === "missao") resgatarMissao(id);
  if (acao === "trabalhador") contratarTrabalhador(Number(id));
});

document.getElementById("btnAtacar").addEventListener("click", iniciarBatalha);
document.querySelectorAll('.zona-z').forEach(z=>z.addEventListener('click',()=>soltarTropa(z.dataset.zona)));
document.getElementById('voltarBatalha').addEventListener('click',()=>finalizarBatalha('retirada'));
document.getElementById('voltarVila').addEventListener('click',()=>{finalizarBatalha('retirada');trocarTela('vila')});
function iniciarBatalha(){
 if(!alvoSelecionado||!quantidadeSelecionada())return notificar('Escolha um povoado rival e pelo menos uma tropa.');
 const espacos=Object.entries(selecaoAtaque).reduce((a,[id,q])=>a+q*tropasDados[id].espacos,0);if(espacos>capacidadeAcampamentos())return notificar('Seu destacamento excede os espaços dos acampamentos.');
 const porTipo={};Object.entries(selecaoAtaque).forEach(([id,n])=>{if(n>0&&n<=estado.tropas[id])porTipo[id]=n});
 batalha={alvo:alvoSelecionado, porTipo, reservas:Object.entries(porTipo).map(([tipo,n])=>({tipo,restante:n})).filter(x=>x.restante), unidades:[], edificios:alvoSelecionado.buildings.map((b,i)=>({id:i,icone:b[0],nome:b[1],hp:b[2],maxHp:b[2],x:b[3],y:b[4],torre:b[1].includes('Torre')})), tempo:75,ticks:0,total:alvoSelecionado.buildings.length,encerrada:false,perdas:{},mortos:0};
 document.getElementById('preparacaoAtaque').hidden=true;document.getElementById('resultadoBatalha').hidden=true;document.getElementById('campoBatalha').hidden=false;document.getElementById('nomeAlvoCombate').textContent=alvoSelecionado.nome;document.getElementById('prediosRivais').innerHTML='';document.getElementById('tropasVisuais').innerHTML='';document.getElementById('efeitosCombate').innerHTML='';
 batalha.edificios.forEach((b,i)=>{const el=document.createElement('div');el.className='predio-inimigo';el.dataset.building=i;el.style.left=b.x+'%';el.style.top=b.y+'%';el.innerHTML=`<span>${b.icone}</span><b>${b.nome}</b><i><em style="width:100%"></em></i>`;document.getElementById('prediosRivais').appendChild(el)});
 const deploy=document.getElementById('seletorDeploy');deploy.innerHTML=Object.entries(porTipo).map(([id,n])=>`<button class="deploy-unit ${Object.keys(porTipo)[0]===id?'escolhida':''}" data-deploy="${id}"><span>${tropasDados[id].icone}</span><b>${tropasDados[id].nome}</b><small><i id="reserva-${id}">${n}</i> aguardando</small></button>`).join('');deploy.querySelectorAll('[data-deploy]').forEach(b=>b.onclick=()=>{deploy.querySelectorAll('.deploy-unit').forEach(x=>x.classList.remove('escolhida'));b.classList.add('escolhida')});
 atualizarHudBatalha();trocarTela('batalha');loopCombate=setInterval(passoCombate,500);timerBatalha=setInterval(()=>{if(!batalha||batalha.encerrada)return;batalha.tempo--;atualizarHudBatalha();if(batalha.tempo<=0)finalizarBatalha('tempo')},1000);notificar('Invasão iniciada! Escolha a unidade e toque numa zona dourada.');
}
function soltarTropa(zona){
 if(!batalha||batalha.encerrada)return;
 const id=document.querySelector('.deploy-unit.escolhida')?.dataset.deploy;if(!id)return notificar('Escolha primeiro uma tropa para desembarcar.');
 const slot=batalha.reservas.find(x=>x.tipo===id&&x.restante>0);if(!slot)return notificar('Não há mais unidades deste tipo aguardando.');slot.restante--;
 const d=tropasDados[id],n=batalha.unidades.length,origins={oeste:[6,55],leste:[94,55],sul:[50,91]},[x,y]=origins[zona];
 const unit={uid:Date.now()+Math.random(),tipo:id,hp:d.vida,maxHp:d.vida,dano:d.dano,x,y,alvo:null,proximoGolpe:0,zona};batalha.unidades.push(unit);
 const el=document.createElement('div');el.className='tropa-campo';el.dataset.uid=unit.uid;el.style.left=x+'%';el.style.top=y+'%';el.innerHTML=`<span>${d.icone}</span><i></i>`;document.getElementById('tropasVisuais').appendChild(el);requestAnimationFrame(()=>{const target=proximoAlvo(unit);if(target){unit.alvo=target.id;el.style.left=target.x+'%';el.style.top=(target.y+7)+'%';el.classList.add('marchando')}});actualizarReserva(id);atualizarHudBatalha();
}
function proximoAlvo(u){const vivos=batalha.edificios.filter(b=>b.hp>0);if(!vivos.length)return null;return vivos.sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y))[0]}
function atualizarReserva(id){const left=batalha.reservas.filter(x=>x.tipo===id).reduce((a,x)=>a+x.restante,0);const e=document.getElementById(`reserva-${id}`);if(e)e.textContent=left;const button=document.querySelector(`[data-deploy="${id}"]`);if(button){button.classList.toggle('esgotada',left===0);button.disabled=left===0}}
function passoCombate(){
 if(!batalha||batalha.encerrada)return;batalha.ticks++;
 batalha.unidades.filter(u=>u.hp>0).forEach(u=>{
   let alvo=batalha.edificios.find(b=>b.id===u.alvo&&b.hp>0);if(!alvo){alvo=proximoAlvo(u);if(alvo){u.alvo=alvo.id;const e=document.querySelector(`[data-uid="${u.uid}"]`);if(e){e.style.left=alvo.x+'%';e.style.top=(alvo.y+7)+'%'}}}
   if(alvo&&batalha.ticks>=u.proximoGolpe){u.proximoGolpe=batalha.ticks+2;const dano=Math.max(8,Math.round(u.dano/5));alvo.hp=Math.max(0,alvo.hp-dano);const b=document.querySelector(`[data-building="${alvo.id}"]`);if(b){b.classList.add('sob-golpe');setTimeout(()=>b.classList.remove('sob-golpe'),220);b.querySelector('em').style.width=(alvo.hp/alvo.maxHp*100)+'%';if(alvo.hp<=0){b.classList.add('destruido');b.querySelector('span').textContent='💥'}}}
 });
 if(batalha.ticks%4===0){batalha.edificios.filter(b=>b.hp>0&&b.torre).forEach(t=>{const vitimas=batalha.unidades.filter(u=>u.hp>0).sort((a,b)=>a.hp-b.hp);if(vitimas.length){const v=vitimas[0];v.hp-=22;const e=document.querySelector(`[data-uid="${v.uid}"]`);if(e)e.classList.add('atingida');if(v.hp<=0){v.hp=0;batalha.mortos++;batalha.perdas[v.tipo]=(batalha.perdas[v.tipo]||0)+1;if(e)e.classList.add('caiu')}}})}
 atualizarHudBatalha();if(batalha.edificios.every(b=>b.hp<=0)){finalizarBatalha('conquista')}
}
function atualizarHudBatalha(){if(!batalha)return;const d=Math.round(100*batalha.edificios.filter(b=>b.hp<=0).length/batalha.total);document.getElementById('pctDestruicao').textContent=`${d}% destruído`;document.getElementById('tropasCampoResumo').textContent=`${batalha.unidades.filter(u=>u.hp>0).length} no campo`;const aguardando=batalha.reservas.reduce((a,x)=>a+x.restante,0);document.getElementById('reservaResumo').textContent=`${aguardando} aguardando`;document.getElementById('tempoBatalha').textContent=`${String(Math.floor(batalha.tempo/60)).padStart(2,'0')}:${String(Math.max(0,batalha.tempo%60)).padStart(2,'0')}`}
function finalizarBatalha(motivo){
 if(!batalha||batalha.encerrada)return;batalha.encerrada=true;clearInterval(loopCombate);clearInterval(timerBatalha);loopCombate=timerBatalha=null;
 const total=Object.values(batalha.porTipo).reduce((a,b)=>a+b,0),mortos=batalha.mortos,vivos=batalha.unidades.filter(u=>u.hp>0).length,destruidos=batalha.edificios.filter(b=>b.hp<=0).length,destruicao=Math.round(destruidos/batalha.total*100),estrelas=(destruicao>=50?1:0)+(batalha.edificios[0].hp<=0?1:0)+(destruicao===100?1:0),fator=destruicao/100;
 Object.entries(batalha.porTipo).forEach(([id,q])=>{const perdidas=batalha.perdas[id]||0;estado.tropas[id]=Math.max(0,(estado.tropas[id]||0)-perdidas)});
 const ouro=Math.floor(batalha.alvo.ouro*fator),elixir=Math.floor(batalha.alvo.elixir*fator),cristais=estrelas===3?10:estrelas===2?5:0;estado.ouro+=ouro;estado.elixir+=elixir;estado.diamantes+=cristais;estado.batalhas++;if(estrelas)estado.vitorias++;estado.heroi=estado.heroi||{...heroiBase};estado.heroi.xp+=estrelas*24+Math.floor(destruicao/10);if(estado.heroi.xp>=estado.heroi.nivel*100){estado.heroi.xp-=estado.heroi.nivel*100;estado.heroi.nivel++}
 const fim=motivo==='conquista'?'base destruída':motivo==='tempo'?'tempo esgotado':motivo==='retirada'?'ataque encerrado':'tropas derrotadas';estado.ultimaBatalha=`${batalha.alvo.nome}: ${destruicao}% destruído · ${estrelas} estrela(s) · ${mortos} baixa(s) · +${ouro} ouro`;
 document.getElementById('campoBatalha').hidden=true;document.getElementById('preparacaoAtaque').hidden=false;document.getElementById('resultadoBatalha').hidden=false;document.getElementById('resultadoBatalha').innerHTML=`<p class="sobretitulo">RELATÓRIO DE CAMPO · ${batalha.alvo.nome}</p><h3>${destruicao>=50?'🏆 Vitória tática!':destruicao>0?'⚔️ Retirada estratégica':'🛡️ O rival resistiu'}</h3><div class="estrelas-resultado">${'★'.repeat(estrelas)}${'☆'.repeat(3-estrelas)}</div><h2>${destruicao}% destruído</h2><p>Resultado: ${fim}. Prédios derrubados: ${destruidos}/${batalha.total}.</p><p>Desembarcaram ${batalha.unidades.length}/${total} tropa(s): ${mortos} baixa(s), ${vivos} sobrevivente(s) em campo e ${batalha.reservas.reduce((a,x)=>a+x.restante,0)} não enviados (retornam à Companhia).</p><p>Recompensas: 🪙 ${ouro} ouro · 🧪 ${elixir} essência · 💎 ${cristais} cristais.</p><button class="botao-principal" id="novoAtaque">⚔️ ESCOLHER OUTRO RIVAL</button>`;
 document.getElementById('novoAtaque').onclick=()=>{document.getElementById('resultadoBatalha').hidden=true;alvoSelecionado=null;selecaoAtaque={};document.getElementById('resumoAlvo').textContent='Selecione um povoado para revelar a formação inimiga.';atualizarTudo()};salvar();atualizarTudo();notificar(`Combate encerrado: ${destruicao}% destruído, ${mortos} baixa(s).`)
}

function calcularPoderTropas(quantidadeEnviada) {
  const poderPorTropa = Object.entries(estado.tropas).map(([id, qtd]) => {
    const tropa = tropasDados[id];
    return { id, qtd, poder: tropa.dano + tropa.vida / 20 };
  });

  const totalPoder = poderPorTropa.reduce((soma, item) => soma + item.qtd * item.poder, 0);
  const media = totalPoder / Math.max(1, totalTropas());
  return Math.min(100, quantidadeEnviada * media * 1.1);
}

/* CENÁRIO 3D */
function iniciar3D() {
  const container = document.getElementById("jogo3d");

  if (!window.THREE) {
    container.innerHTML = '<p class="carregando">Não foi possível carregar o motor 3D. Verifique sua conexão.</p>';
    return;
  }

  cena = new THREE.Scene();
  cena.background = new THREE.Color(0x8eb7d2);
  cena.fog = new THREE.Fog(0x8eb7d2, 42, 92);

  camera = new THREE.PerspectiveCamera(
    48, container.clientWidth / container.clientHeight, 0.1, 200
  );
  camera.position.set(23, 26, 30);

  renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderizador.setSize(container.clientWidth, container.clientHeight);
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = "";
  container.appendChild(renderizador.domElement);

  const luzAmbiente = new THREE.HemisphereLight(0xe7f4ff, 0x4b5935, 1.5);
  cena.add(luzAmbiente);

  const sol = new THREE.DirectionalLight(0xfff1d1, 1.25);
  sol.position.set(-15, 30, 15);
  sol.castShadow = true;
  cena.add(sol);

  if (THREE.OrbitControls) {
    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.target.set(0, 0, 0);
    controles.enableDamping = true;
    controles.minDistance = 15;
    controles.maxDistance = 48;
    controles.maxPolarAngle = Math.PI / 2.15;
    controles.update();
  }

  criarTerreno();
  reconstruirVila();

  window.addEventListener("resize", ajustarRenderizador);

  function animar() {
    requestAnimationFrame(animar);
    if (controles) controles.update();
    renderizador.render(cena, camera);
  }
  animar();
}

function material(cor, rugosidade = 0.9) {
  return new THREE.MeshStandardMaterial({ color: cor, roughness: rugosidade });
}

function adicionarCaixa(x, y, z, largura, altura, profundidade, cor, grupo = cena) {
  const geometria = new THREE.BoxGeometry(largura, altura, profundidade);
  const malha = new THREE.Mesh(geometria, material(cor));
  malha.position.set(x, y + altura / 2, z);
  malha.castShadow = true;
  malha.receiveShadow = true;
  grupo.add(malha);
  return malha;
}

function criarTerreno() {
  const terreno = new THREE.Mesh(
    new THREE.PlaneGeometry(52, 52),
    material(0x4f8c43)
  );
  terreno.rotation.x = -Math.PI / 2;
  terreno.position.y = -0.03;
  terreno.receiveShadow = true;
  cena.add(terreno);

  for (let x = -24; x <= 24; x += 4) {
    for (let z = -24; z <= 24; z += 4) {
      const detalhe = new THREE.Mesh(
        new THREE.CircleGeometry(0.13 + Math.random() * 0.12, 6),
        material(Math.random() > 0.5 ? 0x6c9c4e : 0x47763b)
      );
      detalhe.rotation.x = -Math.PI / 2;
      detalhe.position.set(x + Math.random() * 1.5, 0.01, z + Math.random() * 1.5);
      cena.add(detalhe);
    }
  }

  adicionarCaixa(0, 0, 0, 9, 0.18, 9, 0x96764c);
  adicionarCaixa(0, 0.18, 0, 7.6, 0.12, 7.6, 0xc3a16a);

  // Caminhos sinuosos e cercas de madeira, com paleta própria do Vale.
  adicionarCaixa(0, 0.01, 5, 2.2, 0.04, 12, 0xb79a6b);
  adicionarCaixa(-5, 0.01, 0, 12, 0.04, 2.2, 0xb79a6b);
  // Cercado de pedra ao redor do núcleo da vila.
  for (let i = -12; i <= 12; i += 1.5) {
    if (Math.abs(i) > 2.5) {
      adicionarCaixa(i, .02, -12, 1.15, .65, .45, i % 3 ? 0x988967 : 0xb49a68);
      adicionarCaixa(i, .02, 12, 1.15, .65, .45, i % 2 ? 0xa28e65 : 0xc0a875);
      adicionarCaixa(-12, .02, i, .45, .65, 1.15, i % 2 ? 0x988967 : 0xb49a68);
      adicionarCaixa(12, .02, i, .45, .65, 1.15, i % 3 ? 0xa28e65 : 0xc0a875);
    }
  }
  // Pequenas pedras e flores coloridas trazem densidade ao terreno sem imagens de terceiros.
  for (let i = 0; i < 95; i++) {
    const x = (Math.random() - .5) * 34, z = (Math.random() - .5) * 34;
    if (Math.abs(x) < 12.5 && Math.abs(z) < 12.5) continue;
    const flower = new THREE.Mesh(new THREE.SphereGeometry(.13 + Math.random() * .12, 6, 5), material([0xe9d46a,0xc96d53,0xd9e5ba,0x9dbf70][Math.floor(Math.random()*4)]));
    flower.position.set(x, .12, z); flower.castShadow = true; cena.add(flower);
  }

  // Árvores decorativas
  for (let i = 0; i < 52; i++) {
    const x = (Math.random() - 0.5) * 45;
    const z = (Math.random() - 0.5) * 45;
    if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
    criarArvore(x, z);
  }
}

function criarArvore(x, z) {
  const tronco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6),
    material(0x68452c)
  );
  tronco.position.set(x, 0.6, z);
  cena.add(tronco);

  const copa = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.8, 7),
    material(0x2f6335)
  );
  copa.position.set(x, 1.8, z);
  copa.castShadow = true;
  cena.add(copa);
}

function criarCasa(x, z, cor = 0xb7a17d) {
  const grupo = new THREE.Group();
  grupo.position.set(x, 0, z);
  cena.add(grupo);

  adicionarCaixa(0, 0, 0, 2.3, 1.6, 2, cor, grupo);

  const telhado = new THREE.Mesh(
    new THREE.ConeGeometry(1.65, 1.2, 4),
    material(0x713d2b)
  );
  telhado.position.set(0, 2.1, 0);
  telhado.rotation.y = Math.PI / 4;
  telhado.castShadow = true;
  grupo.add(telhado);

  adicionarCaixa(0, 0.05, 1.02, 0.45, 0.9, 0.08, 0x51331f, grupo);
  return grupo;
}

function criarTorre(x, z, cor = 0x858b91, altura = 3.5) {
  const grupo = new THREE.Group();
  grupo.position.set(x, 0, z);
  cena.add(grupo);

  adicionarCaixa(0, 0, 0, 1.6, altura, 1.6, cor, grupo);
  adicionarCaixa(0, altura, 0, 2, 0.4, 2, 0x554d43, grupo);
  adicionarCaixa(0, altura + 0.2, 0, 0.7, 0.5, 0.7, 0x9c7954, grupo);
  return grupo;
}

function criarFortaleza() {
  const nivel = estado.fortaleza;
  const altura = 3.2 + nivel * 0.45;
  const cor = nivel >= 4 ? 0x8c9aaf : 0x8d8e89;

  adicionarCaixa(0, 0.25, 0, 5.2, altura, 5.2, cor);
  adicionarCaixa(0, altura + 0.25, 0, 5.8, 0.45, 5.8, 0x554d43);
  adicionarCaixa(0, altura + 0.5, 0, 1.3, 1.5, 1.3, 0xb6a17d);
  adicionarCaixa(0, altura + 1.3, 0, 1.6, 0.3, 1.6, 0x9c4b2e);

  criarTorre(-2.1, -2.1, 0x7e858c, altura * 0.7);
  criarTorre(2.1, -2.1, 0x7e858c, altura * 0.7);
  criarTorre(-2.1, 2.1, 0x7e858c, altura * 0.7);
  criarTorre(2.1, 2.1, 0x7e858c, altura * 0.7);

  // Bandeira
  const mastro = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.5, 6),
    material(0x463522)
  );
  mastro.position.set(0, altura + 2, 0);
  cena.add(mastro);

  const bandeira = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.7, 0.08),
    material(0xe77e28)
  );
  bandeira.position.set(0.5, altura + 2.5, 0);
  cena.add(bandeira);
}

function reconstruirVila() {
  if (!cena) return;

  objetosVila.forEach(obj => cena.remove(obj));
  objetosVila = [];

  // Os elementos principais são recriados de acordo com o estado atual.
  criarFortaleza();

  const construcoes = Object.keys(estado.construcoes).filter(id =>
    id !== "fortaleza" && estado.construcoes[id].termina <= Date.now()
  );

  const posicoes = [
    [-7, -5], [7, -5], [-7, 5], [7, 5],
    [-11, 0], [11, 0], [0, -10], [0, 10],
    [-10, -9], [10, -9], [-10, 9], [10, 9],
    [-5, -11], [5, -11], [-5, 11], [5, 11]
  ];

  construcoes.forEach((id, i) => {
    const pos = posicoes[i % posicoes.length];
    if (id.startsWith("torre")) {
      criarTorre(pos[0], pos[1], id === "torreRaposa" ? 0x9b7049 : 0x777e86, 2.5 + nivelConstrucao(id) * 0.35);
    } else if (id.startsWith("acampamento")) {
      criarCasa(pos[0], pos[1], 0xb4a17a);
    } else if (id === "arsenal") {
      criarCasa(pos[0], pos[1], 0x8b8e9b);
    } else if (id.startsWith("mina")) {
      criarCasa(pos[0], pos[1], 0x9a754c);
    } else if (id.startsWith("coletor")) {
      criarCasa(pos[0], pos[1], 0x4e8e79);
    } else if (id.startsWith("deposito")) {
      criarCasa(pos[0], pos[1], 0xb39b70);
    } else {
      criarCasa(pos[0], pos[1], 0x7c8c70);
    }
  });
}

function ajustarRenderizador() {
  if (!camera || !renderizador) return;

  const container = document.getElementById("jogo3d");
  const largura = Math.max(1, container.clientWidth);
  const altura = Math.max(1, container.clientHeight);

  camera.aspect = largura / altura;
  camera.updateProjectionMatrix();
  renderizador.setSize(largura, altura);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    concluirTemporizadores();
    atualizarTudo();
  }
});

function iniciarJogo() {
  concluirTemporizadores();
  atualizarTudo();
  iniciar3D();

  setInterval(() => {
    concluirTemporizadores();
    atualizarTudo();
  }, 1000);
}

iniciarJogo();