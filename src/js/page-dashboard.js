    (function () {
      var markets = {
        "Dallas-Fort Worth": {
          score: "82 / 100",
          scoreState: "Bullish",
          momentum: "Strong",
          momentumState: "Bullish",
          outlook: "Positive",
          outlookState: "Neutral",
          volume: "$12.6B",
          watch: "Supply Risk",
          watchState: "Watch",
          pricing: "+4.9%",
          capRate: "5.1%",
          vacancy: "6.3%",
          rentGrowth: "+4.6%",
          absorption: "+2.1M SF",
          pipeline: "32.4M SF",
          supplyDemand: "Balanced",
          activity: "Elevated"
        },
        "Atlanta": {
          score: "80 / 100",
          scoreState: "Bullish",
          momentum: "Strong",
          momentumState: "Bullish",
          outlook: "Positive",
          outlookState: "Bullish",
          volume: "$8.7B",
          watch: "New Supply",
          watchState: "Watch",
          pricing: "+5.2%",
          capRate: "5.3%",
          vacancy: "7.0%",
          rentGrowth: "+4.1%",
          absorption: "+1.4M SF",
          pipeline: "28.2M SF",
          supplyDemand: "Balanced",
          activity: "High"
        },
        "New York": {
          score: "67 / 100",
          scoreState: "Neutral",
          momentum: "Mixed",
          momentumState: "Neutral",
          outlook: "Stabilizing",
          outlookState: "Watch",
          volume: "$15.4B",
          watch: "Office Distress",
          watchState: "Watch",
          pricing: "+2.1%",
          capRate: "4.4%",
          vacancy: "12.8%",
          rentGrowth: "+1.3%",
          absorption: "+0.7M SF",
          pipeline: "16.1M SF",
          supplyDemand: "Soft",
          activity: "Mixed"
        },
        "Los Angeles": {
          score: "74 / 100",
          scoreState: "Neutral",
          momentum: "Resilient",
          momentumState: "Neutral",
          outlook: "Selective",
          outlookState: "Neutral",
          volume: "$10.1B",
          watch: "Affordability",
          watchState: "Watch",
          pricing: "+1.6%",
          capRate: "4.2%",
          vacancy: "5.9%",
          rentGrowth: "+2.0%",
          absorption: "+0.4M SF",
          pipeline: "12.4M SF",
          supplyDemand: "Tight",
          activity: "Moderate"
        },
        "Austin": {
          score: "73 / 100",
          scoreState: "Neutral",
          momentum: "Rebalancing",
          momentumState: "Neutral",
          outlook: "Improving",
          outlookState: "Bullish",
          volume: "$6.3B",
          watch: "Office Vacancy",
          watchState: "Watch",
          pricing: "+1.1%",
          capRate: "5.8%",
          vacancy: "15.2%",
          rentGrowth: "+1.8%",
          absorption: "+0.8M SF",
          pipeline: "19.6M SF",
          supplyDemand: "Soft",
          activity: "Recovering"
        },
        "Miami": {
          score: "79 / 100",
          scoreState: "Bullish",
          momentum: "Strong",
          momentumState: "Bullish",
          outlook: "Positive",
          outlookState: "Bullish",
          volume: "$9.2B",
          watch: "Pricing Pressure",
          watchState: "Neutral",
          pricing: "+6.4%",
          capRate: "6.2%",
          vacancy: "6.9%",
          rentGrowth: "+4.9%",
          absorption: "+1.2M SF",
          pipeline: "14.7M SF",
          supplyDemand: "Tight",
          activity: "Elevated"
        },
        "Phoenix": {
          score: "78 / 100",
          scoreState: "Bullish",
          momentum: "Strong",
          momentumState: "Bullish",
          outlook: "Positive",
          outlookState: "Bullish",
          volume: "$7.8B",
          watch: "Pipeline",
          watchState: "Watch",
          pricing: "+4.5%",
          capRate: "5.4%",
          vacancy: "7.1%",
          rentGrowth: "+4.3%",
          absorption: "+1.6M SF",
          pipeline: "26.8M SF",
          supplyDemand: "Balanced",
          activity: "High"
        },
        "Chicago": {
          score: "69 / 100",
          scoreState: "Neutral",
          momentum: "Mixed",
          momentumState: "Neutral",
          outlook: "Selective",
          outlookState: "Neutral",
          volume: "$7.2B",
          watch: "Rent Dispersion",
          watchState: "Watch",
          pricing: "+0.8%",
          capRate: "6.0%",
          vacancy: "10.9%",
          rentGrowth: "+1.2%",
          absorption: "+0.5M SF",
          pipeline: "10.3M SF",
          supplyDemand: "Balanced",
          activity: "Moderate"
        }
      };

      var sectorData = {
        "Office": { score: "65 / 100", momentum: "Moderate", rent: "+0.9%", vacancy: "14.8%", absorption: "+0.3M SF", volume: "$1.8B", commentary: "Demand is bifurcated. Class A transit-oriented inventory outperforms while commodity inventory remains under pressure." },
        "Industrial": { score: "82 / 100", momentum: "Strong", rent: "+4.6%", vacancy: "6.3%", absorption: "+2.1M SF", volume: "$5.2B", commentary: "Demand is concentrated in modern bulk distribution product. New starts remain disciplined, supporting occupancy and underwriting confidence." },
        "Multifamily": { score: "77 / 100", momentum: "Stable", rent: "+3.1%", vacancy: "7.6%", absorption: "+9,300 units", volume: "$3.7B", commentary: "Household formation and migration support occupancy. Deliveries are being absorbed with localized softness in lease-up submarkets." },
        "Retail": { score: "71 / 100", momentum: "Stable", rent: "+2.2%", vacancy: "5.1%", absorption: "+0.8M SF", volume: "$1.5B", commentary: "Necessity retail remains resilient. Power centers and grocery-anchored formats continue to attract lender and investor attention." },
        "Hospitality": { score: "74 / 100", momentum: "Positive", rent: "ADR +3.8%", vacancy: "N/A", absorption: "RevPAR 4.2%", volume: "$1.2B", commentary: "Leisure demand remains durable and group recovery is helping urban performance. Capital is selective but active for quality product." },
        "Data Centers": { score: "84 / 100", momentum: "Strong", rent: "+5.4%", vacancy: "2.9%", absorption: "+340 MW", volume: "$2.4B", commentary: "Enterprise and AI-driven demand is sustaining preleasing and rent growth, despite power and land constraints in key nodes." },
        "Life Sciences": { score: "70 / 100", momentum: "Mixed", rent: "+1.6%", vacancy: "10.2%", absorption: " -0.2M SF", volume: "$0.9B", commentary: "Fundraising and tenant expansion remain uneven. Prime innovation clusters continue to outperform secondary submarkets." },
        "Self Storage": { score: "73 / 100", momentum: "Stable", rent: "+2.4%", vacancy: "8.7%", absorption: "+0.5M SF", volume: "$0.7B", commentary: "Move-ins remain healthy and operators are managing street rates with tighter promotional discipline." },
        "Mixed Use": { score: "75 / 100", momentum: "Positive", rent: "+2.9%", vacancy: "9.3%", absorption: "+0.6M SF", volume: "$1.4B", commentary: "Live-work-play districts are attracting institutional capital where placemaking, transit access, and demographic growth align." }
      };

      var compareMarkets = ["Atlanta", "Dallas-Fort Worth", "Austin", "Miami"];
      var aiAnswers = {
        "which sun belt markets currently have the strongest industrial fundamentals?": "Dallas-Fort Worth, Atlanta, and Phoenix currently lead Sun Belt industrial fundamentals based on above-trend absorption, positive rent growth, and below-national vacancy. Meridian confidence: High.",
        "why has atlanta industrial performed better than dallas over the last 12 months?": "Atlanta has shown tighter vacancy compression and steadier leasing velocity, while Dallas has absorbed larger new supply. Both remain strong, but Atlanta's supply-demand balance has been more favorable over the last 12 months."
      };

      function byId(id) {
        return document.getElementById(id);
      }

      function fillMarket(marketName) {
        var data = markets[marketName] || markets["Dallas-Fort Worth"];
        byId("md-market-title").textContent = marketName;
        byId("md-score").textContent = data.score;
        byId("md-score-state").textContent = data.scoreState;
        byId("md-momentum").textContent = data.momentum;
        byId("md-momentum-state").textContent = data.momentumState;
        byId("md-outlook").textContent = data.outlook;
        byId("md-outlook-state").textContent = data.outlookState;
        byId("md-volume").textContent = data.volume;
        byId("md-watch").textContent = data.watch;
        byId("md-watch-state").textContent = data.watchState;
        byId("md-pricing").textContent = data.pricing;
        byId("md-cap-rate").textContent = data.capRate;
        byId("md-vacancy").textContent = data.vacancy;
        byId("md-rent-growth").textContent = data.rentGrowth;
        byId("md-absorption").textContent = data.absorption;
        byId("md-pipeline").textContent = data.pipeline;
        byId("md-supply-demand").textContent = data.supplyDemand;
        byId("md-activity").textContent = data.activity;
      }

      function fillSector(marketName, sectorName) {
        var data = sectorData[sectorName];
        byId("md-sector-headline").textContent = marketName + " " + sectorName;
        byId("md-sector-score").textContent = data.score;
        byId("md-sector-momentum").textContent = data.momentum;
        byId("md-sector-rent").textContent = data.rent;
        byId("md-sector-vacancy").textContent = data.vacancy;
        byId("md-sector-absorption").textContent = data.absorption;
        byId("md-sector-volume").textContent = data.volume;
        byId("md-sector-commentary").textContent = data.commentary;
      }

      function fillCompareTable() {
        var body = byId("md-compare-body");
        body.innerHTML = "";
        compareMarkets.forEach(function (name) {
          var row = markets[name];
          var tr = document.createElement("tr");
          tr.className = "border-t border-gray-100";
          tr.innerHTML =
            "<td class='p-2'>" + name + "</td>" +
            "<td class='p-2'>" + row.capRate + "</td>" +
            "<td class='p-2'>" + row.rentGrowth + "</td>" +
            "<td class='p-2'>" + row.vacancy + "</td>" +
            "<td class='p-2'>" + row.absorption + "</td>" +
            "<td class='p-2'>" + row.score + "</td>";
          body.appendChild(tr);
        });
      }

      function initMarketFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var requested = params.get("market");
        var select = byId("md-market-select");
        if (requested && markets[requested]) {
          select.value = requested;
          return requested;
        }
        return select.value;
      }

      var currentMarket = initMarketFromUrl();
      fillMarket(currentMarket);
      fillSector(currentMarket, "Industrial");
      fillCompareTable();

      var marketForm = byId("md-market-form");
      var marketSelect = byId("md-market-select");
      marketForm.addEventListener("submit", function (event) {
        event.preventDefault();
        currentMarket = marketSelect.value;
        fillMarket(currentMarket);
        fillSector(currentMarket, "Industrial");
        var nextUrl = "dashboard.html?market=" + encodeURIComponent(currentMarket);
        window.history.replaceState({}, "", nextUrl);
      });

      document.querySelectorAll(".md-sector-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          fillSector(currentMarket, btn.getAttribute("data-sector"));
        });
      });

      var aiForm = byId("md-ai-form");
      var aiInput = byId("md-ai-input");
      var aiAnswer = byId("md-ai-answer");
      aiForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var key = (aiInput.value || "").trim().toLowerCase();
        aiAnswer.textContent = aiAnswers[key] || "Meridian AI Summary: " + currentMarket + " shows mixed signals by sector. Industrial and multifamily are currently stronger, while office recovery remains uneven. Ask a market/sector-specific follow-up for deeper evidence.";
      });
    })();
