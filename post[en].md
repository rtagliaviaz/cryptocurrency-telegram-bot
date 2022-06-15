In this post we will learn how to scrape a website using [cheerio](https://cheerio.js.org/), and then create an api with the scraped data with `node.js` that late you can use with a `frontend`.

The website that we will be using for this example is [pricecharting](https://www.pricecharting.com) 

[You can contact me by telegram if you need to hire a Full Stack developer.](https://t.me/rtagliajs)

[You can also contact me by discord.](Appu#9136)

[You can clone the repo if you want.](https://github.com/rtagliaviaz/node-cheerio-tut)

**This example is only for learning purposes**


## Creating our Project
1. open your terminal and type following
2. mkdir node-cheerio-tut
3. cd node-cheerio-tut
4. npm init --y
5. code .

## Dependencies
- axios
- cheerio
- express
- nodemon

To install dependencies go to your project folder open a terminal and type the following:

```console
npm i axios cheerio express mongoose
```

And for dev dependencies type

```console
npm i -D nodemon
```

## Project file structure:

node-cheerio-tut/
├── node_modules/
├── public/
├── src/
│   ├── routes/
│   ├── database.js
│   └── index.js
└── package.json

 ## Table Of Contents

1. [Setup the project](#Setup-the-project)
2. [Using Cheerio to scrape data](#using-cheerio-to-scrape-data)
3. [Sending the response](#sending-response)
4. [Organizing our code](#Organizing-our-code)
5. [Conclusion](#Conclusion)

---

First go to your `package.json` and add this line.

```json
  "scripts": {
    "start": "node ./src index.js",
    "dev": "nodemon ./src index.js"
  },
```

Let's code

## 1. Setup the project <a name="Setup-the-project"></a>

lets go to **index.js** inside the **src** folder and set up our basic server with express.

```js
const expres = require('express')

const app = express()

//server
app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

now let's run this command `npm run dev` and we should get this message:

```console
listening on port 3000
```

Now in our **index.js** lets import **axios** and **cheerio**, then i''ll explain the code below.

1. we're going to add a const url with the url value, in this case `https://www.pricecharting.com/search-products?q=`. (when you do a search in this web, you will be redirected to a new page, with a new route and a parameter with the value of the name you searched for.)

![main site](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/httt71r2gwldw6xbw688.png)

![searchbar](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hudguvcebhzzred94xa5.png)

So we are going to use that url, also the website has two types of search, one by price and another by market, if we don''t specify the type in the url it will set market type by default. I leave it like this because in market returns the cover of the game and the system (we will use them later)

2. We will add this middlware `app.use(express.json())` because we don''t want to get `undefined` when we do the post request.

3. We will create a route with the post method to send a body to our server, (i'm going to use the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) vscode extension to test the api, but you can use postman or whatever you want) 

`test.http`
```json
POST http://localhost:3000
Content-Type: application/json

{
  "game": "final fantasy"
}
```

```console
final fantasy
```

As you can see we are getting the response, in this case i named the property game.

```js
const axios = require("axios");
const cheerio = require("cheerio");
const express = require('express')

//initializations
const app = express()

const url = "https://www.pricecharting.com/search-products?q="

//middlwares
app.use(express.json())

app.post('/', async (req, res) => {
  // console.log(req.body.game)
  const game = req.body.game.trim().replace(/\s+/g, '+')
})

//server
app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

4. Now we are going to create a constant named game that will store the value from `req.body.game` the we will use some methods to get the result like this `final+fantasy`.

- First we're going to use `trim()` to remove the whitespace characters from the start and end of the string.

- Then we will replace the whitespaces between the words with a `+` symbol with `replace(/\s+/g, '+')` .

## 2. Using Cheerio to scrape data <a name="using-cheerio-to-scrape-data"></a>

Finally we're going to use **cheerio**.

1. Now that we have our game constant we're going to use **axios** to make a request to our url + the game title.

2. We are going to use a `try catch block`, if we get a response then we will store it in a constant named `html` then we will use **cherrio** to load that data.

3. We are going to create a constant named games that will store this value `$(".offer", html)`.

- If you open your developer tools and go to the elements tab you will that **.offer** class belongs to a table like the image below.

![developer tools](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/63kzq6g0s602vqefrhgh.png)

- If you take a look to this image you will easily understand whats going on in the code.

4. now we are going to loop trough that table to get each title, and we cand do that using `.find(".product_name")`, then `.find(".a")`, then we want the `text()` from the a tag.

```js
.
.
.

app.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const response = await axios.get(url + game)
      const html = response.data;
      const $ = cheerio.load(html)
      
      const games =  $(".offer", html)

      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        console.log(gameTitle)
      })

 
    } catch (error) {
      console.log(error)
    }
})

.
.
.
```

- If you try this with `console.log(title)` you will get a message like this.

```console
Final Fantasy VII
Final Fantasy III
Final Fantasy
Final Fantasy VIII
Final Fantasy II
.
.
.
```

- Now let's add more fields, for this example i want an **id**, a **cover image** and a **system**.

```js
.
.
.

app.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const response = await axios.get(url + game)
      const html = response.data;
      const $ = cheerio.load(html)

      const games =  $(".offer", html)

      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        const id = $(el).attr('id').slice(8);

        //cover image
        const coverImage = $(el).find(".photo").find("img").attr("src");

        const system = $(el)
        .find("br")
        .get(0)
        .nextSibling.nodeValue.replace(/\n/g, "")
        .trim();
      })

 
    } catch (error) {
      console.log(error)
    }
})

.
.
.
```

## 3. Sending the response <a name="sending-response"></a>

Let's store this data in an array, so in order to do this, lets create an array named videoGames

```js
.
.
.

const url = "https://www.pricecharting.com/search-products?q=";
let videoGames = []


app.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const response = await axios.get(url + game)
      const html = response.data;
      const $ = cheerio.load(html)

      const games =  $(".offer", html)

      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        const id = $(el).attr('id').slice(8);

        //cover image
        const coverImage = $(el).find(".photo").find("img").attr("src");

        const gameSystem = $(el)
        .find("br")
        .get(0)
        .nextSibling.nodeValue.replace(/\n/g, "")
        .trim();
      })

      videoGames.push({
        id,
        gameTitle,
        coverImage,
        gameSystem
      })

      res.json(videoGames)

    } catch (error) {
      console.log(error)
    }
    
})
.
.
.
```

if you try the route again you will get a result similar to the image below

![response](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zu1xr6a63otvni9kneot.png)

Optionally i made an array to get only certain systems because I didn't want to receive the same title with PAL and NTSC system, so I left the default system (NTSC).


```js
.
.
.

