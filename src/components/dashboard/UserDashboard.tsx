'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [hideCalendar, setHideCalendar] = useState(false);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 mr-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl text-gray-900 font-medium">Namaste, Alessandra</h1>
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Free</span>
              </div>
              <p className="text-sm text-gray-500">Sunday, Jan 5th, 2024</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
              Donate
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
              Go to website
            </button>
          </div>
        </div>

        {/* Quote of the week */}
        <div className="mt-6">
          <h2 className="text-base font-medium mb-2">Quote of the week</h2>
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="text-center p-6 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-200 w-48 h-48 rounded-md"></div>
              </div>
              <div className="relative z-10 max-w-3xl mx-auto mb-1">
                <h3 className="text-lg font-medium mb-4">
                  Lorem ipsum dolor sit amet consectetur....
                </h3>
                <p className="text-gray-700 italic">
                  "Lorem ipsum dolor sit amet consectetur. Sit hendrerit ornare porttitor eros malesuada lorem. Id velit at auctor bibendum interdum sem placerat nibh. Maecenas eget faucibus ullamcorper id elementum molestie pellentesque dui a. Feugiat sit ipsum malesuada vehicula id mont..."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-8">
          {/* Left column - Wider */}
          <div className="col-span-8">
            {/* Happening now */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Happening now</h2>
                <button>
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Live video player */}
              <div className="bg-gray-500 rounded-lg relative mb-3" style={{ height: "250px" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Live
                </div>
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                  203
                </div>
              </div>
              
              <div className="pb-3">
                <div className="text-xs text-gray-500">Sun, Sept 28th</div>
                <h3 className="text-base font-medium mt-1 mb-1">Title here</h3>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet consectetur. Sit hendrerit ornare porttitor eros malesuada lorem. Id velit at auctor bibendum interdum sem placerat nibh. Maecenas eget faucibus ullamcorper id elementum molestie pellentesque dui a. Feugiat sit ipsum malesuada veh...
                </p>
                <button className="mt-3 px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-blue-600">
                  Join zoom
                </button>
              </div>
            </div>

                          {/* Featured teaching */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Featured teaching</h2>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                  View all
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex p-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center mr-4">
                    <svg className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">November 5th, 2024</div>
                    <h3 className="text-base font-medium mt-1">The Technique of Detachment from Technique</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      For some time, critical theorists have declared that we have entered a new evolutionary period, that they refer to as the Anthropocene era, meaning that our biological fate is now dominate...
                    </p>
                    <div className="flex mt-3 space-x-4">
                      <button className="inline-flex items-center text-xs text-gray-600">
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
                        </svg>
                        Audio
                      </button>
                      <button className="inline-flex items-center text-xs text-gray-600">
                        <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Narrower */}
          <div className="col-span-4">
            {/* Enrolled calendar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Enrolled calendar</h2>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                  View all
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                {!hideCalendar && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-base font-medium">December, 2024</div>
                      <div className="flex">
                        <button className="p-1">
                          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button className="p-1">
                          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="grid grid-cols-7 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                          <div key={idx} className="text-xs font-medium text-gray-600">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 text-center mb-1">
                        {[28, 29, 30, 1, 2, 3, 4].map((day, idx) => (
                          <div key={idx} className="py-2">
                            <div className={`text-sm ${idx < 3 ? 'text-gray-400' : ''}`}>{day}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 text-center mb-1">
                        {[5, 6, 7, 8, 9, 10, 11].map((day, idx) => (
                          <div key={idx} className="py-2">
                            <div className="text-sm">{day}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 text-center mb-1">
                        {[12, 13, 14, 15, 16, 17, 18].map((day, idx) => (
                          <div key={idx} className="py-2">
                            <div className={`text-sm ${day === 13 ? 'w-8 h-8 bg-purple-600 text-white rounded-full inline-flex items-center justify-center' : ''}`}>{day}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 text-center mb-1">
                        {[19, 20, 21, 22, 23, 24, 25].map((day, idx) => (
                          <div key={idx} className="py-2">
                            <div className="text-sm">{day}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 text-center mb-1">
                        {[26, 27, 28, 29, 30, 31, 1].map((day, idx) => (
                          <div key={idx} className="py-2">
                            <div className={`text-sm ${idx === 6 ? 'text-gray-400' : ''}`}>{day}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="text-sm text-blue-600 block"
                      onClick={() => setHideCalendar(true)}
                    >
                      Hide calendar
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Calendar Events - Separate Cards with dots */}
            <div className="space-y-4 mt-4">
              {/* Event 1 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <span className="inline-block w-2 h-2 bg-black rounded-full mt-2"></span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">December 28th</span>
                    <span className="text-sm text-gray-500 ml-1">Saturday</span>
                  </div>
                  <div className="mt-2 flex items-start">
                    <div className="bg-gray-200 w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Event title</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Fri 17 Dec 2024 • Onsite • 3 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <span className="inline-block w-2 h-2 bg-black rounded-full mt-2"></span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">December 27th</span>
                    <span className="text-sm text-gray-500 ml-1">Friday</span>
                  </div>
                  <div className="mt-2 flex items-start">
                    <div className="bg-gray-200 w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Event title</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Fri 17 Dec 2024 • Onsite • 3 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <span className="inline-block w-2 h-2 bg-black rounded-full mt-2"></span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">December 30th</span>
                    <span className="text-sm text-gray-500 ml-1">Monday</span>
                  </div>
                  <div className="mt-2 flex items-start">
                    <div className="bg-gray-200 w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Event title</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Fri 17 Dec 2024 • Onsite • 3 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event 4 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <span className="inline-block w-2 h-2 bg-black rounded-full mt-2"></span>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">December 28th</span>
                    <span className="text-sm text-gray-500 ml-1">Sunday</span>
                  </div>
                  <div className="mt-2 flex items-start">
                    <div className="bg-gray-200 w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Event title</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Fri 17 Dec 2024 • Onsite • 3 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

                  {/* Most recent publications - Full width */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Most recent publications</h2>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
              View all
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {/* Publication 1 */}
            <div>
              <div className="bg-gray-100 aspect-w-1 aspect-h-1 rounded-lg relative mb-3">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-gray-300">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div>
                <div className="text-xs text-gray-500">November 5th, 2024</div>
                <h3 className="text-base font-medium my-1">The Technique of Detachment from Technique</h3>
                <div className="flex mt-2 space-x-3">
                  <button className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
                    </svg>
                    Audio
                  </button>
                  <button className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video
                  </button>
                </div>
              </div>
            </div>

            {/* Publication 2 */}
            <div>
              <div className="bg-gray-100 aspect-w-1 aspect-h-1 rounded-lg relative mb-3">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-gray-300">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div>
                <div className="text-xs text-gray-500">November 5th, 2024</div>
                <h3 className="text-base font-medium my-1">Lorem ipsum dolor sit amet</h3>
                <div className="flex mt-2 space-x-3">
                  <button className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video
                  </button>
                </div>
              </div>
            </div>

            {/* Publication 3 */}
            <div>
              <div className="bg-gray-100 aspect-w-1 aspect-h-1 rounded-lg relative mb-3">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-gray-300">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div>
                <div className="text-xs text-gray-500">November 5th, 2024</div>
                <h3 className="text-base font-medium my-1">Lorem ipsum dolor sit amet</h3>
                <div className="flex mt-2 space-x-3">
                  <button className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
                    </svg>
                    Audio
                  </button>
                  <button className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

                  {/* Continue where you left off */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Continue where you left off</h2>
            <button>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
          
          {/* Continue course card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex">
              <div className="w-80 bg-gray-800 relative" style={{ height: "220px" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <svg className="h-10 w-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
                <button className="absolute top-3 right-3 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  40 lessons
                </div>
                <h3 className="text-base font-medium">Fundamentals of meditation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Darshan is a Sanskrit term for a sacred meeting with a spiritual teacher, acharya, guru, sage, or other holy being...
                </p>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>3% completed</span>
                    <span>6 hours left</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full mb-6">
                    <div 
                      className="h-1 bg-purple-600 rounded-full" 
                      style={{ width: '3%' }}
                    ></div>
                  </div>
                  <button className="px-6 py-3 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800">
                    Continue course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

                  {/* Recently Watched */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recently Watched</h2>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
              View all
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {/* Recently Watched Card 1 */}
            <div>
              <div className="relative">
                <div className="bg-gray-500 rounded-lg h-32 mb-2 flex items-center justify-center">
                  <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                  New
                </div>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm font-medium mb-1">Lorem ipsum dolor sit amet</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  45 minutes
                </div>
                <span className="text-xs text-gray-500">November 5th, 2024</span>
              </div>
            </div>

            {/* Recently Watched Card 2 */}
            <div>
              <div className="relative">
                <div className="bg-gray-500 rounded-lg h-32 mb-2 flex items-center justify-center">
                  <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                  New
                </div>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm font-medium mb-1">Lorem ipsum dolor sit amet</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  45 minutes
                </div>
                <span className="text-xs text-gray-500">November 5th, 2024</span>
              </div>
            </div>

            {/* Recently Watched Card 3 */}
            <div>
              <div className="relative">
                <div className="bg-gray-500 rounded-lg h-32 mb-2 flex items-center justify-center">
                  <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-md">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm font-medium mb-1">Lorem ipsum dolor sit amet</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  45 minutes
                </div>
                <span className="text-xs text-gray-500">November 5th, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}