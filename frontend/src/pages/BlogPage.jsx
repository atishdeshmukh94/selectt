import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, FileText } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';

import { API_URL } from "../config/api";
const API = API_URL;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ status: 'published' });
      if (search) q.append('search', search);
      if (category) q.append('category', category);
      const res = await fetch(`${API}/api/blog/posts?${q}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API}/api/blog/categories`).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchPosts(), 300);
    return () => clearTimeout(delay);
  }, [search, category]);

  return (
    <>
      <PageMeta title="Blog - Expert Car Buying Tips | Selectt" description="Read our latest insights, market trends, and buying guides for used cars." />
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
        {/* Dark Hero Header */}
        <div className="relative pt-24 pb-16 border-b border-slate-800/80 bg-[#0C1B33] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-3">
              Selectt Blog
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-semibold max-w-2xl mx-auto leading-relaxed mb-8">
              Expert advice, market trends, and comprehensive guides for your car buying and selling journey.
            </p>

            {/* Search & Category Filter */}
            <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg outline-none focus:ring-2 focus:ring-[#00C9AF] transition-all font-medium text-white placeholder-slate-400 text-sm"
                />
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-6 py-3 bg-[#112340] border border-white/20 rounded-full shadow-lg outline-none font-bold text-slate-200 text-xs uppercase tracking-wider cursor-pointer"
              >
                <option value="" className="bg-[#0C1B33] text-white">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug} className="bg-[#0C1B33] text-white">{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-3xl mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 w-1/4 rounded mb-3" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 w-full rounded mb-2" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 w-2/3 rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
              {(search || category) && (
                <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-4 text-[#00C9AF] font-bold hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="group flex flex-col bg-white dark:bg-gray-900 border-2 border-slate-300/90 dark:border-slate-700 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-[#00C9AF] dark:hover:border-[#00C9AF] transition-all duration-300">
                  <div className="w-full rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-gray-800 relative shadow-xs flex items-center justify-center min-h-[190px]">
                    {post.featured_image ? (
                      <img src={post.featured_image.startsWith('/') ? `${API}${post.featured_image}` : post.featured_image} alt={`${post.title} - Selectt Car Guide & Insights`} className="w-full h-auto max-h-[260px] object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center"><FileText size={40} className="text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.category_slugs?.split(',').map((c, i) => (
                        <span key={i} className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-950 dark:bg-black px-2.5 py-1 rounded-full">{c.replace(/-/g, ' ')}</span>
                      ))}
                    </div>
                    <h2 className="text-xl font-black text-navy dark:text-white mb-2 line-clamp-2 group-hover:text-[#00C9AF] transition-colors">{post.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span>{new Date(post.published_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1 group-hover:text-[#00C9AF] transition-colors">Read Post <ChevronRight size={14} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
