"use strict";

const Telegraf = require("telegraf");
const TelegrafI18n = require("telegraf-i18n");
const { Markup } = require("telegraf");
const path = require("path");

// Load and instantiate Chance
var chance = require("chance").Chance();

const config = require("./config");
const dataService = require("./dataService");

const site = "https://robohash.org/";

const i18n = new TelegrafI18n({
  directory: path.resolve(__dirname, "locales"),
  defaultLanguage: "en",
});

const bot = new Telegraf(config.botToken);

bot.use(i18n.middleware());

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username;
  console.log("Initialized", botInfo.username);
});

bot.command("broadcast", (ctx) => {
  if (ctx.from.id == config.adminChatId) {
    var words = ctx.message.text.split(" ");
    words.shift(); //remove first word (which ist "/broadcast")
    if (words.length == 0)
      //don't send empty message
      return;
    var broadcastMessage = words.join(" ");
    var userList = dataService.getUserList();
    console.log("Sending broadcast message to", userList.length, "users:  ", broadcastMessage);
    userList.forEach((userId) => {
      console.log(
        ">",
        {
          id: userId,
        },
        broadcastMessage
      );
      ctx.telegram.sendMessage(userId, broadcastMessage);
    });
  }
});

bot.start((ctx) => {
  dataService.registerUser(ctx);
  ctx.i18n.locale(ctx.from.language_code);
  var msg = ctx.i18n.t("hello"); //i18nMessage('hello')
  return ctx.reply(
    msg,
    Markup.keyboard([
      ["🤖 Robot", "👾 Monster", "👽 Alien", "🐱 Cat"], // Row1 with 2 buttons
      ["📖 About", "📞 Feedback"], // Row2 with 2 buttons
    ])
      .oneTime()
      .resize()
      .extra()
  );
});

bot.hears("🤖 Robot", (ctx) => {
  let _hash = getHash();
  let _set = "?set=set1";
  return ctx.replyWithPhoto(generateURL(_hash, _set));
});

bot.hears("👾 Monster", (ctx) => {
  var _hash = getHash();
  var _set = "?set=set2";
  return ctx.replyWithPhoto(generateURL(_hash, _set));
});

bot.hears("👽 Alien", (ctx) => {
  var _hash = getHash();
  var _set = "?set=set3";
  return ctx.replyWithPhoto(generateURL(_hash, _set));
});

bot.hears("🐱 Cat", (ctx) => {
  var _hash = getHash();
  var _set = "?set=set4";
  return ctx.replyWithPhoto(generateURL(_hash, _set));
});

bot.hears("📖 About", (ctx) => {
  ctx.i18n.locale(ctx.from.language_code != undefined ? ctx.from.language_code : "en"); //(dataService.getLanguageCode(ctx.from.id));
  var msg = ctx.i18n.t("about");
  return ctx.reply(msg);
});

bot.hears("📞 Feedback", (ctx) => {
  var msg = ctx.i18n.t("sendfeedback");
  return ctx.reply(msg);
});

bot.on("message", (ctx) => {
  console.log("Sending Feedback message ", ctx.message);

  ctx.telegram.sendMessage(config.adminChatId, ctx.message.text.concat(" - id: " + ctx.from.id));

  var msg = ctx.i18n.t("feedback");
  return ctx.reply(msg);
});

bot.catch((e) => {
  console.log("Unhandled Bot Error! ${e.message}");
});

/**
 *
 * FUNCTION
 *
 **/

function getHash() {
  return chance.hash();
}

function generateURL(hash, setUrl) {
  return site.concat(hash).concat(setUrl);
}

// --------------------- AWS Lambda handler function ---------------------------------------------------------------- //
// https://github.com/telegraf/telegraf/issues/129
exports.handler = (event, context, callback) => {
  bot.handleUpdate(JSON.parse(event.body)); // make Telegraf process that data
  return callback(null, { statusCode: 200, body: JSON.stringify({ message: "OK" }) });
};
