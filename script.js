const state = {
  filmes: [],
  busca: '',
  genero: 'Todos',
  ordenacao: 'destaque'
};

const $ = (selector) => document.querySelector(selector);
const movieGrid = $('#movieGrid');
const emptyState = $('#emptyState');
const resultsInfo = $('#resultsInfo');
const searchInput = $('#searchInput');
const clearSearch = $('#clearSearch');
const genreFilter = $('#genreFilter');
const sortFilter = $('#sortFilter');
const genreCards = $('#genreCards');
const modal = $('#movieModal');
const modalContent = $('#modalContent');
const navLinks = $('#navLinks');

const genreMeta = {
  'Ficção científica / Mente': ['🚀', 'Ideias, ciência e mente'],
  'Drama / Emoção': ['🎭', 'Histórias marcantes'],
  'Suspense / Terror': ['👻', 'Mistério e tensão'],
  'Romance': ['❤️', 'Histórias de amor'],
  'Comédia': ['😂', 'Para dar boas risadas'],
  'Ação': ['💥', 'Adrenalina e aventura'],
  'Aventura': ['🗺️', 'Grandes jornadas'],
  'Fantasia': ['🪄', 'Mundos mágicos']
};

async function carregarFilmes() {
  try {
    const resposta = await fetch('filmes.json');
    if (!resposta.ok) throw new Error('Não foi possível carregar filmes.json');
    state.filmes = await resposta.json();
    montarFiltros();
    renderizarGeneros();
    renderizarFilmes();
  } catch (erro) {
    console.error(erro);
    movieGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Não foi possível carregar o catálogo</h3><p>Verifique se o arquivo filmes.json está no mesmo diretório do site.</p></div>';
  }
}

