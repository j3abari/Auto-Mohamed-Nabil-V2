const http = require('http');
const { spawn } = require('child_process');

async function testPage() {
  // Launch Chrome with remote debugging
  const chromeProcess = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'https://auto-mohamed-nabil-v2.onrender.com/'
  ]);

  // Wait 3 seconds for Chrome to launch
  await new Promise(r => setTimeout(r, 3000));

  // Get debug target info
  try {
    const listRes = await fetch('http://localhost:9222/json');
    const tabs = await listRes.json();
    console.log('Open tabs:', tabs.map(t => ({ title: t.title, url: t.url, ws: t.webSocketDebuggerUrl })));

    const tab = tabs.find(t => t.url.includes('auto-mohamed-nabil-v2')) || tabs[0];
    if (tab && tab.webSocketDebuggerUrl) {
      const WebSocket = require('D:/Performax 1 Workspace/02 Websites and Portals/Client Showrooms/Fitness For Life/node_modules/ws');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);

      ws.on('open', () => {
        console.log('Connected to Chrome DevTools WebSocket!');
        ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
        ws.send(JSON.stringify({ id: 4, method: 'Log.enable' }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails);
        }
        if (msg.method === 'Log.entryAdded') {
          console.log('[BROWSER LOG]', msg.params.entry);
        }
        if (msg.method === 'Network.loadingFailed') {
          console.error('[NETWORK FAILED]', msg.params.requestId, msg.params.errorText, msg.params.type);
        }
      });

      await new Promise(r => setTimeout(r, 6000));
      ws.close();
    }
  } catch (err) {
    console.error('Debug error:', err.message);
  } finally {
    chromeProcess.kill();
    process.exit(0);
  }
}

testPage();
