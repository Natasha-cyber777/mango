const fs = require('fs');
const path = require('path');

const hostname = 'https://mango-bcf17.web.app'; // Replace with your actual website URL

const routes = [
  '/',
  '/login',
  '/signup',
  //'/dashboard',
  //'/budgetingpage',
 // '/report',
 // '/financialpersonalityprofiler',
 // '/studentexpenseplanner',
 // '/homexpenseplanner',
 // '/groupexpensecalculator',
 // '/incomeprofile',
 // '/savingsprofile',
  //'/debtprofile',
 // '/investmentprofile',
  //'/userprofilepage',
  //'/specialplannerpage',
];

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
  <url>
    <loc>${hostname}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>
`
    )
    .join('')}
</urlset>
`;

  fs.writeFileSync(path.resolve(__dirname, 'public', 'sitemap.xml'), sitemap);
  console.log('sitemap.xml generated successfully in the public directory!');
}

generateSitemap();