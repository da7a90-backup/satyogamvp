import React from "react";
import BlogSection from "../about/aboutSatyoga/Blog";
import ShunyamurtiVideoSection from "../about/aboutAshram/ShunyaVideo";
import AshramRetreatsSection from "../about/aboutAshram/StayingAtAshram";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import ImageCarouselSection, { CarouselImage } from "../shared/ImageCarousel";
import QuoteSection from "../shared/Quote";
import StandardHeroSection from "../shared/Hero";
interface BackgroundElement {
  image: string;
  desktop?: React.CSSProperties;
  mobile?: React.CSSProperties;
}

export default function AboutAshramPage({ data }: any) {
    // Map hero data from API
    const heroData = data.hero ? {
        tagline: data.hero.tagline || "About",
        background: data.hero.backgroundImage || "",
        heading: data.hero.heading || "Our Ashram",
        subtext: data.hero.subheading || "The Challenge of Interbeing"
    } : {
        tagline: "About",
        background: "",
        heading: "Our Ashram",
        subtext: "The Challenge of Interbeing"
    };

    // Map carousel images from API
    const images: CarouselImage[] = data.carousel?.secondaryImages || [];

    // Map ashram end time section with backgroundElements
    const ashramEndTimeData = data.ashramEndTime ? {
        leftPane: {
            title: data.ashramEndTime.heading
        },
        rightPane: {
            type: 'paragraphs' as const,
            content: data.ashramEndTime.content || []
        },
        backgroundElements: (data.ashramEndTime.backgroundElements ?
            Object.values(data.ashramEndTime.backgroundElements).map((element: any) => ({
                ...element,
                desktop: element.desktop ? {
                    ...element.desktop,
                    top: element.desktop.top ? `${parseInt(element.desktop.top) - 40}px` : element.desktop.top
                } : undefined,
                mobile: element.mobile ? {
                    ...element.mobile,
                    top: element.mobile.top ? `${parseInt(element.mobile.top) - 40}px` : element.mobile.top
                } : undefined
            })) as BackgroundElement[] : [])
    } : null;

    // Create a unique key for ashram end time that changes on each render to force remount
    const ashramKey = `ashram-end-time-${Date.now()}`;

    // Quote text
    const quoteText = data.quote?.quote || "Living in a serious transformational community is a great privilege and opportunity . . . and perhaps the ultimate rite of passage.";

    // Map spiritual tribe section
    const spiritualTribeData = data.spiritualTribe ? {
        leftPane: {
            title: data.spiritualTribe.heading
        },
        rightPane: {
            type: 'paragraphs' as const,
            content: data.spiritualTribe.content || []
        }
    } : null;

    // Map shunyamurti video section
    const shunyamurtiVideoData = data.shunyamurtiVideo ? {
        mediaPosition: 'top' as const,
        hugging: true,
        topMedia: {
            type: 'video' as const,
            src: data.shunyamurtiVideo.videoUrl || 'https://www.youtube.com/embed/1z4ryQt0duM?feature=shared',
            thumbnail: data.shunyamurtiVideo.videoThumbnail || '',
            aspectRatio: '16/9',
            videoType: data.shunyamurtiVideo.videoType || 'youtube' as const
        },
        leftPane: {
            title: ""
        },
        rightPane: {
            type: 'paragraphs' as const,
            gap: '16px',
            content: data.shunyamurtiVideo.content || []
        }
    } : null;

    return (
        <>
            <StandardHeroSection data={heroData} />
            {ashramEndTimeData && <TwoPaneComponent key={ashramKey} data={ashramEndTimeData}/>}
            <ImageCarouselSection data={images}/>
            <QuoteSection data={quoteText} />
            {spiritualTribeData && <TwoPaneComponent key="spiritual-tribe" data={spiritualTribeData}/>}
            {shunyamurtiVideoData && <TwoPaneComponent key="shunyamurti-video" data={shunyamurtiVideoData}/>}
            <BlogSection/>
            <AshramRetreatsSection/>
        </>
    )
}