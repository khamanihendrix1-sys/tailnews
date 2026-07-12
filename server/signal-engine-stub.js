"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.SIGNAL_ENGINE_PORT || 4177);
const MOCK_FILE = path.join(__dirname, "..", "src", "data", "mock-signal-report.json");

function readMockTemplate() {
  try {
    const raw = fs.readFileSync(MOCK_FILE, "utf8");
    return JSON.parse(raw);
  } catch (_err) {
    return {
      engine: "Meridian Signal Engine",
      summary: {},
      highlights: [],
      recommendations: [],
      rows: []
    };
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new Error("Payload too large"));
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (_err) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function numericAvg(rows, key) {
  if (!Array.isArray(rows) || !rows.length) {
    return 0;
  }

  const total = rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
  return total / rows.length;
}

function percentileRank(value, floor, ceil) {
  const safeValue = Number(value) || 0;
  const span = Math.max(1, ceil - floor);
  const ratio = Math.max(0, Math.min(1, (safeValue - floor) / span));
  return Math.round(ratio * 100);
}

function buildLiveResponse(payload) {
  const template = readMockTemplate();
  const rows = Array.isArray(payload.rows) ? payload.rows.slice(0, 15) : [];
  const avgNoi = numericAvg(rows, "noiGrowth");
  const avgOcc = numericAvg(rows, "occupancy");
  const avgCap = numericAvg(rows, "capRate");

  const signalScore = Math.round((percentileRank(avgNoi, 0, 8) * 0.5) + (percentileRank(avgOcc, 70, 98) * 0.35) + (percentileRank(8 - avgCap, 0, 5) * 0.15));
  const riskBand = signalScore >= 75 ? "Low to Moderate" : signalScore >= 55 ? "Moderate" : "Elevated";

  const summary = Object.assign({}, template.summary || {}, payload.summary || {}, {
    signalScore,
    riskBand,
    confidence: (Math.min(0.96, 0.68 + (rows.length * 0.01))).toFixed(2),
    evaluatedRows: rows.length,
    generatedAt: new Date().toISOString()
  });

  return {
    engine: "Meridian Signal Engine Stub",
    mode: "live-stub",
    message: "Local stub processed report payload successfully.",
    filters: payload.filters || {},
    sort: payload.sort || {},
    summary,
    highlights: (template.highlights || []).slice(0, 3),
    recommendations: (template.recommendations || []).slice(0, 3),
    rows
  };
}

function writeJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key"
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    writeJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    writeJson(res, 200, { ok: true, service: "signal-engine-stub" });
    return;
  }

  if (req.method === "POST" && req.url === "/api/signal-engine/report") {
    try {
      const payload = await parseJsonBody(req);
      const response = buildLiveResponse(payload);
      writeJson(res, 200, response);
    } catch (err) {
      writeJson(res, 400, {
        ok: false,
        message: err.message || "Invalid request"
      });
    }
    return;
  }

  writeJson(res, 404, {
    ok: false,
    message: "Route not found"
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log("Signal Engine stub running on http://localhost:" + PORT);
  // eslint-disable-next-line no-console
  console.log("POST /api/signal-engine/report and GET /health are available.");
});
