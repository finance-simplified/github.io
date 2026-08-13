document.addEventListener('DOMContentLoaded', async () => {
  const endpoint = window.SITE_CONFIG?.contentEndpoint || 'data/articles.json';

  const loadArticles = async () => {
    const url = new URL(endpoint, document.baseURI);
    url.searchParams.set('updated', Date.now().toString());
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Article data is unavailable');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Article data has an invalid format');
    return data
      .filter(article => article && typeof article === 'object' && article.status !== 'draft' && article.status !== 'review')
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  };

  const decodeText = value => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value ?? '');
    return textarea.value;
  };
  const articleLink = article => `article.html?id=${encodeURIComponent(String(article.id || ''))}`;
  const formatDate = value => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? String(value || '')
      : new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  const makeArticleCard = (article, index) => {
    const item = document.createElement('article');
    item.className = 'publication';
    item.dataset.category = decodeText(article.category || 'Article');

    const link = articleLink(article);
    const visual = document.createElement('a');
    visual.className = `pub-visual visual-${(index % 4) + 1}`;
    visual.href = link;
    visual.setAttribute('aria-label', `Read ${decodeText(article.title || 'article')}`);
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const category = document.createElement('b');
    category.textContent = decodeText(article.category || 'Article');
    visual.append(number, category);

    const copy = document.createElement('div');
    copy.className = 'pub-copy';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = `${decodeText(article.category || 'Article')} · ${formatDate(article.date)}`;
    const heading = document.createElement('h3');
    const titleLink = document.createElement('a');
    titleLink.href = link;
    titleLink.textContent = decodeText(article.title || 'Untitled article');
    heading.append(titleLink);
    const summary = document.createElement('p');
    summary.textContent = decodeText(article.summary || '');
    const meta = document.createElement('div');
    meta.className = 'pub-meta';
    const metadata = [article.readTime ? `${article.readTime} read` : '', ...(Array.isArray(article.tags) ? article.tags : [])];
    metadata.filter(Boolean).forEach(value => {
      const tag = document.createElement('span');
      tag.textContent = decodeText(value);
      meta.append(tag);
    });
    const readLink = document.createElement('a');
    readLink.className = 'text-link';
    readLink.href = link;
    readLink.textContent = 'Read article →';
    copy.append(eyebrow, heading, summary, meta, readLink);
    item.append(visual, copy);
    return item;
  };

  const renderList = (root, articles, limit) => {
    root.replaceChildren();
    const visible = typeof limit === 'number' ? articles.slice(0, limit) : articles;
    if (!visible.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No published articles yet. Check back soon.';
      root.append(empty);
      return;
    }
    visible.forEach((article, index) => root.append(makeArticleCard(article, index)));
  };

  const renderFilters = (root, list, articles) => {
    const categories = [...new Set(articles.map(article => decodeText(article.category || 'Article')))];
    const options = [['all', 'All'], ...categories.map(category => [category, category])];
    options.forEach(([value, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.filter = value;
      button.textContent = label;
      if (index === 0) button.classList.add('active');
      button.addEventListener('click', () => {
        root.querySelectorAll('button').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        list.querySelectorAll('.publication').forEach(card => {
          card.hidden = value !== 'all' && card.dataset.category !== value;
        });
      });
      root.append(button);
    });
  };

  try {
    const articles = await loadArticles();
    document.documentElement.dataset.articleCount = String(articles.length);

    const archive = document.querySelector('#article-list');
    if (archive) {
      renderList(archive, articles);
      const filters = document.querySelector('#article-filters');
      if (filters) renderFilters(filters, archive, articles);
    }

    const latest = document.querySelector('#latest-articles');
    if (latest) renderList(latest, articles, Number(latest.dataset.limit) || 3);

    const newest = articles[0];
    if (newest) {
      const title = document.querySelector('#latest-issue-title');
      const date = document.querySelector('#latest-issue-date');
      const link = document.querySelector('#latest-issue-link');
      if (title) title.textContent = decodeText(newest.title || 'Latest story');
      if (date) date.textContent = formatDate(newest.date).toUpperCase();
      if (link) link.href = articleLink(newest);
    }
  } catch (error) {
    document.documentElement.dataset.articleCount = 'unavailable';
    document.querySelectorAll('#article-list, #latest-articles').forEach(root => {
      const message = document.createElement('p');
      message.className = 'empty-state';
      message.textContent = 'Articles could not be loaded. Please try again shortly.';
      root.replaceChildren(message);
    });
  }
});
