export default function robots() {
  const baseUrl = "https://codespirit-blue.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/login/",
          "/register/",
          "/verify-otp/",
        ],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
