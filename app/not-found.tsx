export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">页面未找到</p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        返回首页
      </a>
    </div>
  );
} 