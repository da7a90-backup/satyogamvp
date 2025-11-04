import type { Schema, Attribute } from '@strapi/strapi';

export interface ContentClassContent extends Schema.Component {
  collectionName: 'components_content_class_contents';
  info: {
    displayName: 'class-content';
    icon: 'briefcase';
    description: '';
  };
  attributes: {
    additionalMaterials: Attribute.Component<'sections.additional-materials'>;
    video: Attribute.Component<'content.class-video'>;
    writingPrompts: Attribute.Component<'sections.class-section'>;
    keyConcepts: Attribute.Component<'sections.class-section'>;
  };
}

export interface ContentClassVideo extends Schema.Component {
  collectionName: 'components_content_class_videos';
  info: {
    displayName: 'class-video';
    description: '';
  };
  attributes: {
    videoFile: Attribute.Media;
    videoDescription: Attribute.Text;
    videoTranscript: Attribute.Text;
    AudioFile: Attribute.Media;
    duration: Attribute.Integer;
  };
}

export interface ContentVideoComponent extends Schema.Component {
  collectionName: 'components_content_video_components';
  info: {
    displayName: 'video-component';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    video: Attribute.Media & Attribute.Required;
  };
}

export interface SectionsAdditionalMaterials extends Schema.Component {
  collectionName: 'components_sections_additional_materials';
  info: {
    displayName: 'additionalMaterials';
    description: '';
  };
  attributes: {
    essay: Attribute.RichText;
    guidedMeditation: Attribute.Media;
    duration: Attribute.Integer;
    video: Attribute.Media;
  };
}

export interface SectionsButton extends Schema.Component {
  collectionName: 'components_sections_buttons';
  info: {
    displayName: 'button';
  };
  attributes: {
    label: Attribute.String;
    url: Attribute.String;
    primary: Attribute.Boolean;
  };
}

export interface SectionsClassSection extends Schema.Component {
  collectionName: 'components_sections_class_sections';
  info: {
    displayName: 'class-section';
    description: '';
  };
  attributes: {
    duration: Attribute.Integer;
    content: Attribute.RichText;
  };
}

export interface SectionsContentSection extends Schema.Component {
  collectionName: 'components_sections_content_sections';
  info: {
    displayName: 'contentSection';
  };
  attributes: {
    eyebrow: Attribute.String;
    heading: Attribute.String;
    bulletPoints: Attribute.RichText;
    backgroundImage: Attribute.Media;
    buttons: Attribute.Component<'sections.button', true>;
    content: Attribute.RichText;
  };
}

export interface SectionsCourseFeatures extends Schema.Component {
  collectionName: 'components_sections_course_features';
  info: {
    displayName: 'course_features';
    icon: 'bulletList';
  };
  attributes: {
    videoClasses: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 250;
      }>;
    guidedMeditations: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 250;
      }>;
    studyMaterials: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 250;
      }>;
    supportInfo: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 250;
      }>;
    curriculumAids: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 250;
      }>;
  };
}

export interface SectionsCtaSection extends Schema.Component {
  collectionName: 'components_sections_cta_sections';
  info: {
    displayName: 'ctaSection';
  };
  attributes: {
    eyebrow: Attribute.String;
    heading: Attribute.String;
    description: Attribute.String;
    primaryButtonText: Attribute.String;
    primaryButtonLink: Attribute.String;
    secondaryButtonText: Attribute.String;
    secondaryButtonLink: Attribute.String;
  };
}

export interface SectionsDuration extends Schema.Component {
  collectionName: 'components_sections_durations';
  info: {
    displayName: 'duration';
  };
  attributes: {
    value: Attribute.Integer;
    unit: Attribute.Enumeration<['days', 'weeks', 'months']>;
  };
}

export interface SectionsFeature extends Schema.Component {
  collectionName: 'components_sections_features';
  info: {
    displayName: 'feature';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    icon: Attribute.String;
  };
}

export interface SectionsFeaturedQuote extends Schema.Component {
  collectionName: 'components_sections_featured_quotes';
  info: {
    displayName: 'featured_quote';
    icon: 'discuss';
  };
  attributes: {
    authorName: Attribute.String & Attribute.Required;
    authorImage: Attribute.Media;
    quoteText: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
  };
}

