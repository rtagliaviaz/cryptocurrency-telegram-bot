# cryptocurrency-telegram-bot
a cryptocurrency telegram bot made with Node, Telegraf and coingecko api

in this post we will learn how to create a cryptocurrency Telegram bot to obtain the values of the cryptocurrency we want to know using [Coingecko API](https://www.coingecko.com/en/api)

To make this post I was inspired by this other one [How to make a cryptocurrency Telegram bot with Rust and Teloxide](https://dev.to/steadylearner/how-to-make-a-telegram-bot-with-rust-teloxide-m60) be sure to check it out, he creates very good content related to blockchain.

[You can contact me by telegram if you need to hire a Full Stack developer or if you want to translate your posts from english to spanish.](https://t.me/rtagliajs)

[You can also contact me by discord.](Appu#9136)

[You can clone the repo if you want.](https://github.com/rtagliaviaz/cryptocurrency-telegram-bot/tree/main)

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) installed
- you will need a Telegram account


## Creating Our Project

1. open your terminal and type the following
2. mkdir node-telegram-tut
3. cd node-telegram-tut
4. npm init --y
5. code .


## Dependencies

- axios
- dotenv
- telegraf

To install dependencies go to your project folder open a terminal and type the following

```console
npm i axios dotenv telegraf
```

Now go to your package.json and add this

```console
  "scripts": {
    "start": "node ./src index.js"
  },
```

## Project File Structure

node-telegram-tut/
├── node_modules/
├── src/
│   └── index.js
├── .env
└── package.json


## Table of Contents

1. [Setup the Telegram bot Token with BotFather](#telegram-bot-token)
2. [Coding our Bot](#coding-our-telegram-bot)
3. [Creating our commands](#creating-commands)
4. [Deploying it to Heroku](#deploy-to-heroku)
5. [Conclusion](#conclusion)

---

## 1. Setup the Telegram bot Token with BotFather <a name="telegram-bot-token"></a>

To start coding our bot we first need to search for BotFather bot, this one.


![BotFather Bot](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a4mt7uq9lgxvjj9yruqc.png)

After adding it we will see a list of commands, let's click on `/newbot` you will be prompted to enter the name you wish to give to your bot. I named mine **teletutbot**, but you are free to call yours whatever you want, as long as the name is available.


![BotFather Commands](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/po211lik7x3z0i0qyfm5.png)

After this you will receive a message with your **token**, now lets set a description for our bot with `/setdescription`, this way when you add the bot, you will see a message (like a welcome message) describing the bot's function.

Finally you can add a picture if you want with `setuserpic`, i used [this one](https://www.pexels.com/photo/wood-man-street-industry-9026734/)

There are more commands to edit your bot, you can try them later

## 2. Coding our Bot <a name="coding-our-telegram-bot"></a>

Let's start coding our bot, first let's create a **.env** file in our project root folder, lets add a **BOT_TOKEN** var and assign it the token given to us by botfather when we created our bot.

```
BOT_TOKEN = paste-the-token-here
```

Now in our **index.js**, import telegraf, axios and dotenv

```js
const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();
```

Then create a bot object from Telegraf Class and pass the BOT_TOKEN

```js
const bot = new Telegraf(process.env.BOT_TOKEN);
```

Finally lets create our first bot command that will be **/start** and then use the `launch()` method.

```js
bot.command("start", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Welcome!!",
    { parse_mode: "html" }
  );
});

bot.launch()
```

Our code so far should look like this

```js
const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Welcome!!",
    { parse_mode: "html" }
  );
});

bot.launch()
```

## 3. Creating our commands <a name="creating-commands"></a>

We don't want a bot just to say Welcome, so we need to create more commands, for this example i'll craete a `/help` command to get all the available commands, a `/currencies` command to get all the supported currencies and a `/crypto_price` to get the price of the selected cryptocurrency in the desired currency

- So let's start creating our **/help** command.

Let's call our bot object and use the *command* method, as i say before we're going to name this command **help**, we are going to use the **sendMessage** method from [telegram api](https://core.telegram.org/bots/api) and we need to pass some parameters, there are two required parameters `chat_id` (extracted from the context) `text` and i will pass an optional parameter `parse_mode` to format the text a little bit.

```js
bot.command("help", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "<b>Command list: </b>\n\n" +
    "<b><i>/currencies</i></b> to get all the suppported currencies. \n\n" +
    '<b><i>/crypto_price</i></b> to get the value of the cryptocurrency in another currency, to use it first type the "currency" and then the "cryptocurrency" e.g. (/crypto_price usd bitcoin), can also add more currencies and cryptos separating them with commas but without spaces e.g. (/crypto_price usd,eur,btc bitcoin,ethereum) \n\n' +
    "",
    { parse_mode: "html" }
  );
});
```

Now if you start your bot, and type */help* you will get this as result.


![Bot commands](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5jwiehc0nwhm66l18hop.png)

- Now let's create our **/currencies** command

Let's go back to our code and create a new command, we will name it **currencies**, this will send a get request to the [coingecko api](https://www.coingecko.com/en/api/documentation) and retrieve the supported currencies list.

I stored the `res.data` in a *let* that i named *currencies*, also wanted to send the currencies in bold, so i used a map method and returned each currency with `*${currency}*`, there are other ways to do it.

After that we are going to use again the sendMessage method, and this time wanted to show you that there are a Markdown parse mode. If you want to know more about it, please read the [formatting options](https://core.telegram.org/bots/api#formatting-options) in the documentation.

```js
bot.command("currencies", (ctx) => {
  axios.get("https://api.coingecko.com/api/v3/simple/supported_vs_currencies")
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
          {parse_mode: "Markdown"}
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
});
```

If you try your */currencies* command you should get something similar to this


![Currencies](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fohelv6cyrs30q46pmis.png)

- Finally we will create the **/crypto_price** command

As we did before we will name our new command **crypto_price**

For this one as a user we will send a message like this `/crypto_price usd,eur bitcoin`, so we will split the string by spaces with `.split(" ")`. This should split the string into three parts, the first part will be the `/crypto_price`, second part `usd,eur` and third part `bitcoin`, so we will create two variables **currencies** and **cryptoCurrencies**, then we will assign the values respectively.

We need to create a conditional in case the user enters the data incorrectly, or in case the user does not send any data in the command. if this is the case we need to send the user a message, in this case i want him to remember how to use the command so i added an example.

Now we are going to make the GET request to the API, we also going to check if the object from the response is empty, if its empty its because there was a spelling error, or some of the data was misplaced. If this is the case we will answer again telling the use how to use the command

We are getting the data like this 

```console
data: {
    bitcoin: { usd: 21816, eur: 20872 },
    ethereum: { usd: 1177.46, eur: 1126.54 }
  }
```

So i chose to use a *for loop* inside another *for loop* to manipulate the data, then used again the `parse_mode` to format the text



```js
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
```

If you try **/crypto_price** command, you should get something like this


![crypto price 1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/koavmo73mvcm72yseh23.png)


![crypto price 2](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/djti58jgh9da4uj1zn4u.png)


## 5. Deploying it to Heroku <a name="deploy-to-heroku"></a>

- we need to create a server

In case you want to deploy this app, we need to create a server, so let's install **express** with this command `npm i express` and create a server in our *index.js*

remember to create a **port** constant and assign this `process.env.PORT` to it (heroku will give us a port value)


```js
const express = require('express')

//initiaalization
const app = express()

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})
```

- create an account

This is an easy step, just go to [Heroku](https://www.heroku.com/home) and click on **sign up**


![Heroku sign up](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bj79mpjg6ed93vnk7sir.png)

Fill the required fields and verify your account, then login and go to your apps and create a new one


![creating our app](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xw5v4bdbofwba0vgln74.png)

Choose a name for your new app and continue to the next part

-  install Heroku CLI

We are not going to ad a pipeline, so we can skip that part. Now for the deployment method i will use [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

![Heroku cli](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/df9woakszfyxgs2dt0ek.png)

I'll use `npm install -g heroku` to install it, then we need to open a terminal and type `heroku cli`, and you will see this message


![CLI message](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/p6qj5h35pvk885e2uhma.png)

Now let's login by clicking the button in our browser

![heroku Login button](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/spzsaqpritzqb9z2vidj.png)

- deploy

Now lets follow the steps below, **replace master by main** or won't let you `git push`

![deployment main -> master](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ruq0nghsjhg2zklkt2k6.png)


## 4. Conclusion <a name="conclusion"></a>

We learned how to make a cryptocurrency telegram bot using **telegraf** and node.js.

I really hope you have been able to follow the post without any trouble, otherwise i apologize, please leave me your doubts or comments.

[You can contact me by telegram if you need to hire a Full Stack developer.](https://t.me/rtagliajs)

[You can also contact me by discord.](Appu#9136)

[You can clone the repo if you want.](https://github.com/rtagliaviaz/cryptocurrency-telegram-bot/tree/main)

Thanks for your time.
