import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser', fullyParallel:false, workers:1,
 use:{baseURL:'http://localhost:5173',headless:true,viewport:{width:1440,height:1080},launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/opt/google/chrome/chrome',args:['--no-sandbox']}},
 reporter:'list'
});
