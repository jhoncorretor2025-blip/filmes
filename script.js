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

const genreMeta = {
  'Ação': ['💥', 'Adrenalina e aventura'],
  'Comédia': ['😂', 'Para dar boas risadas'],
  'Romance': ['❤️', 'Histórias de amor'],
  'Terror': ['👻', 'Arrepios garantidos'],
  'Ficção científica': ['🚀', 'Mundos extraordinários'],
  'Drama': ['🎭', 'Histórias marcantes'],
  'Aventura': ['🗺️', 'Grandes jornadas'],
  'Suspense': ['🕵️', 'Mistério e tensão'],
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
  genreFilter.innerHTML = '<option value="Todos">Todos os gêneros</option>';
  todosGeneros().forEach(genero => {
    const option = document.createElement('option');
    option.value = genero;
    option.textContent = genero;
    genreFilter.appendChild(option);
  });
}

function filmesFiltrados() {
  const termo = state.busca.trim().toLowerCase();
  let lista = state.filmes.filter(filme => {
    const texto = `${filme.titulo} ${filme.ano} ${(filme.generos || []).join(' ')}`.toLowerCase();
    const bateBusca = !termo || texto.includes(termo);
    const bateGenero = state.genero === 'Todos' || (filme.generos || []).includes(state.genero);
    return bateBusca && bateGenero;
  });

  if (state.ordenacao === 'recentes') lista.sort((a, b) => b.ano - a.ano);
  if (state.ordenacao === 'nota') lista.sort((a, b) => b.nota - a.nota);
  if (state.ordenacao === 'titulo') lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  if (state.ordenacao === 'destaque') lista.sort((a, b) => Number(b.destaque) - Number(a.destaque) || b.nota - a.nota);

  return lista;
}

function imagemComFallback(url, titulo) {
  if (!url) return `<div class="poster-fallback" aria-label="${escapeHtml(titulo)}">▶</div>`;
  return `<img class="movie-poster" src="${escapeAttr(url)}" alt="Capa de ${escapeAttr(titulo)}" loading="lazy" onerror="this.outerHTML='<div class=\'poster-fallback\'>▶</div>'">`;
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
    card.innerHTML = `
      ${imagemComFallback(filme.capa, filme.titulo)}
      <div class="movie-info">
        <h3 class="movie-title" title="${escapeAttr(filme.titulo)}">${escapeHtml(filme.titulo)}</h3>
        <div class="movie-meta">
          <span>${filme.ano}</span>
          <span>•</span>
          <span class="rating">★ ${Number(filme.nota).toFixed(1)}</span>
        </div>
        <div class="movie-actions">
          <button class="btn btn-secondary" data-details="${filme.id}">Detalhes</button>
          <a class="btn btn-primary" href="${escapeAttr(filme.assistir)}" target="_blank" rel="noopener noreferrer">Onde assistir</a>
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

  modalContent.innerHTML = `
    <div class="modal-hero">
      ${imagemComFallback(filme.capa, filme.titulo)}
      <div class="modal-copy">
        <span class="eyebrow">${filme.ano} • ★ ${Number(filme.nota).toFixed(1)}</span>
        <h2 id="modalTitle">${escapeHtml(filme.titulo)}</h2>
        <div class="modal-tags">${(filme.generos || []).map(g => `<span class="modal-tag">${escapeHtml(g)}</span>`).join('')}</div>
        <p>${escapeHtml(filme.sinopse || 'Sem sinopse cadastrada.')}</p>
        <div class="modal-actions">
          <a class="btn btn-primary" href="${escapeAttr(filme.assistir)}" target="_blank" rel="noopener noreferrer">🔗 Onde assistir</a>
          <a class="btn btn-secondary" href="${escapeAttr(filme.trailer)}" target="_blank" rel="noopener noreferrer">▶ Ver trailer</a>
        </div>
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

$('#modalClose').addEventListener('click', fecharModal);
$('#modalBackdrop').addEventListener('click', fecharModal);
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') fecharModal();
});

$('#mobileMenu').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('.nav-links').classList.remove('open');
}));

carregarFilmes();
