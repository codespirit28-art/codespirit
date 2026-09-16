export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/dashboard/",
        "/login/",
        "/register/",
        "/verify-otp/",
      ],
    },
    sitemap: "https://codespirit-blue.vercel.app/sitemap.xml",
  };
}
