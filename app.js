var COL_DATE   = 0;
var COL_TWEET  = 1;
var COL_STATUS = 2;
var STATUS_READY = 0;
var STATUS_DONE  = 1;

function main() {
  var tweet = getNextTweet();
  Logger.log(tweet);
  //postTweet(tweet);
}

function getNextTweet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('reserve');
  // 100イベントより多めに一応取っておく
  var rows  = sheet.getRange('A2:C150').getValues();

  // rowsからfindを呼べないので愚直に
  var today = getToday();
  for (var i = 0; i < rows.length; ++i) {
    var row = rows[i];
    if (isNextTweet(today, row)) {
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

function isNextTweet(today, row) {
  // TODO 空文字などの考慮
  // if (!row[COL_DATE].trim() || !row[COL_TWEET].trim()) {
  //   return false;
  // }
  //
  var eventDate = new Date(row[COL_DATE]);
  if (eventDate.getTime() < today.getTime()) {
    return false;
  }
  if (row[COL_STATUS] !== STATUS_READY) {
    return false;
  }
  return true;
}

// TODO
function resetPostStatus() {
  // 1日1回
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
