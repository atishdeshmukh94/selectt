export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-left dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Wepnex
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400 leading-relaxed">
        This project is developed & maintained by Wepnex. For any technical support, customization, or assistance, please contact us.
      </p>
      <a
        href="https://www.wepnex.com/"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600 transition-colors"
      >
        Contact Us
      </a>
    </div>
  );
}
