export default function SEOJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://codespirit-blue.vercel.app/#organization",
        name: "CodeSpirit",
        url: "https://codespirit-blue.vercel.app",
        description:
          "CodeSpirit is a free coding learning platform for learning programming through tutorials, quizzes, and coding challenges.",
      },

      {
        "@type": "WebSite",
        "@id": "https://codespirit-blue.vercel.app/#website",
        url: "https://codespirit-blue.vercel.app",
        name: "CodeSpirit",
        description:
          "Learn coding freely in a game world.",
        publisher: {
          "@id": "https://codespirit-blue.vercel.app/#organization",
        },
      },

      {
        "@type": "LearningResource",
        name: "CodeSpirit",
        url: "https://codespirit-blue.vercel.app",
        description:
          "Free programming tutorials, quizzes, and coding practice for learners.",
        educationalLevel: "Beginner",
        learningResourceType: [
          "Tutorial",
          "Quiz",
          "Coding Challenge",
        ],
        isAccessibleForFree: true,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
