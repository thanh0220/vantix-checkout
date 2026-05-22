const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '_posts');
const BLOG_DIR = path.join(__dirname, 'blog');

function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function isoDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0];
}

function esc(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escJson(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function generateHtml(slug, data, bodyHtml) {
  const title = data.title || '';
  const desc = data.description || '';
  const tag = data.tag || '';
  const readTime = data.read_time || '5 phút';
  const dateFormatted = formatDate(data.date);
  const dateISO = isoDate(data.date);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} — Văn Thành GT</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://vanthanhgt.com/blog/${slug}.html" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://vanthanhgt.com/blog/${slug}.html" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="https://vanthanhgt.com/preview-nen-1.jpg" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:site_name" content="Văn Thành GT" />
  <meta property="article:author" content="Văn Thành GT" />
  <meta property="article:published_time" content="${dateISO}" />
  <meta property="article:section" content="${esc(tag)}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${escJson(title)}",
    "description": "${escJson(desc)}",
    "author": { "@type": "Person", "name": "Văn Thành GT", "url": "https://vanthanhgt.com" },
    "publisher": { "@type": "Organization", "name": "Văn Thành GT", "url": "https://vanthanhgt.com" },
    "datePublished": "${dateISO}",
    "dateModified": "${dateISO}",
    "url": "https://vanthanhgt.com/blog/${slug}.html",
    "inLanguage": "vi",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://vanthanhgt.com/blog/${slug}.html" }
  }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --blue:#0284c7; --blue2:#0369a1; --bg:#ffffff; --bg2:#f5f7fa; --text:#1a1a1a; --muted:#6b7280; --border:#e5e7eb; }
    body { background:var(--bg); color:var(--text); font-family:'Lato','Roboto',sans-serif; line-height:1.75; font-size:17px; }
    a { color:var(--blue); text-decoration:none; }
    a:hover { text-decoration:underline; }
    .container { max-width:720px; margin:0 auto; padding:0 24px; }
    nav { background:#fff; border-bottom:1px solid var(--border); padding:0 24px; height:52px; display:flex; align-items:center; gap:8px; position:sticky; top:0; z-index:100; box-shadow:0 1px 4px rgba(0,0,0,.06); }
    .nav-logo { font-weight:900; font-size:15px; color:var(--blue); margin-right:16px; }
    .nav-link { font-size:13px; color:var(--muted); padding:6px 12px; border-radius:6px; transition:.15s; }
    .nav-link:hover { background:var(--bg2); color:var(--text); }
    .nav-cta { margin-left:auto; background:var(--blue); color:#fff; font-size:13px; font-weight:700; padding:7px 18px; border-radius:6px; transition:.15s; }
    .nav-cta:hover { background:var(--blue2); color:#fff; }
    .breadcrumb { padding:16px 0; font-size:13px; color:var(--muted); }
    .breadcrumb a { color:var(--muted); }
    .breadcrumb a:hover { color:var(--blue); }
    .breadcrumb span { margin:0 6px; }
    .article-header { padding:32px 0 40px; border-bottom:1px solid var(--border); }
    .article-tag { display:inline-block; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--blue); background:#e0f2fe; padding:3px 10px; border-radius:20px; margin-bottom:16px; }
    .article-title { font-size:clamp(26px,4.5vw,40px); font-weight:900; color:var(--text); line-height:1.25; margin-bottom:16px; }
    .article-desc { font-size:18px; color:var(--muted); line-height:1.65; margin-bottom:24px; }
    .article-meta { font-size:13px; color:#9ca3af; display:flex; gap:16px; flex-wrap:wrap; }
    .article-meta strong { color:var(--muted); }
    .article-body { padding:44px 0 60px; }
    .article-body h2 { font-size:24px; font-weight:800; color:var(--text); margin:44px 0 16px; padding-top:8px; border-top:1px solid var(--border); }
    .article-body h3 { font-size:19px; font-weight:700; color:var(--blue); margin:28px 0 12px; }
    .article-body p { margin-bottom:18px; color:#374151; }
    .article-body strong { color:var(--text); }
    .article-body ul, .article-body ol { padding-left:24px; margin-bottom:18px; display:flex; flex-direction:column; gap:8px; }
    .article-body ul li, .article-body ol li { color:#374151; }
    .article-body ul li::marker { color:var(--blue); }
    .article-body ol li::marker { color:var(--blue); font-weight:700; }
    blockquote { background:#e0f2fe; border-left:3px solid var(--blue); border-radius:0 8px 8px 0; padding:18px 20px; margin:24px 0; }
    blockquote p { margin:0; color:#0c4a6e; }
    .article-body img { max-width:100%; border-radius:8px; margin:16px 0; }
    .cta-inline { background:linear-gradient(135deg,#e0f2fe,#f0f9ff); border:1px solid #bae6fd; border-radius:12px; padding:28px; text-align:center; margin:40px 0; }
    .cta-inline h3 { font-size:20px; font-weight:800; color:var(--text); margin-bottom:8px; }
    .cta-inline p { font-size:14px; color:var(--muted); margin-bottom:20px; }
    .btn { display:inline-block; background:var(--blue); color:#fff; font-weight:700; font-size:15px; padding:12px 32px; border-radius:6px; transition:.15s; text-decoration:none; }
    .btn:hover { background:var(--blue2); color:#fff; transform:translateY(-2px); text-decoration:none; }
    footer { background:var(--bg2); border-top:1px solid var(--border); padding:28px 0; text-align:center; font-size:13px; color:var(--muted); }
    footer a { color:var(--blue); }
  </style>
</head>
<body>

<nav>
  <a href="https://vanthanhgt.com/" class="nav-logo">Văn Thành GT</a>
  <a href="https://vanthanhgt.com/" class="nav-link">Trang chủ</a>
  <a href="/blog/" class="nav-link">Blog</a>
  <a href="https://vanthanhgt.com/checkout.html" class="nav-cta">Đăng ký khóa học</a>
</nav>

<div class="container">

  <nav class="breadcrumb">
    <a href="https://vanthanhgt.com/">Trang chủ</a>
    <span>›</span>
    <a href="/blog/">Blog</a>
    <span>›</span>
    ${esc(title)}
  </nav>

  <header class="article-header">
    <div class="article-tag">${esc(tag)}</div>
    <h1 class="article-title">${esc(title)}</h1>
    <p class="article-desc">${esc(desc)}</p>
    <div class="article-meta">
      <span>Tác giả: <strong>Văn Thành GT</strong></span>
      <span>•</span>
      <span>${dateFormatted}</span>
      <span>•</span>
      <span>${esc(readTime)} đọc</span>
    </div>
  </header>

  <article class="article-body">
    ${bodyHtml}

    <div class="cta-inline">
      <h3>Khóa Học Supply Demand &amp; Price Action</h3>
      <p>Học bài bản từ nền tảng đến hệ thống giao dịch hoàn chỉnh.</p>
      <a href="https://vanthanhgt.com/" class="btn">Xem khóa học ngay →</a>
    </div>
  </article>

</div>

<footer>
  <div class="container" style="max-width:720px">
    <p>© 2026 <strong style="color:#ff9980">Văn Thành GT</strong> · <a href="https://vanthanhgt.com/">Trang chủ</a> · <a href="/blog/">Blog</a> · <a href="https://vanthanhgt.com/checkout.html">Đăng ký học</a></p>
  </div>
</footer>

</body>
</html>`;
}

function generatePostCard(slug, data) {
  const title = data.title || '';
  const tag = data.tag || '';
  const readTime = data.read_time || '5 phút';
  const excerpt = data.excerpt || data.description || '';

  return `      <div class="post-card">
        <div class="post-card-body">
          <div class="post-tag">${esc(tag)}</div>
          <a href="/blog/${slug}.html" class="post-title">${esc(title)}</a>
          <p class="post-excerpt">${esc(excerpt)}</p>
          <div class="post-meta">
            <span>Văn Thành GT</span>
            <span>•</span>
            <span>${esc(readTime)} đọc</span>
          </div>
          <a href="/blog/${slug}.html" class="post-read-more">Đọc bài →</a>
        </div>
      </div>`;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('_posts/ not found — no CMS posts to build.');
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('No .md posts found — skipping.');
    return;
  }

  const posts = [];

  for (const file of files) {
    const slug = path.basename(file, '.md');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const bodyHtml = marked(content);

    const html = generateHtml(slug, data, bodyHtml);
    const outPath = path.join(BLOG_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`Generated: blog/${slug}.html`);

    posts.push({ slug, data });
  }

  posts.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  const indexPath = path.join(BLOG_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  const START = '<!-- CMS_POSTS_START -->';
  const END = '<!-- CMS_POSTS_END -->';

  if (indexHtml.includes(START) && indexHtml.includes(END)) {
    const cards = posts.map(p => generatePostCard(p.slug, p.data)).join('\n\n');
    const before = indexHtml.substring(0, indexHtml.indexOf(START) + START.length);
    const after = indexHtml.substring(indexHtml.indexOf(END));
    indexHtml = `${before}\n${cards}\n      ${after}`;
    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log('Updated: blog/index.html');
  }
}

main();
