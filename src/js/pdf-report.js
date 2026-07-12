(function () {
  "use strict";

  function safe(value) {
    return value === undefined || value === null ? "-" : String(value);
  }

  function buildFallbackDocument(title, summary, rows) {
    var lines = [];
    lines.push(title);
    lines.push("");

    Object.keys(summary || {}).forEach(function (key) {
      lines.push(key + ": " + safe(summary[key]));
    });

    lines.push("");
    lines.push("Rows:");

    (rows || []).forEach(function (row, index) {
      lines.push((index + 1) + ". " + [
        safe(row.metro),
        safe(row.region),
        safe(row.sector),
        safe(row.capRate) + "%",
        safe(row.noiGrowth) + "%",
        safe(row.occupancy) + "%",
        "$" + safe(row.volumeB) + "B"
      ].join(" | "));
    });

    return lines.join("\n");
  }

  function fallbackDownload(title, summary, rows, fileName) {
    var blob = new Blob([buildFallbackDocument(title, summary, rows)], {
      type: "text/plain;charset=utf-8"
    });

    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName.replace(/\.pdf$/i, ".txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { fallback: true };
  }

  function generateReport(options) {
    var data = options || {};
    var fileName = data.fileName || "meridian-signal-report.pdf";
    var title = data.title || "Meridian Data Signal Report";
    var summary = data.summary || {};
    var rows = data.rows || [];
    var generatedAt = new Date().toLocaleString();

    if (!window.jspdf || !window.jspdf.jsPDF) {
      return Promise.resolve(fallbackDownload(title, summary, rows, fileName));
    }

    var jsPDFCtor = window.jspdf.jsPDF;
    var doc = new jsPDFCtor({ orientation: "portrait", unit: "pt", format: "a4" });
    var y = 56;

    function line(text, size, weight) {
      doc.setFont("helvetica", weight || "normal");
      doc.setFontSize(size || 11);
      doc.text(String(text), 48, y);
      y += size && size > 14 ? 24 : 16;
    }

    line(title, 18, "bold");
    line("Generated: " + generatedAt, 10, "normal");
    y += 8;

    line("Summary", 13, "bold");
    Object.keys(summary).forEach(function (key) {
      line(key + ": " + safe(summary[key]), 11, "normal");
    });

    y += 10;
    line("Top Rows", 13, "bold");

    rows.slice(0, 20).forEach(function (row, idx) {
      var rowText = [
        (idx + 1) + ". " + safe(row.metro),
        safe(row.region),
        safe(row.sector),
        safe(row.capRate) + "% cap",
        safe(row.noiGrowth) + "% noi",
        safe(row.occupancy) + "% occ",
        "$" + safe(row.volumeB) + "B vol"
      ].join(" | ");

      if (y > 760) {
        doc.addPage();
        y = 56;
      }

      line(rowText, 10, "normal");
    });

    doc.save(fileName);
    return Promise.resolve({ fallback: false });
  }

  window.MeridianPdfReport = {
    generateReport: generateReport
  };
})();
