(function () {
  "use strict";

  window.MERIDIAN_CONFIG = {
    ticker: [
      { label: "CRE Price Index", value: "128.4", delta: "+1.8% QoQ" },
      { label: "Office Vacancy", value: "17.2%", delta: "-30 bps YoY" },
      { label: "Industrial Rent", value: "+4.6%", delta: "12M" },
      { label: "Transaction Volume", value: "$86.1B", delta: "Q2" },
      { label: "Debt Availability", value: "61.3", delta: "+2.1 MoM" }
    ],
    quickLinks: [
      { name: "Markets", href: "category.html" },
      { name: "Sectors", href: "sectors.html" },
      { name: "Research", href: "search.html" },
      { name: "Policy", href: "policy.html" },
      { name: "Rankings", href: "author.html" },
      { name: "Contact", href: "contact-us.html" }
    ],
    datalabMetros: [
      { metro: "Dallas-Fort Worth", region: "Sun Belt", sector: "Industrial", capRate: 5.1, noiGrowth: 3.4, occupancy: 94.2, yoyPrice: 4.9, volumeB: 12.6 },
      { metro: "Atlanta", region: "Sun Belt", sector: "Multifamily", capRate: 5.3, noiGrowth: 3.8, occupancy: 95.1, yoyPrice: 5.2, volumeB: 8.7 },
      { metro: "Austin", region: "Sun Belt", sector: "Office", capRate: 5.8, noiGrowth: 2.6, occupancy: 87.9, yoyPrice: 1.1, volumeB: 6.3 },
      { metro: "New York", region: "Gateway", sector: "Office", capRate: 4.4, noiGrowth: 2.2, occupancy: 89.4, yoyPrice: 2.1, volumeB: 15.4 },
      { metro: "Los Angeles", region: "Gateway", sector: "Industrial", capRate: 4.2, noiGrowth: 1.9, occupancy: 95.3, yoyPrice: 1.6, volumeB: 10.1 },
      { metro: "Chicago", region: "Gateway", sector: "Retail", capRate: 6.0, noiGrowth: 1.5, occupancy: 90.1, yoyPrice: 0.8, volumeB: 7.2 },
      { metro: "Nashville", region: "Sun Belt", sector: "Multifamily", capRate: 5.5, noiGrowth: 4.1, occupancy: 95.7, yoyPrice: 6.0, volumeB: 5.1 },
      { metro: "Seattle", region: "Coastal", sector: "Office", capRate: 5.0, noiGrowth: 2.0, occupancy: 88.2, yoyPrice: 1.4, volumeB: 5.8 },
      { metro: "Boston", region: "Gateway", sector: "Life Science", capRate: 4.7, noiGrowth: 2.7, occupancy: 92.4, yoyPrice: 2.8, volumeB: 6.6 },
      { metro: "Miami", region: "Sun Belt", sector: "Hospitality", capRate: 6.2, noiGrowth: 4.3, occupancy: 93.1, yoyPrice: 6.4, volumeB: 9.2 }
    ],
    signalEngine: {
      reportEndpoint: "/api/signal-engine/report",
      useMock: true,
      fallbackToMock: true,
      mockReportPath: "src/data/mock-signal-report.json",
      apiKeyHeader: "",
      apiKey: ""
    },
    bookmarksKey: "meridianSavedBriefings"
  };
})();
