export default async function handler(req, res) {
  const { slug, id } = req.query;

  // Extract slug/ID from query params or request URL if passed as path
  let postIdentifier = slug || id;
  if (!postIdentifier && req.url) {
    const segments = req.url.split('?')[0].split('/').filter(Boolean);
    postIdentifier = segments[segments.length - 1];
  }

  if (!postIdentifier) {
    return res.redirect(302, 'https://selectt.in/blog');
  }

  const userAgent = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterest|SkypeUriPreview|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot/i.test(
    userAgent
  );

  let post = null;
  try {
    const apiRes = await fetch(`https://api.selectt.in/api/blog/posts/${encodeURIComponent(postIdentifier)}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      post = data.post || null;
    }
  } catch (err) {
    console.error('Error fetching blog for OG:', err);
  }

  if (!post || !post.title) {
    if (!isBot) {
      return res.redirect(302, `https://selectt.in/blog/${postIdentifier}`);
    }
    return res.status(404).send('Blog article not found');
  }

  // Sanitize Title (Avoid single characters or junk meta_title)
  const rawMetaTitle = (post.meta_title || '').trim();
  const cleanTitle = (rawMetaTitle.length > 3 && rawMetaTitle.toLowerCase() !== 'g')
    ? rawMetaTitle
    : (post.title || 'Selectt Blog Article').trim();
  
  const displayTitle = `${cleanTitle} | Selectt Blog`;

  // Build Description / Excerpt
  let rawDesc = (post.meta_description || post.excerpt || '').trim();
  if (rawDesc.length < 5 || /^\d+$/.test(rawDesc) || rawDesc.toLowerCase() === 'g') {
    // Strip HTML from content to create clean excerpt
    const plainText = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    rawDesc = plainText.length > 180 ? `${plainText.substring(0, 177)}...` : plainText;
  }
  const description = rawDesc || `Read ${post.title} on Selectt Cars Blog. Expert tips, car buying guides, market trends, and pre-owned vehicle insights.`;

  // Extract Featured Image
  let imageUrl = 'https://selectt.in/img/selectt-og.png';
  if (post.featured_image && typeof post.featured_image === 'string') {
    const trimmed = post.featured_image.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      imageUrl = trimmed;
    } else if (trimmed.startsWith('/uploads/')) {
      imageUrl = `https://api.selectt.in${trimmed}`;
    } else if (trimmed.startsWith('/')) {
      imageUrl = `https://selectt.in${trimmed}`;
    } else {
      imageUrl = `https://api.selectt.in/uploads/${trimmed}`;
    }
  }

  // Canonical URL
  const postSlug = post.slug || postIdentifier;
  const canonicalUrl = `https://selectt.in/blog/${postSlug}`;
  const publishedDate = post.published_at || post.created_at || new Date().toISOString();
  const modifiedDate = post.updated_at || publishedDate;
  const category = (post.categories || 'Automotive').split(',')[0].trim();

  // If regular human browser user visits this function, redirect to SPA page
  if (!isBot) {
    return res.redirect(302, canonicalUrl);
  }

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': description,
    'image': [imageUrl],
    'datePublished': publishedDate,
    'dateModified': modifiedDate,
    'author': {
      '@type': 'Organization',
      'name': 'Selectt Editorial',
      'url': 'https://selectt.in'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Selectt',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://selectt.in/img/selectt-logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'articleSection': category
  });

  // Return SSR HTML with rich Open Graph and Twitter Card tags
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${displayTitle}</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  
  <!-- Open Graph / WhatsApp / Facebook / LinkedIn Social Cards -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Selectt Blog" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${displayTitle.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:alt" content="${post.title.replace(/"/g, '&quot;')}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_IN" />
  <meta property="article:published_time" content="${publishedDate}" />
  <meta property="article:modified_time" content="${modifiedDate}" />
  <meta property="article:section" content="${category.replace(/"/g, '&quot;')}" />
  <meta property="article:author" content="Selectt Editorial" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@selectt_cars" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${displayTitle.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- Canonical Link -->
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
  ${jsonLd}
  </script>
</head>
<body>
  <article>
    <h1>${post.title}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" alt="${post.title.replace(/"/g, '&quot;')}" />
    <p><a href="${canonicalUrl}">Read Full Article on Selectt.in</a></p>
  </article>
</body>
</html>`);
}
