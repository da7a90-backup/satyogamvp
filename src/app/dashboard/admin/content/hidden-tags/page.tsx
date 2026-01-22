'use client';

import { useState } from 'react';
import HiddenTagsManager from '@/components/dashboard/hidden-tags/HiddenTagsManager';

interface PageTagConfig {
  id: string;
  pageTag: string;
  entityType: 'teaching' | 'blog' | 'product' | 'retreat' | 'event';
  title: string;
  description: string;
}

const PAGE_TAG_CONFIGS: PageTagConfig[] = [
  {
    id: 'homepage-teachings',
    pageTag: 'homepage/teachings',
    entityType: 'teaching',
    title: 'Homepage - Featured Teachings',
    description: 'Select teachings to display in the featured teachings section on the homepage',
  },
  {
    id: 'homepage-blog',
    pageTag: 'homepage/blog',
    entityType: 'blog',
    title: 'Homepage - Featured Blog Posts',
    description: 'Select blog posts to display in the featured blog section on the homepage',
  },
  {
    id: 'homepage-retreats',
    pageTag: 'homepage/retreats',
    entityType: 'retreat',
    title: 'Homepage - Featured Retreats',
    description: 'Select retreats to display in the featured retreats section on the homepage',
  },
  {
    id: 'about-shunyamurti-books',
    pageTag: 'about/shunyamurti/books',
    entityType: 'product',
    title: 'About Shunyamurti - Featured Books',
    description: 'Select books to display on the About Shunyamurti page',
  },
  {
    id: 'about-shunyamurti-teachings',
    pageTag: 'about/shunyamurti/teachings',
    entityType: 'teaching',
    title: 'About Shunyamurti - Featured Teachings',
    description: 'Select teachings to display on the About Shunyamurti page',
  },
  {
    id: 'about-satyoga-blog',
    pageTag: 'about/satyoga/blog',
    entityType: 'blog',
    title: 'About Sat Yoga - Featured Blog Posts',
    description: 'Select blog posts to display on the About Sat Yoga page',
  },
  {
    id: 'about-satyoga-retreats',
    pageTag: 'about/satyoga/retreats',
    entityType: 'retreat',
    title: 'About Sat Yoga - Featured Retreats',
    description: 'Select retreats to display on the About Sat Yoga page',
  },
  {
    id: 'store-featured',
    pageTag: 'store/featured',
    entityType: 'product',
    title: 'Store - Featured Products',
    description: 'Select products to display in the featured section of the store',
  },
];

export default function HiddenTagsPage() {
  const [activeTab, setActiveTab] = useState(PAGE_TAG_CONFIGS[0].id);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const activeConfig = PAGE_TAG_CONFIGS.find((c) => c.id === activeTab) || PAGE_TAG_CONFIGS[0];

  const handleUpdate = () => {
    setLastUpdate(Date.now());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hidden Tags Management</h1>
        <p className="text-gray-600">
          Manage which content appears on specific pages across the marketing website.
          Drag and drop to reorder items.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {PAGE_TAG_CONFIGS.map((config) => (
            <button
              key={config.id}
              onClick={() => setActiveTab(config.id)}
              className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === config.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {config.title.split(' - ')[0]}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Tab Content */}
      <HiddenTagsManager
        key={`${activeConfig.id}-${lastUpdate}`}
        pageTag={activeConfig.pageTag}
        entityType={activeConfig.entityType}
        title={activeConfig.title}
        description={activeConfig.description}
        onUpdate={handleUpdate}
      />

      {/* Info Box */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How Hidden Tags Work</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Add Items:</strong> Click "Add Item" to select content from the available pool. Only items not already tagged for this page will appear.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Reorder:</strong> Drag and drop items to change their display order. The order is saved automatically.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Remove:</strong> Click the trash icon to remove an item from the page. The content itself is not deleted, only the tag.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              <strong>Marketing Pages:</strong> Changes take effect immediately on the frontend. No need to rebuild or redeploy.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
