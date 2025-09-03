function doPost(e) {
  try {
    Logger.log("Raw e: " + JSON.stringify(e));

    if (!e || !e.postData || !e.postData.contents) {
      Logger.log("No payload received");
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "No payload" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const parsed = JSON.parse(e.postData.contents);
    Logger.log("parsed data: " + JSON.stringify(parsed));

    const ss = SpreadsheetApp.openById("1Xr8Z1-SlPaync9PZBR45nkYVQQd2P4SA2PzGRupxiDo");
    let sh = ss.getSheetByName("raw");
    
    if (!sh) {
      sh = ss.insertSheet("raw");
      sh.getRange(1, 1, 1, 10).setValues([[
        'date', 'P', 'V', 'M', 'Q', 'F', 'PQ', 'VQ', 'MQ', 'G'
      ]]);
    }

    const { date, P, V, M, Q, F } = parsed;
    const PQ = P * Q;
    const VQ = V * Q;
    const MQ = M * Q;
    const G = MQ - F;

    sh.appendRow([date, P, V, M, Q, F, PQ, VQ, MQ, G]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: "Data saved" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions() {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
