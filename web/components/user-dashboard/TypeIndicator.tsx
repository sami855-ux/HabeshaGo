export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%]">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {name} is typing...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