function todosGeneros() {
  return [...new Set(state.filmes.flatMap(filme => filme.generos || []))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function montarFiltros() {
  genreFilter.innerHTML = '<option value="Todos">🎭 Todos os gêneros</option>';
  todosGeneros().forEach(genero => {
    const option = document.createElement('option');
    option.value = genero;
    option.textContent = `🎭 ${genero}`;
    genreFilter.appendChild(option);
  });
}

function notaNumerica(filme) {
  if (filme.nota !== null && filme.nota !== undefined && filme.nota !== '') {
    const n = Number(filme.nota);
    return Number.isFinite(n) ? n : null;
  }
  if (filme.notaFaixa) {
    const match = String(filme.notaFaixa).replace(',', '.').match(/\d+(?:\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return null;
}

function textoNota(filme) {
  if (filme.notaFaixa) return filme.notaFaixa;
  const nota = notaNumerica(filme);
  if (nota === null) return 'Sem nota';
  return nota.toFixed(1);
}

function textoAno(filme) {
  return filme.ano ? filme.ano : 'Ano não informado';
}

function textoStatus(filme) {
  if (filme.status === 'já visto') return '✓ Já assisti';
  if (filme.status === 'não visto' || filme.status === 'quero assistir') return '📌 Quero assistir';
  return filme.status || '';
}

function filmesFiltrados() {
  const termo = state.busca.trim().toLowerCase();
  let lista = state.filmes.filter(filme => {
    const texto = `${filme.titulo} ${filme.ano || ''} ${(filme.generos || []).join(' ')} ${filme.status || ''}`.toLowerCase();
    const bateBusca = !termo || texto.includes(termo);
    const bateGenero = state.genero === 'Todos' || (filme.generos || []).includes(state.genero);
    return bateBusca && bateGenero;
  });

  if (state.ordenacao === 'recentes') lista.sort((a, b) => (b.ano || 0) - (a.ano || 0));
  if (state.ordenacao === 'nota') lista.sort((a, b) => (notaNumerica(b) || 0) - (notaNumerica(a) || 0));
  if (state.ordenacao === 'titulo') lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  if (state.ordenacao === 'destaque') lista.sort((a, b) => Number(b.destaque) - Number(a.destaque) || (notaNumerica(b) || 0) - (notaNumerica(a) || 0));

  return lista;
}

function renderizarFilmes() {
  const lista = filmesFiltrados();
  resultsInfo.textContent = `${lista.length} ${lista.length === 1 ? 'filme encontrado' : 'filmes encontrados'}`;
  movieGrid.innerHTML = '';

  if (!lista.length) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  lista.forEach(filme => {
    const card = document.createElement('article');
    card.className = 'movie-card';
    const nota = textoNota(filme);
    const status = textoStatus(filme);
    card.innerHTML = `
      <div class="movie-info">
        <h3 class="movie-title" title="${escapeAttr(filme.titulo)}">${escapeHtml(filme.titulo)}</h3>
        ${status ? `<span class="movie-status">${escapeHtml(status)}</span>` : ''}
        <div class="movie-meta">
          <span>${escapeHtml(textoAno(filme))}</span>
          <span>•</span>
          <span class="rating">★ ${escapeHtml(nota)}</span>
        </div>
        <div class="movie-genres">${escapeHtml((filme.generos || []).join(' • '))}</div>
        <div class="movie-actions">
          <button class="btn btn-secondary" data-details="${filme.id}">Detalhes</button>
          <a class="btn btn-primary" href="${escapeAttr(filme.assistir || 'https://www.justwatch.com/br')}" target="_blank" rel="noopener noreferrer">Onde assistir</a>
        </div>
      </div>
    `;
    movieGrid.appendChild(card);
  });
}

function renderizarGeneros() {
  const generos = todosGeneros().slice(0, 10);
  genreCards.innerHTML = generos.map(genero => {
    const meta = genreMeta[genero] || ['🎬', 'Explore este gênero'];
    const quantidade = state.filmes.filter(filme => (filme.generos || []).includes(genero)).length;
    return `
      <button class="genre-card" data-genre-card="${escapeAttr(genero)}">
        <span class="emoji">${meta[0]}</span>
        <strong>${escapeHtml(genero)}</strong>
        <small>${quantidade} ${quantidade === 1 ? 'filme' : 'filmes'}</small>
      </button>
    `;
  }).join('');
}

function abrirDetalhes(id) {
  const filme = state.filmes.find(item => item.id === Number(id));
  if (!filme) return;

  const nota = textoNota(filme);
  const status = textoStatus(filme);
  const trailer = filme.trailer || `https://www.youtube.com/results?search_query=${encodeURIComponent(filme.titulo + ' trailer')}`;
  const assistir = filme.assistir || 'https://www.justwatch.com/br';

  modalContent.innerHTML = `
    <div class="modal-copy">
      <span class="eyebrow">${escapeHtml(textoAno(filme))} • ★ ${escapeHtml(nota)}</span>
      <h2 id="modalTitle">${escapeHtml(filme.titulo)}</h2>
      ${status ? `<span class="movie-status">${escapeHtml(status)}</span>` : ''}
      <div class="modal-tags">${(filme.generos || []).map(g => `<span class="modal-tag">${escapeHtml(g)}</span>`).join('')}</div>
      <p>${escapeHtml(filme.sinopse || 'Sem sinopse cadastrada.')}</p>
      <div class="modal-actions">
        <a class="btn btn-primary" href="${escapeAttr(assistir)}" target="_blank" rel="noopener noreferrer">🔗 Onde assistir</a>
        <a class="btn btn-secondary" href="${escapeAttr(trailer)}" target="_blank" rel="noopener noreferrer">▶ Ver trailer</a>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function escapeHtml(valor) {
  return String(valor ?? '').replace(/[&<>'"]/g, caractere => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[caractere]);
}

function escapeAttr(valor) {
  return escapeHtml(valor);
}

searchInput.addEventListener('input', (evento) => {
  state.busca = evento.target.value;
  clearSearch.style.display = state.busca ? 'block' : 'none';
  renderizarFilmes();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  state.busca = '';
  clearSearch.style.display = 'none';
  renderizarFilmes();
  searchInput.focus();
});

genreFilter.addEventListener('change', (evento) => {
  state.genero = evento.target.value;
  renderizarFilmes();
});

sortFilter.addEventListener('change', (evento) => {
  state.ordenacao = evento.target.value;
  renderizarFilmes();
});

document.addEventListener('click', (evento) => {
  const detalhes = evento.target.closest('[data-details]');
  if (detalhes) abrirDetalhes(detalhes.dataset.details);

  const genero = evento.target.closest('[data-genre]');
  if (genero) {
    state.genero = genero.dataset.genre;
    genreFilter.value = state.genero;
    document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' });
    renderizarFilmes();
  }

  const generoCard = evento.target.closest('[data-genre-card]');
  if (generoCard) {
    state.genero = generoCard.dataset.genreCard;
    genreFilter.value = state.genero;
    document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' });
    renderizarFilmes();
  }

  if (evento.target.id === 'modalClose' || evento.target.id === 'modalBackdrop') fecharModal();
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') fecharModal();
});

$('#resetFilters').addEventListener('click', () => {
  state.busca = '';
  state.genero = 'Todos';
  state.ordenacao = 'destaque';
  searchInput.value = '';
  genreFilter.value = 'Todos';
  sortFilter.value = 'destaque';
  clearSearch.style.display = 'none';
  renderizarFilmes();
});

if (navLinks && $('#mobileMenu')) {
  $('#mobileMenu').addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.addEventListener('click', () => navLinks.classList.remove('open'));
}

carregarFilmes();
