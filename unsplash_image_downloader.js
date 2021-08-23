const puppeteer = require('puppeteer')
const path = require('path')

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//scorll the page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                window.scrollBy(0, distance);
                var scrollHeight = document.body.scrollHeight;
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function main(keyword, number) {
    //the time cost of getting each of images about 261 ms
    let sleepTime = number * 261
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto(`https://unsplash.com/s/photos/${keyword}?orientation=landscape`)

    //build a folder to store images
    const downloadPath = path.resolve('./' + keyword);

    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
    });

    autoScroll(page)

    let buttons = ''
    let img_url = ','

    //get image download link every 5 seconds
    let intervalID = setInterval(async () => {
        buttons = await page.$$eval('a[data-test="non-sponsored-photo-download-button"]', (items) => {
            return items.map((a) => a.getAttribute("href"))
        })
        img_url += buttons + ','
    }, 5000)

    //wait to get download link
    await sleep(sleepTime)
    clearInterval(intervalID)

    img_url_list = img_url.split(',')
    console.log(img_url_list, img_url_list.length)
    for (url of img_url_list) {
        console.log(url)
        try {
            await page.goto(url, { waitUntil: "networkidle2" })
        } catch (e) {
        }

    }
}
main('online-education',100)

module.exports = main