const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Welcome, to get the <i>command list</i> type <b>/help</b>",
    { parse_mode: "html" }
  );
});

bot.command("help", (ctx) => {
  console.log(ctx.chat);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "<b>Command list: </b>\n\n" +
      "<b><i>/currencies</i></b> to get all the suppported currencies. \n\n" +
      '<b><i>/crypto_price</i></b> to get the value of the cryptocurrency in another currency, to use it first type the "currency" and then the "cryptocurrency" e.g. (/crypto_price usd bitcoin), can also add more currencies and cryptos separating them with commas but without spaces e.g. (/crypto_price usd,eur,btc bitcoin,ethereum) \n\n' +
      "",
    { parse_mode: "html" }
  );
});

bot.command("currencies", (ctx) => {
  axios
    .get("https://api.coingecko.com/api/v3/simple/supported_vs_currencies")
    .then((res) => {
      if (res) {
        let currencies = res.data;

        //bold currencies text
        let boldedCurrencies = currencies.map((currency) => {
          return `*${currency}*`;
        });

        //send boldedCurrencies and break line
        bot.telegram.sendMessage(
          ctx.chat.id,
          "Supported Currencies" + "\n" + boldedCurrencies.join("\n"),
          {
            parse_mode: "Markdown",
          }
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

//crypto_price command
bot.command("crypto_price",  (ctx) => {
  let currencies = ctx.message.text.split(" ")[1];
  let cryptoCurrencies = ctx.message.text.split(" ")[2];

  if (cryptoCurrencies === undefined || currencies === undefined) {
    bot.telegram.sendMessage(
      ctx.chat.id,
      "Please enter the currency and the crypto currency you want to convert to, remember to separate them with commas but without spaces e.g. (/crypto_price usd,eur,btc bitcoin,ethereum) .",
    );
    return;
  }

  axios
    .get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoCurrencies}&vs_currencies=${currencies}`
    )
    .then((res) => {
      if (res) {

        //if res is empty
        if (Object.keys(res.data).length === 0) {
          bot.telegram.sendMessage(
            ctx.chat.id,
            "Please enter the currency and the crypto currency you want to convert to, remember to separate them with commas but without spaces e.g. (/crypto_price usd,eur,btc bitcoin,ethereum) .",
          );
          return;
        }

        const response = res.data;

        for (let cryptoCurrency in response) {
          for (let currency in response[cryptoCurrency]) {
            bot.telegram.sendMessage(
              ctx.chat.id,
              `<b>${cryptoCurrency}</b> price in <b>${currency.toUpperCase()}</b> ➡️ <b>${response[cryptoCurrency][currency]}</b>`,
              {parse_mode: "html"}
            );
          }
        }

        return;
      } 
    })
    .catch((err) => {
      console.log(err);
    });
});

bot.launch();
