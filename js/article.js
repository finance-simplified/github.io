document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('#article-detail');
  const id = new URLSearchParams(location.search).get('id');
  const endpoint = window.SITE_CONFIG?.contentEndpoint || 'data/articles.json';
  const decodeText = value => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = String(value ?? '');
    return textarea.value;
  };

  const appendText = (parent, tagName, value, className = '') => {
    if (!value) return null;
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = decodeText(value);
    parent.append(element);
    return element;
  };

  const appendRichText = (parent, value) => {
    if (!value) return;
    const source = document.createElement('template');
    source.innerHTML = `<p>${String(value)}</p>`;
    const allowed = new Set(['P', 'STRONG', 'B', 'EM', 'I', 'IMG']);
    [...source.content.querySelectorAll('*')].forEach(element => {
      if (!allowed.has(element.tagName)) {
        element.replaceWith(document.createTextNode(element.textContent || ''));
        return;
      }
      if (element.tagName === 'IMG') {
        const src = element.getAttribute('src') || '';
        if (!/^assets\/[A-Za-z0-9._-]+$/.test(src)) {
          element.remove();
          return;
        }
        const alt = element.getAttribute('alt') || '';
        [...element.attributes].forEach(attribute => element.removeAttribute(attribute.name));
        element.setAttribute('src', src);
        element.setAttribute('alt', alt);
        element.setAttribute('loading', 'lazy');
      } else {
        [...element.attributes].forEach(attribute => element.removeAttribute(attribute.name));
      }
    });
    parent.append(source.content);
  };

  const renderNotFound = message => {
    root.replaceChildren();
    appendText(root, 'h1', message);
    appendText(root, 'p', 'Browse the archive to find the newest published stories.');
    const link = document.createElement('a');
    link.className = 'button';
    link.href = 'articles.html';
    link.textContent = 'View all articles';
    root.append(link);
  };

  try {
    const url = new URL(endpoint, document.baseURI);
    url.searchParams.set('updated', Date.now().toString());
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Article data is unavailable');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Article data has an invalid format');
    const article = data.find(item => item && item.id === id && item.status !== 'draft' && item.status !== 'review');
    if (!article) {
      renderNotFound('Article not found.');
      return;
    }

    root.replaceChildren();
    document.title = `${decodeText(article.title)} · Veyn`;
    const back = document.createElement('a');
    back.className = 'text-link';
    back.href = 'articles.html';
    back.textContent = '← All articles';
    root.append(back);
    appendText(root, 'p', `${article.category || 'Article'} · ${article.date || ''}`, 'eyebrow');
    appendText(root, 'h1', article.title || 'Untitled article');
    appendText(root, 'p', article.summary || '', 'dek');

    const meta = document.createElement('div');
    meta.className = 'pub-meta';
    [article.readTime ? `${article.readTime} read` : '', ...(Array.isArray(article.tags) ? article.tags : [])]
      .filter(Boolean)
      .forEach(value => appendText(meta, 'span', value));
    root.append(meta);

    const body = document.createElement('div');
    body.className = 'article-body';
    const fields = article.body && typeof article.body === 'object' ? article.body : {};
    appendRichText(body, fields.intro);
    appendText(body, 'h2', fields.heading1);
    appendRichText(body, fields.section1);
    if (fields.quote) appendText(body, 'blockquote', fields.quote);
    appendText(body, 'h2', fields.heading2);
    appendRichText(body, fields.section2);
    appendRichText(body, fields.close);
    root.append(body);
  } catch (error) {
    renderNotFound('Article could not be loaded.');
  }
});