const consoles = [
  "Nintendo DS",
  "Nintendo 64",
  "Nintendo NES",
  "Nintendo Switch",
  "Super Nintendo",
  "Gamecube",
  "Wii",
  "Wii U",
  "Switch",
  "GameBoy",
  "GameBoy Color",
  "GameBoy Advance",
  "Nintendo 3DS",
  "Playstation",
  "Playstation 2",
  "Playstation 3",
  "Playstation 4",
  "Playstation 5",
  "PSP",
  "Playstation Vita",
  "PC Games",
]

.
.
.

app.post('/', async (req, res) => {
  .
  .
  .

  if (!system.includes(gameSystem)) return;
  videoGames.push({
    id,
    gameTitle,
    coverImage,
    gameSystem,
  });
  .
  .
  .
})
.
.
.
```

## 4. Organizing our code <a name="Organizing-our-code"></a>

Let's organize it a little bit, let's create a folder in src named **routes** then create a file named **index.js**.

Copy and paste the code below.

```js
const {Router} = require('express')
const cheerio = require("cheerio");
const axios = require("axios");
const router = Router()

const url = "https://www.pricecharting.com/search-products?q="
let videoGames = []

const system = [
  "Nintendo DS",
  "Nintendo 64",
  "Nintendo NES",
  "Nintendo Switch",
  "Super Nintendo",
  "Gamecube",
  "Wii",
  "Wii U",
  "Switch",
  "GameBoy",
  "GameBoy Color",
  "GameBoy Advance",
  "Nintendo 3DS",
  "Playstation",
  "Playstation 2",
  "Playstation 3",
  "Playstation 4",
  "Playstation 5",
  "PSP",
  "Playstation Vita",
  "PC Games",
]


router.post('/', async (req, res) => {
  const game = req.body.game.trim().replace(/\s+/g, '+')
  await axios(url + game)
    try {
      const response = await axios.get(url + game)
      const html = response.data;
      const $ = cheerio.load(html)
      const games =  $(".offer", html)
      
      games.each((i, el) => {
        const gameTitle = $(el)
        .find(".product_name") 
        .find("a")
        .text()
        .replace(/\s+/g, ' ')
        .trim()

        const id = $(el).attr('id').slice(8);
        const coverImage = $(el).find(".photo").find("img").attr("src");

        const gameSystem = $(el)
          .find("br")
          .get(0)
          .nextSibling.nodeValue.replace(/\n/g, "")
          .trim();
        
        if (!system.includes(gameSystem)) return;
        videoGames.push({
          id,
          gameTitle,
          coverImage,
          gameSystem,
          backlog: false
        });
        
      })

   
      res.json(videoGames)
 
    } catch (error) {
      console.log(error)
    }

    
})

module.exports = router
```

Now let's go back to our main file in src **index.js** and leave the code like this.

```js
const express = require('express')

//routes
const main = require('./routes/index')


const app = express()


//middlwares
app.use(express.json())

//routes
app.use(main)


app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

If you try it you will see that it still works without any troubles.


## 5. Conclusion <a name="Conclusion"></a>

We learned how to make a simple scraper with cheerio.

I really hope you have been able to follow the post without any trouble, otherwise i apologize, please leave me your doubts or comments.

I plan to make a next post extending this code, adding more routes, mongodb, and a front end.

[You can contact me by telegram if you need to hire a Full Stack developer.](https://t.me/rtagliajs)

[You can also contact me by discord.](Appu#9136)

[You can clone the repo if you want.](https://github.com/rtagliaviaz/node-cheerio-tut)

Thanks for your time.