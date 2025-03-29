'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UsersIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Dashboard stats
  const stats = [
    { name: 'Total Users', value: '3,245', icon: UsersIcon, change: '+5.2%', changeType: 'increase' },
    { name: 'Active Courses', value: '2', icon: BookOpenIcon, change: '+2.1%', changeType: 'increase' },
    { name: 'Revenue (Month)', value: '$12,450', icon: CurrencyDollarIcon, change: '+12.5%', changeType: 'increase' },
    { name: 'Products Sold', value: '126', icon: ShoppingBagIcon, change: '-3.4%', changeType: 'decrease' },
  ];
  
  // Recent activities
  const activities = [
    { id: 1, user: 'Alex Thompson', action: 'signed up for', item: 'Introduction to Meditation', time: '15 minutes ago' },
    { id: 2, user: 'Maria Garcia', action: 'purchased', item: 'Dharma Teachings Bundle', time: '2 hours ago' },
    { id: 3, user: 'John Davis', action: 'applied for', item: 'Summer Retreat', time: '5 hours ago' },
    { id: 4, user: 'Sarah Wilson', action: 'commented on', item: 'The Path to Enlightenment', time: 'Yesterday' },
    { id: 5, user: 'Robert Smith', action: 'registered for', item: 'Online Group Meditation', time: 'Yesterday' },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Data
          </button>
          <button className="px-4 py-2 bg-purple-600 rounded-md text-sm font-medium text-white hover:bg-purple-700">
            View Reports
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="p-2 rounded-md bg-purple-100">
                <stat.icon className="h-6 w-6 text-purple-600" />
              </span>
            </div>
            <div className="mt-4">
              <span 
                className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <select className="text-sm border rounded-md px-2 py-1">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
            <div className="text-center">
              <ChartBarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Revenue Chart Placeholder</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">User Growth</h2>
            <select className="text-sm border rounded-md px-2 py-1">
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
            <div className="text-center">
              <ChartBarIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">User Growth Chart Placeholder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <div key={activity.id} className="px-5 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full overflow-hidden">
                  {/* User avatar placeholder */}
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">{activity.user}</span>
                    <span className="text-gray-500"> {activity.action} </span>
                    <span className="font-medium text-gray-900">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
          <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800">
            View all activity →
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
            <UsersIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm">Add New User</span>
          </button>
          <button className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
            <BookOpenIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm">Create Course</span>
          </button>
          <button className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md">
            <ShoppingBagIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm">Add Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}