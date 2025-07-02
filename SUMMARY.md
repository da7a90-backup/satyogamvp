CODE_SUMMARY.md
1. Project Overview
This is a comprehensive web application for Sat Yoga, a spiritual organization. The project is built with Next.js (App Router) and TypeScript. It serves as a public-facing informational website, a membership portal, an e-learning platform with course progress tracking, and a donation system.

The application's architecture is centered around a Strapi CMS which serves as the backend for content, user data, and custom logic. User authentication is handled by NextAuth.js, which validates credentials against the Strapi backend. Payments for memberships and donations are processed through the Tilopay payment gateway.

The application features distinct roles (admin and user) with protected routes and separate dashboards. The admin dashboard provides full CRUD (Create, Read, Update, Delete) functionality for courses, blog posts, and instructors. The user dashboard allows students to enroll in courses, view content, and track their progress. The frontend is built with React and styled using Tailwind CSS with a component library based on shadcn/ui.

2. Project Tree
.
├── PROJECT_TREE.txt
├── README.md
├── components.json
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── placeholder.png
│   ├── spiral.png
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── api
│   │   └── course-progress
│   │       └── services
│   │           └── course-progress.js
│   ├── app
│   │   ├── about
│   │   │   ├── satyoga
│   │   │   │   └── page.tsx
│   │   │   └── shunyamurti
│   │   │       └── page.tsx
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   ├── donation
│   │   │   │   └── route.ts
│   │   │   ├── membership
│   │   │   │   └── update-status
│   │   │   ├── submit-application
│   │   │   │   └── route.ts
│   │   │   ├── tilopay
│   │   │   │   └── get-sdk-token
│   │   │   └── user-courses
│   │   │       └── route.ts
│   │   ├── apply
│   │   │   └── page.tsx
│   │   ├── blog
│   │   │   ├── [slug]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── calendar
│   │   │   ├── [slug]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── contact
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   ├── admin
│   │   │   │   ├── blog
│   │   │   │   ├── course
│   │   │   │   ├── instructor
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── user
│   │   │       ├── courses
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── donate
│   │   │   ├── [category]
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── payment
│   │   │   │   └── page.tsx
│   │   │   └── success
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── fonts
│   │   │   ├── GeistMonoVF.woff
│   │   │   └── GeistVF.woff
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── membership
│   │   │   ├── checkout
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── register
│   │   │   │   └── page.tsx
│   │   │   └── success
│   │   │       └── page.tsx
│   │   ├── not-found
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── reports
│   │   │   └── page.tsx
│   │   ├── retreats
│   │   │   └── faq
│   │   │       └── page.tsx
│   │   ├── signup
│   │   │   └── page.tsx
│   │   ├── teachings
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── thank-you
│   │       └── page.tsx
│   ├── components
│   │   ├── auth
│   │   │   ├── AuthComponents.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── blog
│   │   │   ├── Blog.tsx
│   │   │   └── MarkdownRenderer.tsx
│   │   ├── calendar
│   │   │   └── Calendar.tsx
│   │   ├── contact
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ContactInfo.tsx
│   │   │   └── ContactMap.tsx
│   │   ├── dashboard
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── UserSidebar.tsx
│   │   │   ├── blog
│   │   │   │   ├── BlogCategories.tsx
│   │   │   │   ├── BlogIndex.tsx
│   │   │   │   └── BlogPostForm.tsx
│   │   │   └── course
│   │   │       ├── admin
│   │   │       └── user
│   │   ├── donation
│   │   │   ├── DonationComponents.tsx
│   │   │   ├── DonationPaymentForm.tsx
│   │   │   ├── DonationPaymentWrapper.tsx
│   │   │   └── DonationSuccessPageComponent.tsx
│   │   ├── faq
│   │   │   └── FAQ.tsx
│   │   ├── forms
│   │   │   ├── application-form.tsx
│   │   │   └── basic-info.tsx
│   │   ├── homepage
│   │   │   └── Homepage.tsx
│   │   ├── layout
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LayoutWrapper.tsx
│   │   │   └── UserNavigation.tsx
│   │   ├── membership
│   │   │   ├── MembershipCheckoutClient.tsx
│   │   │   ├── MembershipPageClient.tsx
│   │   │   ├── MembershipRegisterComponent.tsx
│   │   │   ├── SuccessPage.tsx
│   │   │   └── checkout
│   │   │       ├── AccountSection.tsx
│   │   │       ├── DonationSection.tsx
│   │   │       ├── InvoiceInfoSection.tsx
│   │   │       ├── OrderSummary.tsx
│   │   │       ├── PaymentInfoSection.tsx
│   │   │       ├── PlanSelectionSection.tsx
│   │   │       └── SuccessModal.tsx
│   │   ├── reports
│   │   │   └── pivot-table.tsx
│   │   ├── sections
│   │   │   ├── BlogSection.tsx
│   │   │   ├── ContentSection.tsx
│   │   │   ├── CtaSection.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── LearningTabs.tsx
│   │   ├── teachings
│   │   │   ├── TeachingDetail.tsx
│   │   │   └── Teachings.tsx
│   │   ├── ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── toast.tsx
│   │   │   └── toaster.tsx
│   │   └── videoPlayer
│   │       └── VideoPlayer.tsx
│   ├── hooks
│   │   ├── use-auth.ts
│   │   └── use-toast.ts
│   ├── lib
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── courseApi.ts
│   │   ├── courseCommentApi.ts
│   │   ├── courseProgressApi.ts
│   │   ├── json_dump.ts
│   │   ├── mock-data.ts
│   │   ├── services
│   │   │   ├── cloudflareStreamService.ts
│   │   │   └── tilopay.ts
│   │   ├── strapi.ts
│   │   ├── strapiDebug.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   └── types
│       └── next-auth.d.ts
├── tailwind.config.ts
└── tsconfig.json
3. Key Modules
Authentication & Authorization (src/lib/auth.ts, src/middleware.ts): Implements user authentication using NextAuth.js with a Credentials Provider against the Strapi backend. The middleware protects all /dashboard routes, redirecting unauthenticated users and enforcing role-based access for the /dashboard/admin area by checking the JWT for an admin role.
Strapi API Layer (src/lib/api.ts, strapi.ts, courseApi.ts): A comprehensive layer for interacting with the Strapi CMS. It includes generic helpers like fetchAPI and buildStrapiUrl for constructing complex queries, along with specialized objects like courseApi and blogApi that encapsulate all CRUD operations for their respective content types.
Payment & Membership (lib/services/tilopay.ts, app/api/membership/update-status): Manages the entire payment flow for donations and memberships via the Tilopay gateway. It supports both redirect-based payments and direct API integration with the Tilopay SDK. The update-status API route handles the critical step of updating a user's membership level in Strapi after a successful transaction.
E-Learning Platform (dashboard/user/courses/): A feature-rich learning environment where users can view their enrolled courses, navigate through classes and their components (video, text, etc.), and track their completion. The system syncs with a custom Strapi backend service to persist user progress.
Admin Dashboard (dashboard/admin/): A complete content management system for administrators. It features separate, detailed forms for creating and editing Courses, Classes, Instructors, and Blog Posts. These forms are complex client components that manage local state, validation, and file uploads to Strapi.
Multi-Step Application Form (components/forms/application-form.tsx): A multi-step form built with react-hook-form that guides users through a detailed application process. The form is broken down into logical sections, showing progress and conditionally displaying fields based on user input (e.g., extra questions for the "Sevadhari" program).
Content Presentation (components/blog/, components/teachings/): Client components that handle the fetching, filtering, pagination, and rendering of content. The Teachings section is unique as it sources its data from a local JSON dump (lib/json_dump.ts) instead of the live API.
4. Key Dependencies
next: The core React framework, utilizing the App Router, Server Components, and API Routes.
react: The fundamental library for building the user interface.
next-auth: Handles all user authentication flows, session management, and JWT creation.
tailwindcss: A utility-first CSS framework used for all styling.
shadcn/ui: Provides the foundational, unstyled UI components (Button, Card, Input, etc.) which are then styled with Tailwind.
react-hook-form: Manages the state and validation for the complex multi-step retreat application form.
react-markdown: Renders Markdown content fetched from the Strapi CMS for blog posts, course descriptions, and class content.
react-pivottable: Used in the /reports page to create interactive pivot tables for data analysis.
5. Quirks & Implementation Details
Hardcoded API Tokens: The cloudflareStreamService.ts contains a hardcoded Cloudflare API token. This is a significant security risk and should be moved to environment variables.
Hybrid Data Fetching: The application uses a hybrid data fetching strategy. Most content (blog, courses) is fetched from a live Strapi API, but the /teachings section sources its data from a large, local JSON file (lib/json_dump.ts). This suggests a legacy data source or an incomplete migration.
Complex Strapi Content Modeling: The data structures for courses are deeply nested, including dynamic zones for different types of class content (video, key concepts, etc.). This requires very specific and complex populate queries in the API layer (courseApi.ts) to fetch all necessary data.
Backend Logic in Strapi: Course progress tracking is implemented as a custom service (src/api/course-progress/services/course-progress.js) within the Strapi project itself, rather than in the Next.js frontend, indicating that important business logic resides on the CMS backend.
Robust Client-Side Forms: The admin dashboard contains highly interactive forms (CourseForm.tsx, BlogPostForm.tsx) that manage complex state, including dynamic form sections (e.g., adding/removing "learning points") and rich features like a Markdown editor toolbar with drag-and-drop image uploading.
Dual Payment Flows: The DonationPaymentForm.tsx allows the user to choose between two payment methods: a standard redirect to a hosted Tilopay page or a direct card payment processed on-site via the Tilopay SDK, which is loaded dynamically.
Middleware-Driven Security: The src/middleware.ts file is critical for security. It protects all /dashboard routes and implements role-based access control by inspecting the role field within the NextAuth.js JWT.
Client-Side JWT Management: The application relies on storing the JWT from NextAuth in localStorage for client-side API helpers (courseApi, courseCommentApi) to use for authenticated requests to Strapi.
Mock Data for Reports: The /reports page uses mock data generated by lib/mock-data.ts to power its pivot table, indicating this feature might be for demonstration or is not yet connected to a live data source.
Custom Hook for Auth State: A useAuth hook is defined to provide a clean, reusable way for client components to access the user's session, authentication status, and role.
6. Description
This repository contains the source code for the Sat Yoga spiritual organization's primary web platform. Developed using a modern stack including Next.js 14 (App Router), TypeScript, and Tailwind CSS, the application serves as a multi-faceted digital hub. It features a public-facing website with information about the organization, its founder Shunyamurti, and various programs like retreats and courses.

The backend is powered by a Strapi CMS, which manages all content, user data, and media assets. The application seamlessly integrates with Strapi through a well-structured API layer for fetching data and performing mutations. User authentication is handled by NextAuth.js, which authenticates against Strapi's user database and manages roles for both regular users and administrators.

Key features include a comprehensive e-learning platform where users can enroll in free or paid courses and track their progress component-by-component. A complete administrative dashboard allows staff to manage all site content, including courses, classes, instructors, blog posts, and user applications. The platform also supports memberships and donations, with payments processed securely through the Tilopay gateway. The UI is built with a consistent design system leveraging shadcn/ui components.

