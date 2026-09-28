import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calendar, User, Facebook, Twitter, Linkedin, Link as LinkIcon, MapPin, FileText } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import { getCarDetailsUrl } from '../utils/formatters';

import { API_URL, getCarImageUrl, DEFAULT_CAR_FALLBACK_IMAGE } from "../config/api";
const API = API_URL;

const BlogSinglePage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [latestCars, setLatestCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/blog/posts/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.post) {
          setPost(d.post);
          setRelated(d.related || []);
        }
      })
      .finally(() => setLoading(false));

    fetch(`${API}/api/blog/tags`).then(r => r.json()).then(d => setTags(Array.isArray(d) ? d : []));
    fetch(`${API}/api/blog/categories`).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
    fetch(`${API}/api/cars`).then(r => r.json()).then(d => setLatestCars(Array.isArray(d) ? d.filter(c => c.status !== 'sold_out').slice(0, 4) : []));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#f9f9f9]">
        <div className="w-10 h-10 border-3 border-[#00C9AF] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Loading Article...</span>
      </div>
    );
  }

  if (!post) {
    return <div className="min-h-screen flex flex-col items-center justify-center pt-20">
      <h1 className="text-3xl font-black mb-4">Post Not Found</h1>
      <Link to="/blog" className="text-[#00C9AF] font-bold hover:underline">Return to Blog</Link>
    </div>;
  }

  const shareUrl = window.location.href;
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); alert('Link copied!'); };

  return (
    <>
      <PageMeta title={`${post.meta_title || post.title} | Selectt`} description={post.meta_description || post.excerpt} />
      <div className="bg-background-light dark:bg-background-dark min-h-screen pt-4 sm:pt-6 pb-16 px-4">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto mb-4 sm:mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Link to="/" className="hover:text-[#00C9AF] transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/blog" className="hover:text-[#00C9AF] transition-colors">Blog</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 dark:text-gray-200 truncate">{post.title}</span>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Main Article */}
          <article className="flex-1 max-w-4xl">
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories?.split(',').map((c, i) => (
                  <span
                    key={i}
                    className="text-xs font-black uppercase tracking-widest text-white bg-slate-950 dark:bg-black px-3.5 py-1.5 rounded-full shadow-sm"
                  >
                    {c.trim()}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-navy dark:text-white mb-6 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2"><User size={16} /> By Selectt Editorial</div>
                <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Featured Media */}
            <div className="mb-10 rounded-3xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {post.video_url ? (
                post.video_type === 'youtube' ? (
                  <div className="relative w-full pt-[56.25%]"><iframe src={`https://www.youtube.com/embed/${post.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`} className="absolute top-0 left-0 w-full h-full" allowFullScreen frameBorder="0" /></div>
                ) : (
                  <video src={post.video_url} controls className="w-full aspect-video bg-black" />
                )
              ) : post.featured_image ? (
                <img src={post.featured_image.startsWith('/') ? `${API}${post.featured_image}` : post.featured_image} alt={post.title} className="w-full h-auto max-h-[650px] object-contain mx-auto block rounded-3xl" />
              ) : null}
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert prose-rose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Post Tags */}
            {post.tags && (
              <div className="flex items-center gap-3 pt-8 border-t border-gray-200 dark:border-gray-800">
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.split(',').map((t, i) => (
                    <span key={i} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share */}
            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">Share this article:</span>
              <div className="flex items-center gap-2">
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg></a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform"><Facebook size={20} /></a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"><Twitter size={20} /></a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-110 transition-transform"><Linkedin size={20} /></a>
                <button onClick={copyLink} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:scale-110 transition-transform"><LinkIcon size={20} /></button>
              </div>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full"></span> Categories
              </h3>
              <div className="space-y-2">
                {categories.map(c => (
                  <Link
                    to={`/blog?category=${c.slug}`}
                    key={c.id}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{c.post_count || 0}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest Cars */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full"></span> Latest Cars
                </h3>
                <Link to="/buy-cars" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {latestCars.map(car => (
                  <Link
                    to={getCarDetailsUrl(car)}
                    key={car.id}
                    className="group block bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-200/60 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 mb-2 flex items-center justify-center">
                      <img
                        src={getCarImageUrl(car.image)}
                        alt={`${car.year || ''} ${car.make || ''} ${car.model || ''} - Used Car for Sale`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = DEFAULT_CAR_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00C9AF] transition-colors">
                        {car.year} {car.make} {car.model}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 mb-1">
                        <MapPin size={10} className="text-slate-400 shrink-0" />
                        <span className="truncate">{car.location ? car.location.split(',')[0] : 'Mumbai'}</span>
                      </div>
                      <p className="text-[12px] font-black text-slate-900 dark:text-white">
                        ₹{(car.price / 100000).toFixed(2)} Lakh
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/buy-cars"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Explore All Cars
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Top Posts in Sidebar */}
            {related.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-slate-900 dark:bg-white rounded-full"></span> Top Articles
                </h3>
                <div className="space-y-3.5">
                  {related.slice(0, 4).map(r => (
                    <Link to={`/blog/${r.slug}`} key={r.id} className="group flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                        {r.featured_image ? (
                          <img
                            src={r.featured_image.startsWith('/') ? `${API}${r.featured_image}` : r.featured_image}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={r.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-[#00C9AF] transition-colors mb-0.5">
                          {r.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(r.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related & Latest Articles Section Below Article */}
        {related.length > 0 && (
          <div className="max-w-7xl mx-auto mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#00C9AF] mb-1 block">Related Reads</span>
                <h2 className="text-2xl sm:text-3xl font-black text-navy dark:text-white">Related & Latest Posts</h2>
              </div>
              <Link
                to="/blog"
                className="text-sm font-bold text-[#00C9AF] hover:underline flex items-center gap-1 group"
              >
                View all articles <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.slice(0, 3).map(r => (
                <Link
                  to={`/blog/${r.slug}`}
                  key={r.id}
                  className="group flex flex-col bg-white dark:bg-gray-900 border-2 border-slate-300/90 dark:border-slate-700 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-[#00C9AF] dark:hover:border-[#00C9AF] transition-all duration-300"
                >
                  <div className="w-full rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-gray-800 relative shadow-xs flex items-center justify-center min-h-[190px]">
                    {r.featured_image ? (
                      <img
                        src={r.featured_image.startsWith('/') ? `${API}${r.featured_image}` : r.featured_image}
                        alt={r.title}
                        className="w-full h-auto max-h-[260px] object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-300">
                        <FileText size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    {r.categories && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {r.categories.split(',').slice(0, 2).map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-950 dark:bg-black px-2.5 py-1 rounded-full"
                          >
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-lg font-black text-navy dark:text-white mb-2 line-clamp-2 group-hover:text-[#00C9AF] transition-colors">
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                        {r.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span>{new Date(r.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1 group-hover:text-[#00C9AF] transition-colors">Read Post <ChevronRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogSinglePage;

