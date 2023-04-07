const BOT_TOKEN = ('Bot Token');// @BotFather in Telegram
const OPENAI_API_KEY = ('API Open AI'); // https://beta.openai.com/account/api-keys
const SPREADSHEET_ID = "SSD";
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx9T2AY7T-SmZWunetER2VaqpDDE0tQU7hbsM5mtg4rWek7KZZSud8Vyb3CwSndrxA5IQ/exec";
const telegramUrl = "https://api.telegram.org/bot" + BOT_TOKEN;
const youtubegUrl = "https://www.youtube.com/@sigitpermadi1053";
var linkyoutube = "https://www.youtube.com/@sigitpermadi1053" //link youtube

function getMe() {
  var url = telegramUrl + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + WEBHOOK_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doPost(request) {
  try {
    // Parse the request body
    var postData = request.postData;
    if (postData) {
    var data = JSON.parse(postData.contents);
    // your logic here
    } else {
    Logger.log("No post data found");
    }
    // Parse the request body
    const requestBody = JSON.parse(request.postData.contents);
    // Get the message from the request
    const message = requestBody.message;
    // Get the user ID of the sender
    const userId = message.from.id;
    // Get the chat ID from the message
    const chatId = message.chat.id;
    //get time
    var time = new Date();
    //get username
    var userName = message.from.first_name + " " + message.from.last_name;
    //get name
    var nama = message.from.first_name;  
    Logger.log(userId + "\t" + time + "\t" + userName);

    if (message.text.startsWith("/start")){
      sendToTelegram("Halo! " + nama + " 👋\n"+
      "Selamat datang di PermadiAI. \n" +
      "Saya dapat membantu menjawab pertanyaan anda.\n\n" +
      "Cara menggunakan :\n" +
      "🔶 Format: '/ask [spasi] perintah'. \n" +
      "🔶 Contoh: '/ask apa kabar?'. \n" +
      "🔶 Oh iya, jika Anda menyukai jawaban PermadiAI, jangan lupa untuk mampir ke channel YouTube saya untuk mendapatkan konten menarik dan bermanfaat. Dukung saya dengan cara subscribe, like, dan share ya 😁! Terimakasih : ", chatId);
    }

    else if (message.text.startsWith("/ask")) {
      // Get the text of the message
      const text = message.text.substring(5).trim();
      //const text = message.text;
      const chatActionUrl = telegramUrl + "/sendChatAction?chat_id=" + chatId + "&action=typing";
      UrlFetchApp.fetch(chatActionUrl);
      // Send the question to the OpenAI API
      const response = AI_ChatGPT(text);
      sendToTelegram(response, chatId);
      SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0].appendRow([time,userId,userName,text,response]);
    } 
    else {
      // Log a message indicating that the user is not allowed to chat
      Logger.log("Pengguna dengan ID " + userId + " dengan nama " + userName + " tidak boleh menggunakan bot ini.", "error");
      sendToTelegram("Perintah tidak bisa di eksekusi, gunakan format:\n" +
      "🔶 Format: '/ask [spasi] perintah'. \n" +
      "🔶 Contoh: '/ask apa kabar?'. \n" +
      "🔶 Oh iya, jika Anda menyukai jawaban PermadiAI, jangan lupa untuk mampir ke channel YouTube saya untuk mendapatkan konten menarik dan bermanfaat. Dukung saya dengan cara subscribe, like, dan share ya 😁! Terimakasih : ", chatId);
      writeToSheet("Pengguna dengan ID " + userId + " dengan nama " + userName + " tidak boleh menggunakan bot ini.", "error");
    }
  } catch (error) {
    // Log the error message
    Logger.log(error.message);
    writeToSheet('Error in doPost(): '+error.message, "error");
    // Return an error response
    // return ContentService.createTextOutput(JSON.stringify({"success": false, "error": error.message})).setMimeType(ContentService.MimeType.JSON);
  }
}


// Sends a message to the OpenAI API and returns the response
function AI_ChatGPT(prompt, temperature = 0.4, model = "gpt-3.5-turbo") {
  try {
    const url = "https://api.openai.com/v1/chat/completions";
    const payload = {
      model: model,
      messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
      ],
      temperature: temperature,
      max_tokens: 400,
    }
    const options = {
      contentType: "application/json",
      headers: { Authorization: "Bearer " + OPENAI_API_KEY },
      payload: JSON.stringify(payload),
    };

    const response = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    return response.choices[0].message.content.trim();

    // Initialize the response text
    const responseText = "";

    // Loop through the choices array
    for (var i = 0; i < response.choices.length; i++) {
      // Get the text of the current choice
      const choiceText = response.choices[i].text;

      // Add the text to the response text
      responseText += choiceText;
    }


    // Return the response text
    return responseText;
  } catch (error) {
    // Log the error message
    Logger.log(error.message);
  
    // Return an error message
    return "An error occurred while sending the request to the OpenAI API. Error: "+JSON.stringify(error);
  }
}

// Sends a message to the specified Telegram chat
function sendToTelegram(message, chatId) {
  var url = telegramUrl + "/sendMessage?chat_id=" + chatId + "&text=" + encodeURIComponent(message);
  const payload = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Follow Me 😁😊 ",
              url: youtubegUrl,
            },
          ],
        ],
      },
    }),
  };
  var response = UrlFetchApp.fetch(url,payload);
  Logger.log(response.getContentText());  
}

// Writes a value to the specified column in the Google Sheets document
function writeToSheet(value, column) {
  // Get the Google Sheets document
  var sheets = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Get the first sheet in the document
  var sheet = sheets.getSheets()[0];

  // Get the next empty row in the sheet
  var lastRow = sheet.getLastRow();

  if(column == 'answer'){
    var nextRow = lastRow;
  }
  else {  
    var nextRow = lastRow + 1;
  }

  // Write the value
  // Write the value to the specified column in the sheet
  sheet.getRange(nextRow, getColumnNumber(column)).setValue(value);
}

// Returns the number of the column with the specified name
function getColumnNumber(columnName) {
  // Get the Google Sheets document
  var sheets = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Get the first sheet in the document
  var sheet = sheets.getSheets()[0];

  // Get the range of the sheet
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());

  // Get the values of the range
  var values = range.getValues();

  // Loop through the values and return the column number when the column name is found
  for (var i = 0; i < values[0].length; i++) {
    if (values[0][i] == columnName) {
      return i + 1;
    }
  }
}
