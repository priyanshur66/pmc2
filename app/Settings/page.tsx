import React from 'react';

function SettingsPage() {
  const menuItems = [
    {
      icon: '/ziptos.svg',
      text: 'Account details',
      isHighlighted: true,
    },
    {
      icon: '/lang.svg',
      text: 'Language',
    },
    {
      icon: '/seed.svg',
      text: 'Seed Phrase & Private key',
    },
    {
      icon: '/key.svg',
      text: 'Keyless connect',
    },
    {
      icon: '/help.svg',
      text: 'Help & support',
    },
    {
      icon: '/telegram.svg',
      text: 'Telegram',
    },
    {
      icon: '/twitter.svg',
      text: 'X (formerly Twitter)',
    },
  ];

  return (
    <div className="h-screen bg-[#323030] text-white px-4">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-center py-6">
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className={`flex items-center px-4 py-3 rounded-lg `}
          >
            <img src={item.icon} alt="" className="w-6 h-6 mr-4" />
            <span className="flex-1 font-semibold">{item.text}</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        ))}

        <hr className="border-gray-700 my-4" />

        {menuItems.slice(5).map((item, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            <img src={item.icon} alt="" className="w-6 h-6 mr-4" />
            <span className="flex-1">{item.text}</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
