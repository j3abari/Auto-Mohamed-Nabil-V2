const fs = require('fs');
const js = fs.readFileSync('D:/Performax 1 Workspace/02 Websites and Portals/Client Showrooms/Auto Mohamed Nabil V2/backend/public/assets/index-J9TuHuEm.js', 'utf8');

// Find jsdom in FFL
let JSDOM;
try {
  JSDOM = require('D:/Performax 1 Workspace/02 Websites and Portals/Client Showrooms/Fitness For Life/node_modules/jsdom').JSDOM;
} catch (e) {
  console.log('jsdom not found, trying basic global mock');
}

if (JSDOM) {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    runScripts: 'dangerously',
    url: 'http://localhost:3000'
  });
  dom.window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
  dom.window.scrollTo = () => {};

  try {
    const scriptEl = dom.window.document.createElement('script');
    scriptEl.textContent = js;
    dom.window.document.body.appendChild(scriptEl);

    setTimeout(() => {
      const rootHtml = dom.window.document.getElementById('root').innerHTML;
      console.log('Root HTML length:', rootHtml.length);
      if (rootHtml.length > 0) {
        console.log('SUCCESS! React rendered:', rootHtml.slice(0, 200));
      } else {
        console.log('Root is empty');
      }
      process.exit(0);
    }, 500);
  } catch (err) {
    console.error('Render error:', err);
    process.exit(1);
  }
}
