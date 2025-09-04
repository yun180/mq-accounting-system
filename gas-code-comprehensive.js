
const SPREADSHEET_ID = '1Xr8Z1-SlPaync9PZBR45nkYVQQd2P4SA2PzGRupxiDo';
const SHEET_NAME = 'MQData';

const COLUMNS = {
  DATE: 0,    // A列: 日付
  P: 1,       // B列: P (固定費F)
  V: 2,       // C列: V (f/m100)
  M: 3,       // D列: M (目標MQ)
  Q: 4,       // E列: Q (実績MQ)
  PQ: 5,      // F列: PQ (P×Q)
  MQ: 6,      // G列: MQ (M×Q)
  VQ: 7,      // H列: VQ (V×Q)
  F: 8,       // I列: F (費用)
  G: 9        // J列: G (MQ-F)
};

function doGet(e) {
  Logger.log("=== doGet CALLED ===");
  
  const parameter = (e && e.parameter) ? e.parameter : {};
  Logger.log("📦 Parameters: " + JSON.stringify(parameter));
  
  const path = parameter.path || '';
  
  switch(path) {
    case 'input':
      return HtmlService.createTemplateFromFile('input').evaluate()
        .setTitle('数値入力')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    case 'graph':
      return HtmlService.createTemplateFromFile('graph').evaluate()
        .setTitle('グラフ表示')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    case 'annual':
      return HtmlService.createTemplateFromFile('annual').evaluate()
        .setTitle('移動年計')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    case 'api':
      return handleApiRequest(e || {});
    
    default:
      return HtmlService.createTemplateFromFile('input').evaluate()
        .setTitle('MQ管理システム')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function handleApiRequest(e) {
  Logger.log("=== API REQUEST ===");
  
  const parameter = (e && e.parameter) ? e.parameter : {};
  Logger.log("📦 Parameters: " + JSON.stringify(parameter));
  
  const action = parameter.action;
  
  try {
    switch(action) {
      case 'getMQData':
        const data = getMQData();
        Logger.log("📊 Data retrieved: " + data.length + " records");
        return ContentService
          .createTextOutput(JSON.stringify({success: true, data: data}))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'saveData':
        const inputData = {
          P: parseFloat(parameter.P) || 0,
          V: parseFloat(parameter.V) || 0,
          M: parseFloat(parameter.M) || 0,
          Q: parseFloat(parameter.Q) || 0,
          F: parseFloat(parameter.F) || 0
        };
        Logger.log("💾 Saving data: " + JSON.stringify(inputData));
        const result = saveMQDataFromWeb(inputData);
        return ContentService
          .createTextOutput(JSON.stringify({success: true, result: result}))
          .setMimeType(ContentService.MimeType.JSON);
      
      default:
        throw new Error('不明なアクションです: ' + action);
    }
  } catch (error) {
    Logger.log("🔥 API Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  Logger.log("=== doPost CALLED ===");
  Logger.log("🔍 Arguments length: " + arguments.length);
  Logger.log("🔍 e type: " + typeof e);
  Logger.log("🔍 e value: " + e);
  
  try {
    if (arguments.length === 0 || e === undefined || e === null) {
      Logger.log("🚨 doPost called without proper arguments - using fallback");
      
      const fallbackData = {
        date: Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
        P: 0,
        V: 0,
        M: 0,
        Q: 0,
        F: 0
      };
      
      const result = saveDataFromPost(fallbackData);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          ok: true, 
          message: "Data saved with fallback values (no request data available)",
          data: fallbackData
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log("📦 e is defined, processing normally");
    
    const hasParameter = e && e.hasOwnProperty('parameter') && e.parameter !== null;
    const hasPostData = e && e.hasOwnProperty('postData') && e.postData !== null;
    
    Logger.log("📦 Has parameter: " + hasParameter);
    Logger.log("📦 Has postData: " + hasPostData);
    
    if (hasParameter) {
      Logger.log("📦 Parameter: " + JSON.stringify(e.parameter));
    }
    
    if (hasPostData) {
      Logger.log("📦 PostData: " + JSON.stringify(e.postData));
    }
    
    let jsonData = null;
    
    if (hasParameter && e.parameter.data) {
      try {
        jsonData = JSON.parse(e.parameter.data);
        Logger.log("📑 Successfully parsed parameter.data");
      } catch (parseError) {
        Logger.log("🚨 Failed to parse parameter.data: " + parseError);
      }
    }
    
    if (!jsonData && hasPostData && e.postData.contents) {
      try {
        jsonData = JSON.parse(e.postData.contents);
        Logger.log("📑 Successfully parsed postData.contents");
      } catch (parseError) {
        Logger.log("🚨 Failed to parse postData.contents: " + parseError);
      }
    }
    
    if (!jsonData && hasParameter && Object.keys(e.parameter).length > 0) {
      if (e.parameter.P || e.parameter.V || e.parameter.M || e.parameter.Q || e.parameter.F) {
        jsonData = {
          date: e.parameter.date || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
          P: parseFloat(e.parameter.P) || 0,
          V: parseFloat(e.parameter.V) || 0,
          M: parseFloat(e.parameter.M) || 0,
          Q: parseFloat(e.parameter.Q) || 0,
          F: parseFloat(e.parameter.F) || 0
        };
        Logger.log("📑 Constructed data from parameters");
      }
    }
    
    if (!jsonData) {
      Logger.log("🚨 No valid data found - using empty fallback");
      jsonData = {
        date: Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
        P: 0,
        V: 0,
        M: 0,
        Q: 0,
        F: 0
      };
    }
    
    Logger.log("✅ Final parsed data: " + JSON.stringify(jsonData));
    
    const result = saveDataFromPost(jsonData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        ok: true, 
        message: "Data saved successfully", 
        data: jsonData 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    Logger.log("🔥 Critical error in doPost: " + err.toString());
    Logger.log("🔥 Error stack: " + (err.stack || 'No stack available'));
    
    try {
      const errorFallbackData = {
        date: Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
        P: -1, // エラーマーカー
        V: -1,
        M: -1,
        Q: -1,
        F: -1
      };
      
      saveDataFromPost(errorFallbackData);
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          ok: false, 
          error: err.toString(),
          fallbackSaved: true,
          data: errorFallbackData
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (fallbackError) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          ok: false, 
          error: err.toString(),
          fallbackError: fallbackError.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function saveDataFromPost(jsonData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log("📊 Creating new sheet");
      sheet = initializeSpreadsheet();
    }
    
    const { date, P, V, M, Q, F } = jsonData;
    
    const safeP = parseFloat(P) || 0;
    const safeV = parseFloat(V) || 0;
    const safeM = parseFloat(M) || 0;
    const safeQ = parseFloat(Q) || 0;
    const safeF = parseFloat(F) || 0;
    
    const PQ = safeP * safeQ;
    const MQ = safeM * safeQ;
    const VQ = safeV * safeQ;
    const G = MQ - safeF;
    
    let finalDate;
    if (date && date !== '') {
      finalDate = date;
    } else {
      finalDate = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
    }
    
    const rowData = [
      finalDate,
      safeP,   // P (固定費F)
      safeV,   // V (f/m100)
      safeM,   // M (目標MQ)
      safeQ,   // Q (実績MQ)
      PQ,      // PQ (P×Q)
      MQ,      // MQ (M×Q)
      VQ,      // VQ (V×Q)
      safeF,   // F (費用)
      G        // G (MQ-F)
    ];
    
    sheet.appendRow(rowData);
    
    Logger.log("💾 Data saved to sheet: " + JSON.stringify(rowData));
    
    return { success: true, message: "Data saved" };
    
  } catch (err) {
    Logger.log("🔥 Error in saveDataFromPost: " + err.toString());
    throw err;
  }
}

function getMQData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log("📊 Sheet not found, creating new one");
      initializeSpreadsheet();
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log("📊 No data found");
      return [];
    }
    
    return data.slice(1).map(row => ({
      date: row[COLUMNS.DATE],
      P: row[COLUMNS.P] || 0,
      V: row[COLUMNS.V] || 0,
      M: row[COLUMNS.M] || 0,
      Q: row[COLUMNS.Q] || 0,
      PQ: row[COLUMNS.PQ] || 0,
      MQ: row[COLUMNS.MQ] || 0,
      VQ: row[COLUMNS.VQ] || 0,
      F: row[COLUMNS.F] || 0,
      G: row[COLUMNS.G] || 0
    }));
  } catch (err) {
    Logger.log("🔥 Error in getMQData: " + err.toString());
    return [];
  }
}

function saveMQDataFromWeb(inputData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = initializeSpreadsheet();
    }
    
    const today = new Date();
    const formattedDate = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd');
    
    const PQ = inputData.P * inputData.Q;
    const MQ = inputData.M * inputData.Q;
    const VQ = inputData.V * inputData.Q;
    const G = MQ - inputData.F;
    
    const rowData = [
      formattedDate,
      inputData.P,  // P (固定費F)
      inputData.V,  // V (f/m100)
      inputData.M,  // M (目標MQ)
      inputData.Q,  // Q (実績MQ)
      PQ,          // PQ (P×Q)
      MQ,          // MQ (M×Q)
      VQ,          // VQ (V×Q)
      inputData.F, // F (費用)
      G            // G (MQ-F)
    ];
    
    sheet.appendRow(rowData);
    
    Logger.log("💾 Saved data: " + JSON.stringify(rowData));
    
    return { success: true, message: 'データが保存されました' };
    
  } catch (err) {
    Logger.log("🔥 Error in saveMQDataFromWeb: " + err.toString());
    throw err;
  }
}

function initializeSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    
    const headers = [[
      '日付',      // A列: date
      'P',         // B列: P (固定費F)
      'V',         // C列: V (f/m100)
      'M',         // D列: M (目標MQ)
      'Q',         // E列: Q (実績MQ)
      'PQ',        // F列: PQ (P×Q)
      'MQ',        // G列: MQ (M×Q)
      'VQ',        // H列: VQ (V×Q)
      'F',         // I列: F (費用)
      'G'          // J列: G (MQ-F)
    ]];
    
    sheet.getRange(1, 1, 1, 10).setValues(headers);
    
    const headerRange = sheet.getRange(1, 1, 1, 10);
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    
    sheet.setColumnWidths(1, 10, 100);
    
    Logger.log("📊 Initialized spreadsheet with unified headers");
    
    return sheet;
    
  } catch (err) {
    Logger.log("🔥 Error in initializeSpreadsheet: " + err.toString());
    throw err;
  }
}

function testDoPostWithoutArgs() {
  Logger.log("🧪 Testing doPost without arguments");
  const result = doPost();
  Logger.log("🧪 Test result: " + result.getContent());
}

function testDoPostWithArgs() {
  Logger.log("🧪 Testing doPost with arguments");
  const testData = {
    parameter: {
      data: JSON.stringify({
        date: "2025-09-04",
        P: 1000,
        V: 500,
        M: 2000,
        Q: 1800,
        F: 800
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log("🧪 Test result: " + result.getContent());
}
