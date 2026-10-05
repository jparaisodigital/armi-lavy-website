const SITE_CONFIG = {
  brand: {
    name: "Armi L. Lavy",
    initials: "AL",
    tagline: "A more confident relationship with money.",
    email: "",
    gumroadProfile: "https://armilavy.gumroad.com"
  },

  hero: {
    interval: 6500,
    slides: [
      {
        image:
          "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=2200&q=85",
        caption: "A thoughtful approach to investing"
      },
      {
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=85",
        caption: "Build habits that support your goals"
      },
      {
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=85",
        caption: "Make informed financial decisions"
      }
    ]
  },

  products: [
    {
      id: "first-dividend-paycheck",
      featured: true,
      title: "First Dividend Paycheck",
      eyebrow: "BEGINNER'S EDITION",
      price: 9.99,
      currency: "USD",
      image: "assets/first.png",
      description:
        "A calm, plain-English guide to understanding dividend investing, evaluating dividend safety, building a starter portfolio, and creating a practical investing routine.",
      format: "PDF + Interactive HTML",
      level: "Beginner",
      category: "Personal Finance / Investing",
      edition: "Complete Guide",
      use: "Educational only",
      gumroadUrl:
        "https://armilavy.gumroad.com/l/first-dividend-paycheck",
      buttonLabel: "Get the Guide"
    }

    /*
      ADD MORE PRODUCTS HERE.

      Example:

      {
        id: "new-finance-guide",
        featured: false,
        title: "Your Next Finance Guide",
        eyebrow: "PRACTICAL EDITION",
        price: 19.00,
        currency: "USD",
        image: "assets/your-new-guide.jpg",
        description: "A short description of your new digital product.",
        format: "PDF",
        level: "Beginner",
        category: "Personal Finance",
        edition: "Digital Guide",
        use: "Educational only",
        gumroadUrl:
          "https://armilavy.gumroad.com/l/YOUR-PRODUCT-SLUG",
        buttonLabel: "View the Guide"
      }
    */
  ],

  news: {
    enabled: true,
    limit: 6,
    apiUrl:
      "https://armi-finance-news.armilavy1986.workers.dev/api/news"
  },

  newsletter: {
    enabled: false,          // gawing true kapag may formAction na
    formAction: "",          // POST URL ng form mula sa email provider
    emailField: "email",     // pangalan ng email field (depende sa provider)
    leadMagnetUrl: "",       // link ng libreng PDF, ipapakita pagkatapos mag-subscribe
    leadMagnetLabel: "Download your free checklist"
  }

};

window.SITE_CONFIG = SITE_CONFIG;