export interface SectionsHeroSection extends Schema.Component {
  collectionName: 'components_sections_hero_sections';
  info: {
    displayName: 'HeroSection';
  };
  attributes: {
    heading: Attribute.String;
    content: Attribute.Text;
    buttonText: Attribute.String;
    buttonLink: Attribute.String;
    backgroundImage: Attribute.Media;
  };
}

export interface SectionsLearningPoints extends Schema.Component {
  collectionName: 'components_sections_learning_points';
  info: {
    displayName: 'learning_points';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 250;
      }>;
  };
}

export interface SectionsLearningTabsSection extends Schema.Component {
  collectionName: 'components_sections_learning_tabs_sections';
  info: {
    displayName: 'learningTabsSection';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    tabs: Attribute.Component<'sections.tab', true>;
  };
}

export interface SectionsSeo extends Schema.Component {
  collectionName: 'components_sections_seos';
  info: {
    displayName: 'seo';
  };
  attributes: {
    metaTitle: Attribute.String;
    metaDescription: Attribute.Text;
    keywords: Attribute.Text;
    metaImage: Attribute.Media;
    canonicalUrl: Attribute.String;
  };
}

export interface SectionsSocialLinks extends Schema.Component {
  collectionName: 'components_sections_social_links';
  info: {
    displayName: 'socialLinks';
  };
  attributes: {
    platform: Attribute.Enumeration<
      ['Facebook', 'X', 'Instagram', 'LinkedIn', 'Youtube', 'Other']
    >;
    url: Attribute.String;
  };
}

export interface SectionsTab extends Schema.Component {
  collectionName: 'components_sections_tabs';
  info: {
    displayName: 'tab';
  };
  attributes: {
    identifier: Attribute.String;
    label: Attribute.String;
    title: Attribute.String;
    description: Attribute.Text;
    buttonText: Attribute.String;
    buttonLink: Attribute.String;
    image: Attribute.Media;
  };
}

export interface TrackingClassProgress extends Schema.Component {
  collectionName: 'components_tracking_class_progresses';
  info: {
    displayName: 'ClassProgress';
    icon: 'chartCircle';
    description: '';
  };
  attributes: {
    classId: Attribute.Integer & Attribute.Required;
    orderIndex: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    video: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 1;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    keyConcepts: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 1;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    writingPrompts: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 1;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    additionalMaterials: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 1;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    completed: Attribute.Boolean & Attribute.DefaultTo<false>;
    lastAccessed: Attribute.DateTime;
  };
}

export interface TrackingCourseProgress extends Schema.Component {
  collectionName: 'components_tracking_course_progresses';
  info: {
    displayName: 'CourseProgress';
    icon: 'chartCircle';
    description: '';
  };
  attributes: {
    classes: Attribute.Component<'tracking.class-progress', true>;
    started: Attribute.Boolean & Attribute.DefaultTo<false>;
    completed: Attribute.Boolean & Attribute.DefaultTo<false>;
    startDate: Attribute.DateTime;
    lastAccessDate: Attribute.DateTime;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'content.class-content': ContentClassContent;
      'content.class-video': ContentClassVideo;
      'content.video-component': ContentVideoComponent;
      'sections.additional-materials': SectionsAdditionalMaterials;
      'sections.button': SectionsButton;
      'sections.class-section': SectionsClassSection;
      'sections.content-section': SectionsContentSection;
      'sections.course-features': SectionsCourseFeatures;
      'sections.cta-section': SectionsCtaSection;
      'sections.duration': SectionsDuration;
      'sections.feature': SectionsFeature;
      'sections.featured-quote': SectionsFeaturedQuote;
      'sections.hero-section': SectionsHeroSection;
      'sections.learning-points': SectionsLearningPoints;
      'sections.learning-tabs-section': SectionsLearningTabsSection;
      'sections.seo': SectionsSeo;
      'sections.social-links': SectionsSocialLinks;
      'sections.tab': SectionsTab;
      'tracking.class-progress': TrackingClassProgress;
      'tracking.course-progress': TrackingCourseProgress;
    }
  }
}
