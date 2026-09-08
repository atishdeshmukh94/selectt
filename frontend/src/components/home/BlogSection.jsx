import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { API_URL } from '../../config/api';
const API = API_URL;

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/blog/posts?status=published&limit=4`)
      .then(r => r.json())
      .then(d => {
        // Handle both array and object responses
        const posts = Array.isArray(d) ? d : (d.posts || []);
        setBlogs(posts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || (!loading && blogs.length === 0)) return null;

  return (
    <section className="pt-4 pb-12 md:pt-6 md:pb-24 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-slate-500 dark:text-purple-200">
              Expert car buying tips and trends
            </p>
          </div>
          <Link
            to="/blog"
            className="text-[#00C9AF] font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            Read all posts
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative group/slider">
          <div className="flex lg:grid lg:grid-cols-4 gap-8 overflow-x-auto lg:overflow-visible hide-scrollbar snap-x snap-mandatory px-0 md:px-0">
            {blogs.map((blog, index) => (
              <Link to={`/blog/${blog.slug}`} key={index} className="group cursor-pointer min-w-[280px] md:min-w-0 snap-center flex flex-col bg-white dark:bg-gray-900 border-2 border-slate-300/90 dark:border-slate-700 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-[#00C9AF] dark:hover:border-[#00C9AF] transition-all duration-300">
                <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-5 relative shadow-xs flex items-center justify-center min-h-[180px]">
                  {blog.featured_image ? (
                    <img
                      alt={blog.title}
                      className="w-full h-auto max-h-[240px] object-contain group-hover:scale-105 transition-transform duration-500"
                      src={blog.featured_image.startsWith('/') ? `${API}${blog.featured_image}` : blog.featured_image}
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center text-gray-300"><FileText size={32} /></div>
                  )}
                </div>

                {blog.categories && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {blog.categories.split(',').slice(0, 1).map((c, i) => (
                      <span key={i} className={`inline-block px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-[#00C9AF] text-[10px] font-extrabold rounded-full uppercase tracking-wider`}>
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-black mb-2 group-hover:text-[#00C9AF] transition-colors text-navy dark:text-white line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 group-hover:text-[#00C9AF] transition-colors font-extrabold">Read Post <ChevronRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
