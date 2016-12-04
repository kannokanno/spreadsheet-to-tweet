var COL_DATE   = 0;
var COL_TWEET  = 1;
var COL_STATUS = 2;
var STATUS_READY = 0;
var STATUS_DONE  = 1;

var SHEET_RANGE = 'A2:C150';

function main() {
  var tweet = getNextTweet();
  // Logger.log(tweet);
  postTweet(tweet);
}

function getNextTweet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reserve');
  // 100イベントより多めに一応取っておく
  var rows  = sheet.getRange(SHEET_RANGE).getValues();

  // rowsからfindを呼べないので愚直に
  var today = getToday();
  for (var i = 0; i < rows.length; ++i) {
    var row = rows[i];
    if (isNextTweet(today, row)) {
      // row: A2から始まっているのとヘッダー行で +2
      // col: getRangeのcol指定はA列が1なので+1
      sheet.getRange(i + 2, COL_STATUS + 1).setValue(1);
      return row[COL_TWEET];
    }
  }
}

function getToday() {
  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today;
}

function equalsType(value, expected) {
  return expected === Object.prototype.toString.call(value).slice(8, -1);
}

function isNextTweet(today, row) {
  var inputDate = row[COL_DATE];
  if (!inputDate || !equalsType(inputDate, 'Date')) {
    return false;
  }

  var eventDate = new Date(inputDate);
  if (eventDate.getTime() < today.getTime()) {
    return false;
  }
  if (!row[COL_TWEET].trim()) {
    return false;
  }
  if ((row[COL_STATUS] !== STATUS_READY) && (row[COL_STATUS] !== '')) { // 新規追加した時は未入力があり得るので空文字は許容する
    return false;
  }
  return true;
}

function resetPostStatus() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reserve');
  var rows  = sheet.getRange(SHEET_RANGE).getValues();
  for (var i = 0; i < rows.length; ++i) {
    // col: getRangeのcol指定はA列が1なので+1
    sheet.getRange(i + 1, COL_STATUS + 1).setValue(0);
  }
}


// http://yoshiyuki-hirano.hatenablog.jp/entry/2015/10/13/010317
// OAuth1認証用インスタンス
var twitter = TwitterWebService.getInstance(
  '',
  ''
);

// 認証を行う(必須)
function authorize() {
  twitter.authorize();
}

// 認証後のコールバック(必須)
function authCallback(request) {
  return twitter.authCallback(request);
}

// 認証をリセット
function reset() {
  twitter.reset();
}

function postTweet(tweet) {
  var service  = twitter.getService();
  var response = service.fetch('https://api.twitter.com/1.1/statuses/update.json', {
    method: 'post',
    payload: { status: tweet }
  });
  Logger.log(JSON.parse(response));
}
