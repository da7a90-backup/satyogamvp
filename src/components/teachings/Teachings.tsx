'use client'
import React from "react";
import StandardHeroSection from "@/components/shared/Hero";
import TeachingLibrarySection from "../shared/TeachingLibrary";



export default function TeachingsPage({ data }: any) {
// Data structure for Shakti Saturation Included Section

  const heroData = {tagline:"Ashram Retreats", background: "/darshan.jpg", heading: "Staying at the Ashram", subtext: "Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica"}

  const teachingLibraryData = {
    isLoggedIn: false,
    sectionTitle: "Latest Teaching",
    viewAllLink: {
      text: "View all",
      url: "/teachings"
    },
    featuredTeaching: {
      id: "prepare-rising-kundalini-featured",
      thumbnail: "/teachings/prepare-kundalini-featured.jpg",
      title: "Title here",
      description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur sed quisque massa. Gravida scelerisque in ullamcorper elit dignissim aliquet ultrices neque. Id enim venenatis magna eu integer condimentum ac. Quam sed tristique malesuada sed odio eleifend suspendisse elementum auctor.Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur sed quisque massa. Gravida scelerisque in ullamcorper elit tincidunt dignissim aliquet ultrices neque. Id enim venenatis magna eu integer condim...",
      date: "Nov 26th, 2024",
      duration: "6:55 minutes",
      accessType: "free" as const,
      mediaType: "video" as const
    },
    categories: [
      "Teachings",
      "Guided Meditations",
      "Q&A with Shunyamurti",
      "Essay"
    ],
    totalCount: 480,
    teachings: [
      // Free Video Teachings
      {
        id: "gods-great-reset-1",
        thumbnail: "/teachings/prepare-kundalini-1.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-2",
        thumbnail: "/teachings/prepare-kundalini-2.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-3",
        thumbnail: "/teachings/prepare-kundalini-3.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      // Membership Video Teachings
      {
        id: "gods-great-reset-4",
        thumbnail: "/teachings/prepare-kundalini-4.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-5",
        thumbnail: "/teachings/prepare-kundalini-5.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-6",
        thumbnail: "/teachings/prepare-kundalini-6.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-7",
        thumbnail: "/teachings/prepare-kundalini-7.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-8",
        thumbnail: "/teachings/prepare-kundalini-8.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "gods-great-reset-9",
        thumbnail: "/teachings/prepare-kundalini-9.jpg",
        title: "God's great reset is not what you think",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      // Free Guided Meditations
      {
        id: "guided-meditation-1",
        thumbnail: "/teachings/meditation-gateless-1.jpg",
        title: "Meditation name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "audio" as const
      },
      {
        id: "guided-meditation-2",
        thumbnail: "/teachings/meditation-gateless-2.jpg",
        title: "Meditation name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "audio" as const
      },
      {
        id: "guided-meditation-3",
        thumbnail: "/teachings/meditation-gateless-3.jpg",
        title: "Meditation name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "audio" as const
      },
      // Membership Guided Meditations
      {
        id: "guided-meditation-4",
        thumbnail: "/teachings/meditation-gateless-4.jpg",
        title: "Meditation name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "audio" as const
      },
      {
        id: "guided-meditation-5",
        thumbnail: "/teachings/meditation-gateless-5.jpg",
        title: "Meditation name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "audio" as const
      },
      {
        id: "guided-meditation-6",
        thumbnail: "/teachings/meditation-gateless-6.jpg",
        title: "Meditation name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "audio" as const
      },
      // Free Q&A Sessions
      {
        id: "qa-heal-trauma-1",
        thumbnail: "/teachings/heal-trauma-1.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-2",
        thumbnail: "/teachings/heal-trauma-2.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-3",
        thumbnail: "/teachings/heal-trauma-3.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-4",
        thumbnail: "/teachings/heal-trauma-4.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-5",
        thumbnail: "/teachings/heal-trauma-5.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-6",
        thumbnail: "/teachings/heal-trauma-6.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "free" as const,
        mediaType: "video" as const
      },
      // Membership Q&A Sessions
      {
        id: "qa-heal-trauma-7",
        thumbnail: "/teachings/heal-trauma-7.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-8",
        thumbnail: "/teachings/heal-trauma-8.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      {
        id: "qa-heal-trauma-9",
        thumbnail: "/teachings/heal-trauma-9.jpg",
        title: "Q&A name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        duration: "45 minutes",
        accessType: "membership" as const,
        mediaType: "video" as const
      },
      // Free Essays
      {
        id: "essay-blessed-1",
        thumbnail: "/teachings/essay-blessed-1.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "free" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-2",
        thumbnail: "/teachings/essay-blessed-2.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "free" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-3",
        thumbnail: "/teachings/essay-blessed-3.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "free" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      // Membership Essays
      {
        id: "essay-blessed-4",
        thumbnail: "/teachings/essay-blessed-4.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "membership" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-5",
        thumbnail: "/teachings/essay-blessed-5.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "membership" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-6",
        thumbnail: "/teachings/essay-blessed-6.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "membership" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-7",
        thumbnail: "/teachings/essay-blessed-7.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "membership" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-8",
        thumbnail: "/teachings/essay-blessed-8.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "membership" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      },
      {
        id: "essay-blessed-9",
        thumbnail: "/teachings/essay-blessed-9.jpg",
        title: "Essay title name",
        description: "Lorem ipsum dolor sit amet consectetur. Semper pellentesque tortor consectetur s...",
        date: "Nov 26th, 2024",
        accessType: "membership" as const,
        mediaType: "text" as const,
        pageCount: 2,
        duration: "2 pages"
      }
    ]
  };

  
return (
    <>
    <StandardHeroSection data={heroData}/>
    <TeachingLibrarySection data={teachingLibraryData}/>
    </>
)
}