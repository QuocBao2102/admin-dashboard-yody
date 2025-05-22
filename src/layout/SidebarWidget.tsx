export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-brand-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        YODY Clothing Admin
      </h3>
      <a
        href="https://yody.vutran.id.vn/"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-gray-800 rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        Visit YODY Store
      </a>
    </div>
  );
}
