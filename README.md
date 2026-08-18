# 🎬 CineLink — Catálogo de Filmes

Site estático para organizar filmes, informações, trailers e links para serviços de terceiros.

## 📁 Estrutura

- `index.html` — estrutura da página
- `style.css` — visual e responsividade
- `script.js` — busca, filtros, ordenação e janela de detalhes
- `filmes.json` — banco de dados simples do catálogo

## ➕ Como adicionar um filme

Abra `filmes.json` e adicione um novo objeto seguindo este modelo:

```json
{
  "id": 9,
  "titulo": "Nome do Filme",
  "ano": 2026,
  "generos": ["Ação", "Aventura"],
  "nota": 8.5,
  "destaque": true,
  "capa": "URL_DA_CAPA",
  "sinopse": "Descrição do filme.",
  "trailer": "URL_DO_TRAILER",
  "assistir": "URL_DE_UM_SERVICO_OU_PAGINA_AUTORIZADA"
}
```

Depois é só salvar o arquivo no GitHub. O catálogo lê o JSON automaticamente.

## 🌐 Publicação

O projeto foi preparado para funcionar como site estático no GitHub Pages. Depois de ativar o Pages para a branch `main`, o endereço normalmente será:

`https://jhoncorretor2025-blip.github.io/filmes/`

## ⚖️ Uso responsável

O CineLink não hospeda, distribui ou armazena filmes. Os links externos devem apontar para páginas e serviços que tenham autorização para disponibilizar o conteúdo. Não utilize o catálogo para indexar cópias não autorizadas ou conteúdo pirateado.
