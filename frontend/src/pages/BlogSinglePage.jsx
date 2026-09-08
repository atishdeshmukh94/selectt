import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calendar, User, Facebook, Twitter, Linkedin, Link as LinkIcon, MapPin } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import { getCarDetailsUrl } from '../utils/formatters';

import { API_URL } from "../config/api";
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
    return null;
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
                  <span key={i} className="text-xs font-bold uppercase tracking-widest text-[#00C9AF] bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-navy dark:text-white mb-6 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2"><User size={16} /> By Selectt Editorial</div>
                <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Featured Media */}
            <div className="mb-10 rounded-3xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
              {post.video_url ? (
                post.video_type === 'youtube' ? (
                  <div className="relative pt-[56.25%]"><iframe src={`https://www.youtube.com/embed/${post.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`} className="absolute top-0 left-0 w-full h-full" allowFullScreen frameBorder="0" /></div>
                ) : (
                  <video src={post.video_url} controls className="w-full aspect-video bg-black" />
                )
              ) : post.featured_image ? (
                <img src={post.featured_image.startsWith('/') ? `${API}${post.featured_image}` : post.featured_image} alt={post.title} className="w-full aspect-video object-cover" />
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
          <aside className="w-full lg:w-80 shrink-0 space-y-10">
            {/* Top Posts */}
            {related.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                <h3 className="text-lg font-black text-navy dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#00C9AF] rounded-full"></span> Top Posts
                </h3>
                <div className="space-y-5">
                  {related.map(r => (
                    <Link to={`/blog/${r.slug}`} key={r.id} className="group flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {r.featured_image ? <img src={r.featured_image.startsWith('/') ? `${API}${r.featured_image}` : r.featured_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full bg-gray-200" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-[#00C9AF] transition-colors mb-1">{r.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{new Date(r.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-black text-navy dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#00C9AF] rounded-full"></span> Categories
              </h3>
              <div className="space-y-3">
                {categories.map(c => (
                  <Link to={`/blog?category=${c.slug}`} key={c.id} className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-[#00C9AF] dark:hover:text-[#00C9AF] font-medium transition-colors">
                    <span>{c.name}</span>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{c.post_count || 0}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest Cars for sale */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />
              <h3 className="text-lg font-black text-navy dark:text-white mb-6 flex items-center gap-2 relative z-10">
                <span className="w-1.5 h-6 bg-[#00C9AF] rounded-full"></span> Latest Cars
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {latestCars.map(car => (
                  <Link to={getCarDetailsUrl(car)} key={car.id} className="group block">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2 border border-gray-50 dark:border-gray-800 shadow-sm relative">
                      <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-1.5 left-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                        <span className="text-[8px] font-black text-navy dark:text-white uppercase tracking-tighter">Verified</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-[#00C9AF] transition-colors leading-tight mb-0.5">
                        {car.year} {car.make} {car.model}
                      </h4>
                      <div className="flex items-center gap-0.5 text-[9px] text-gray-400 font-medium mb-1">
                        <MapPin size={9} className="text-[#00C9AF]" strokeWidth={2.5} /> {car.location.split(',')[0]}
                      </div>
                      <p className="text-[12px] font-black text-[#00C9AF]">
                        ₹{(car.price / 100000).toFixed(2)} Lakh
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <Link to="/buy-cars" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-white hover:bg-[#00C9AF] hover:text-[#0A1C3A] transition-all uppercase tracking-widest group shadow-sm">
                  View All Inventory
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default BlogSinglePage;

