import { test, expect } from '@playwright/test';

test('journey validates domains, steps, inspects devices, and completes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByRole('heading',{name:'From a URL to your screen.'})).toBeVisible();
 await page.screenshot({path:'/tmp/packet-atlas-desktop.png',fullPage:true,animations:'disabled'});
 await page.getByLabel('Website domain').fill('not-a-domain');await page.getByRole('button',{name:'Start journey',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();
 await page.getByLabel('Website domain').fill('https://example.com/docs?q=network');await page.getByRole('button',{name:'Start journey',exact:true}).click();await page.getByLabel('Pause journey',{exact:true}).click();
 await page.getByLabel('Next step',{exact:true}).click();await expect(page.getByRole('heading',{name:'Ask the distributed address book'})).toBeVisible();
 await page.getByRole('tab',{name:'Packet',exact:true}).click();await expect(page.getByText('192.0.2.53',{exact:true})).toBeVisible();
 await page.getByLabel('Inspect Home router',{exact:true}).click();await expect(page.getByText('51514 → 62001',{exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Packet',exact:true}).click();await expect(page.getByText('198.51.100.24',{exact:true})).toBeVisible();
 await page.getByLabel('Journey stage').fill('11');await expect(page.getByRole('link',{name:'Open actual website'})).toHaveAttribute('href','https://example.com/docs?q=network');
 await expect(page.getByText('1/8',{exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('DNS cache changes the exchange sequence',async({page})=>{
 await page.goto('/#dns');await expect(page.getByText('Exchange 1 of 8')).toBeVisible();
 await page.getByRole('button',{name:'Next exchange'}).click();await expect(page.getByText('Exchange 2 of 8')).toBeVisible();
 await page.getByRole('switch',{name:'Warm browser / OS cache'}).click();await expect(page.getByText('Exchange 1 of 2')).toBeVisible();await expect(page.getByText('CACHE HIT',{exact:true})).toBeVisible();
});

test('TCP handshake, loss recovery, and learning progress',async({page})=>{
 await page.goto('/#tcp');for(let i=0;i<4;i++)await page.getByRole('button',{name:'Advance',exact:true}).click();
 await expect(page.getByText('ESTABLISHED',{exact:true})).toHaveCount(2);
 await page.getByRole('tab',{name:'Flow & congestion'}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'ACK a window'}).click();await page.getByRole('button',{name:'Recover from loss'}).click();await expect(page.getByText('CONGESTION AVOIDANCE · ssthresh 4',{exact:true})).toBeVisible();await page.getByRole('button',{name:'ACK a window'}).click();await expect(page.locator('.window-stats').first()).toContainText('5 segments');
 await page.getByRole('tab',{name:'Reliable delivery'}).click();await page.getByRole('button',{name:'Send segments'}).click();
 await expect(page.getByText('DROPPED',{exact:true})).toHaveCount(1);await page.getByRole('button',{name:'Retransmit missing segment'}).click();await expect(page.getByText('RECEIVED',{exact:true})).toHaveCount(6);
 await page.getByRole('button',{name:'C 2001',exact:true}).click();await expect(page.getByRole('status')).toContainText('Lab completed');
 await page.reload();await expect(page.getByText('1/8',{exact:true})).toBeVisible();
});

test('routing reacts to longest-prefix withdrawal and invalid input',async({page})=>{
 await page.goto('/#routing');await expect(page.locator('tr.winning')).toContainText('203.0.113.0/24');
 await page.getByRole('switch',{name:'Withdraw /24 route'}).click();await expect(page.locator('tr.winning')).toContainText('203.0.0.0/8');
 await page.getByLabel('Destination IPv4 address').fill('999.0.0.1');await expect(page.getByText('Invalid IPv4 address')).toBeVisible();await expect(page.locator('tr.winning')).toHaveCount(0);
 await page.getByRole('tab',{name:'BGP policy'}).click();await page.getByLabel('Customer local preference').fill('100');await expect(page.locator('.bgp-paths>div.selected')).toContainText('Transit path');
 await page.getByRole('tab',{name:'Inside the ISP'}).click();await expect(page.getByText('Total cost 19')).toBeVisible();await page.getByRole('switch',{name:'Fail link A–B'}).click();await expect(page.getByText('Total cost 35')).toBeVisible();
});

test('TLS, VPN, media, and VLAN experiments respond to controls',async({page})=>{
 await page.goto('/#tls');await page.getByRole('switch',{name:'Wrong certificate hostname'}).click();await expect(page.getByText('Navigation blocked',{exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Render the page'}).click();for(let i=0;i<4;i++)await page.getByRole('button',{name:'Next stage'}).click();await expect(page.getByRole('button',{name:'Replay',exact:true})).toBeVisible();
 await page.goto('/#vpn');await page.getByRole('button',{name:'Split tunnel',exact:true}).click();await expect(page.getByText('DIRECT ROUTE',{exact:true})).toBeVisible();await page.getByRole('combobox').selectOption('Private service');await expect(page.getByText('ROUTED THROUGH TUNNEL')).toBeVisible();
 await page.goto('/#physical');await page.getByRole('button',{name:'Single-mode fiber OS2 · LR'}).click();await expect(page.getByText('10GBASE-LR',{exact:true})).toBeVisible();await page.getByLabel('Path distance').fill('1000');await expect(page.getByText('5.000 ms',{exact:true})).toBeVisible();
 await page.goto('/#switching');await page.getByRole('combobox').selectOption('20');await expect(page.getByText('This frame cannot reach Device B.')).toBeVisible();
});

test('field guide filtering, diagnostic scenarios, and keyboard dialog',async({page})=>{
 await page.goto('/#guide');await page.getByLabel('Search field guide').fill('IPv6');await expect(page.locator('.topic-list>button').first()).toContainText('IPv6');
 await page.getByLabel('Search field guide').fill('doesnotexist');await expect(page.getByText('No matching concepts')).toBeVisible();await page.getByRole('button',{name:'Reset filters'}).click();
 await page.getByLabel('Troubleshooting scenario').selectOption('2');await page.getByRole('button',{name:'Run simulated check'}).click();await expect(page.getByText('The transport reached a TLS endpoint.',{exact:false})).toBeVisible();
 await page.keyboard.press('Control+k');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('mobile navigation and all pages stay within viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['journey','dns','tcp','routing','tls','vpn','physical','switching','guide']){
   await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
 }
 await page.goto('/');await page.getByLabel('Open menu',{exact:true}).click();await page.getByRole('button',{name:'TCP & sockets 02'}).click();await expect(page.locator('h1')).toContainText('“connected”');
 await page.screenshot({path:'/tmp/packet-atlas-mobile.png',fullPage:true,animations:'disabled'});
});
