import React from 'react';

const historyData = [
  { id: 1, title: "Видео от 21.05.2025", status: "Обработано", date: "21 мая 2025" },
  { id: 2, title: "Видео от 20.05.2025", status: "В обработке", date: "20 мая 2025" },
  { id: 3, title: "Видео от 19.05.2025", status: "Ошибка", date: "19 мая 2025" },
  // Добавь свои данные здесь
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-dark-600 h-full flex flex-col bg-gray-50 dark:bg-dark-800">
      <div className="p-6 border-b border-gray-200 dark:border-dark-600">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong>SecureVision</strong> is an AI-powered system for analyzing surveillance footage.
          It automatically detects weapons, suspicious objects, and unusual behavior.
          <br /><br />
          Upload your video to receive a processed version with visual annotations and a detailed report of detected threats.
        </p>
      </div>

      {/* История загрузок */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-gray-700 dark:text-gray-300 font-semibold mb-3">History</h2>
        <ul>
          {historyData.map(item => (
            <li
              key={item.id}
              className="mb-3 p-3 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-600 transition"
              title={`Статус: ${item.status}`}
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
              <p className={`text-xs mt-1 ${
                item.status === "Обработано" ? "text-green-600 dark:text-green-400" :
                item.status === "В обработке" ? "text-yellow-600 dark:text-yellow-400" :
                "text-red-600 dark:text-red-400"
              }`}>
                {item.status}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
