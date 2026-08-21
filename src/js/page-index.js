    (function () {
      var marketSelect = document.getElementById("md-market-select");
      var marketForm = document.getElementById("md-market-entry");
      var quickButtons = document.querySelectorAll(".md-market-quick");

      function openDashboard(market) {
        window.location.href = "dashboard.html?market=" + encodeURIComponent(market);
      }

      quickButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var market = btn.getAttribute("data-market");
          if (marketSelect) {
            marketSelect.value = market;
          }
          openDashboard(market);
        });
      });

      if (marketForm && marketSelect) {
        marketForm.addEventListener("submit", function (event) {
          event.preventDefault();
          openDashboard(marketSelect.value);
        });
      }
    })();
