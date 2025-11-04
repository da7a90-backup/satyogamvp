import React from "react";
import XatronSagesGallery from "../about/aboutSatyoga/XatronSages";
import BlogSection from "../about/aboutSatyoga/Blog";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import StandardHeroSection from "../shared/Hero";
import StandardSection from "../shared/StandardSection";

export default function AboutPage({ data }: any) {
    // Map hero data from API
    const heroData = data.hero ? {
        tagline: data.hero.tagline || "About",
        background: data.hero.backgroundImage || "",
        heading: data.hero.heading || "Sat Yoga",
        subtext: data.hero.subheading || "Wisdom School"
    } : {
        tagline: "About",
        background: "",
        heading: "Sat Yoga",
        subtext: "Wisdom School"
    };

    // Map what is sat yoga section with accordion items
    const whatIsSatYogaData = data.whatIsSatYoga ? {
        leftPane: {
            title: data.whatIsSatYoga.heading,
            titleLineHeight: data.whatIsSatYoga.titleLineHeight,
            description: data.whatIsSatYoga.description
        },
        rightPane: {
            type: data.whatIsSatYoga.accordionType || 'bulletaccordion' as const,
            content: data.whatIsSatYoga.accordionItems || []
        }
    } : null;

    // Map methodology section with accordion items
    const methodologyData = data.methodology ? {
        leftPane: {
            title: data.methodology.heading
        },
        rightPane: {
            type: data.methodology.accordionType || 'accordion' as const,
            content: data.methodology.accordionItems || []
        }
    } : null;

    // Map atmanology section
    const atmanologyData = data.atmanology ? {
        leftPane: {
            title: data.atmanology.heading,
            titleLineHeight: data.atmanology.titleLineHeight
        },
        rightPane: {
            type: 'paragraphs' as const,
            content: data.atmanology.content || []
        }
    } : null;

    // Map quote with backgroundDecoration
    const quoteText = data.quote?.quote || "Spiritual intelligence is the evolutionary leap.";
    const quoteDecoration = data.quote?.backgroundElements?.labyrinth;

    // Map teachings section
    const teachingsData = data.teachings ? {
        tagline: data.teachings.tagline || "FREE TEACHINGS LIBRARY",
        title: data.teachings.heading || "Unlock Your Inner Genius",
        description: data.teachings.description || "",
        ctabuttontext: data.teachings.buttonText || "Learn more",
        ctabuttonurl: data.teachings.buttonLink || "/teachings"
    } : {
        tagline: "FREE TEACHINGS LIBRARY",
        title: "Unlock Your Inner Genius",
        description: "This selection of some of Shunyamurti's most empowering ideas will be both healing and liberating. These videos, guided meditations, and essays include some from our public channels and others that are only available to members.",
        ctabuttontext: "Learn more",
        ctabuttonurl: "/teachings"
    };

    // Map patron sages from API
    const patronSagesData = data.patronSages?.secondaryImages || [];
    const patronSagesHeading = data.patronSages?.heading || "Our Patron (and Matron) Sages";
    const patronSagesDescription = data.patronSages?.description || "";

    return (
        <>
            <StandardHeroSection data={heroData}/>
            {whatIsSatYogaData && <TwoPaneComponent data={whatIsSatYogaData}/>}
            {patronSagesData.length > 0 && <XatronSagesGallery sages={patronSagesData} heading={patronSagesHeading} description={patronSagesDescription} />}
            <QuoteSection data={quoteText} backgroundDecoration={quoteDecoration} />
            {methodologyData && <TwoPaneComponent data={methodologyData}/>}
            {atmanologyData && <TwoPaneComponent data={atmanologyData}/>}
            <ContactUsSection/>
            <BlogSection/>
            <StandardSection data={teachingsData}/>
        </>
    )
}