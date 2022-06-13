const puppeteer = require('puppeteer');
const readline = require('readline')

const getInput = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

const defaultHost = 'https://1337x.to/';

const defaultCompare = async ({ host = defaultHost, page, query }) => {
  await page.goto(host, { waitUntil: 'networkidle2' })
  await page.type('#search-index-form > input', query)
  await page.click('#search-index-form > button')
  await page.waitForSelector('.box-info-detail.inner-table tr:nth-of-type(1) td.name a:not(.icon)')
  await page.click('.box-info-detail.inner-table tr:nth-of-type(1) td.name a:not(.icon)')
  await page.waitForSelector('a[href*="magnet"]')
  const magnetLink = await page.evaluate(() => Array.from(
    document.querySelectorAll('a[href*="magnet"]'),
    a => a.getAttribute('href')
  )[0]);
  return magnetLink;
}

const getMagenetLink = async ({ compare = defaultCompare, ...config}) => await compare(config);

(async () => {
  let episode = 1;
  const series = await getInput('Name of TV Show: ');
  const season = await getInput('Season No: ');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let magnets = [];
  // Look up metadata on series to get number of loops

  try {
    while(true) {
      const query = `${series} S${season < 10 ? '0' : ''}${season}E${episode < 10 ? '0' : ''}${episode}`;
      const magnetLink = await getMagenetLink({ query, page });
      console.log(magnetLink);
      magnets.push(magnetLink)
      clipboardy.writeSync(magnets.join('\n'));
      episode += 1;
    }
  } catch(error) {
    console.error(error);
  }

  

  await browser.close();
})(); 