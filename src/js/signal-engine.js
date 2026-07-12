(function () {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function buildMockResponse(payload, data) {
    var request = payload || {};
    var rows = Array.isArray(request.rows) ? request.rows.slice(0, 12) : [];
    var base = data && typeof data === "object" ? clone(data) : {};

    base.summary = Object.assign({}, base.summary || {}, request.summary || {});

    if (rows.length) {
      base.rows = rows;
    } else if (!Array.isArray(base.rows)) {
      base.rows = [];
    }

    if (!base.message) {
      base.message = "Mock Signal Engine response";
    }

    base.generatedAt = new Date().toISOString();
    base.mode = "mock";
    return base;
  }

  function toJsonSafe(response) {
    return response
      .text()
      .then(function (text) {
        if (!text) {
          return {};
        }

        try {
          return JSON.parse(text);
        } catch (e) {
          return { raw: text };
        }
      });
  }

  function requestMockReport(payload, config) {
    var path = config.mockReportPath || "src/data/mock-signal-report.json";
    return fetch(path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(function (response) {
        return toJsonSafe(response).then(function (data) {
          if (!response.ok) {
            throw new Error("Mock Signal Engine source not available: " + response.status);
          }

          return {
            ok: true,
            status: 200,
            data: buildMockResponse(payload, data)
          };
        });
      });
  }

  function requestReport(payload, options) {
    var config = options || {};
    var endpoint = config.reportEndpoint || "/api/signal-engine/report";
    var headers = {
      "Content-Type": "application/json"
    };

    if (config.apiKeyHeader && config.apiKey) {
      headers[config.apiKeyHeader] = config.apiKey;
    }

    if (config.useMock === true) {
      return requestMockReport(payload, config);
    }

    return fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload || {})
    }).then(function (response) {
      return toJsonSafe(response).then(function (data) {
        if (!response.ok) {
          var error = new Error((data && data.message) || ("Signal Engine request failed: " + response.status));
          error.status = response.status;
          error.payload = data;
          throw error;
        }

        return {
          ok: true,
          status: response.status,
          data: data
        };
      });
    }).catch(function () {
      if (config.fallbackToMock === true) {
        return requestMockReport(payload, config);
      }
      throw new Error("Signal Engine request failed and no mock fallback is configured.");
    });
  }

  window.MeridianSignalEngine = {
    requestReport: requestReport
  };
})();
