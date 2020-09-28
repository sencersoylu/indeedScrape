const express = require("express"),
    app = express(),
    puppeteer = require("puppeteer"),
    cheerio = require("cheerio"); // importing libraryies

app.get("/get", async (req, res) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            defaultViewport: null,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }); // runing chrome browser headless

        const page = await browser.newPage(); // creating new page

        await page.setRequestInterception(true); //start listen request

        page.on("request", (request) => {
            if (request.resourceType() === "image") request.abort();
            else request.continue();
        }); // disable download image for speed

        await page.goto(
            `https://www.indeed.co.uk/accounts-payable-jobs-in-United-Kingdom`, {
                waitUntil: "networkidle2",
            }
        ); //goto url

        const html = await page.content(); // get html content after loading
        const $ = await cheerio.load(html); // import html for use jquery

        const list = $("div.jobsearch-SerpJobCard")
            .toArray()
            .map((element) => {
                return {
                    title: $(element).find(".title > a").text().trim(),
                    comapny: $(element).find(".company > a").text().trim(),
                    link: "https://www.indeed.co.uk" +
                        $(element).find(".title > a").attr("href").trim(),
                };
            }); //scraping data from html element

        console.log(list);

        res.json(list);
    } catch (err) {
        console.log(err);
    } finally {
        await browser.close(); // close browser
    }
});

//listen port

var listener = app.listen(process.env.PORT || 4000, function () {
    console.log("Your app is listening on port " + listener.address().port);
});