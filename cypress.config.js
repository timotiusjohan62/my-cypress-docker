const fs = require('fs');
const path = require('path');
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Custom evidence logging tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        logEvidence(evidence) {
          const evidenceDir = process.env.CYPRESS_EVIDENCE_DIR || path.join(process.cwd(), 'cypress', 'evidence');
          if (!fs.existsSync(evidenceDir)) {
            fs.mkdirSync(evidenceDir, { recursive: true });
          }
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `evidence_${evidence.spec}_${timestamp}.json`;
          const filepath = path.join(evidenceDir, filename);
          
          let existingData = [];
          if (fs.existsSync(filepath)) {
            try {
              existingData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            } catch (e) {
              existingData = [];
            }
          }
          
          existingData.push(evidence);
          fs.writeFileSync(filepath, JSON.stringify(existingData, null, 2));
          console.log(`📝 Evidence logged: ${filename}`);
          return null;
        },
        
        generateEvidenceReport(data) {
          const evidenceDir = process.env.CYPRESS_EVIDENCE_DIR || path.join(process.cwd(), 'cypress', 'evidence');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const reportPath = path.join(evidenceDir, `test-evidence-report-${timestamp}.json`);
          
          fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
          console.log(`📊 Evidence report generated: test-evidence-report-${timestamp}.json`);
          return null;
        }
      });
      
      // Override config with environment variables if they exist
      config.baseUrl = process.env.CYPRESS_BASE_URL || config.baseUrl || 'http://backend:4000';
      config.video = process.env.CYPRESS_VIDEO === 'true' || false;
      config.screenshotOnRunFailure = process.env.CYPRESS_SCREENSHOTS_ON_FAILURE === 'true' || false;
      config.trashAssetsBeforeRuns = process.env.CYPRESS_TRASH_ASSETS_BEFORE_RUNS !== 'false';
      config.viewportWidth = parseInt(process.env.CYPRESS_VIEWPORT_WIDTH) || 1280;
      config.viewportHeight = parseInt(process.env.CYPRESS_VIEWPORT_HEIGHT) || 720;
      
      // Set spec pattern if provided
      if (process.env.CYPRESS_SPEC_PATTERN) {
        config.specPattern = process.env.CYPRESS_SPEC_PATTERN;
      }
      
      // Set timeouts
      if (process.env.TEST_TIMEOUT) {
        config.defaultCommandTimeout = parseInt(process.env.TEST_TIMEOUT) || 60000;
      }
      
      return config;
    },
    
    // Default configuration (can be overridden by environment variables)
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://backend:4000',
    video: process.env.CYPRESS_VIDEO === 'true' || false,
    screenshotOnRunFailure: process.env.CYPRESS_SCREENSHOTS_ON_FAILURE === 'true' || false,
    trashAssetsBeforeRuns: process.env.CYPRESS_TRASH_ASSETS_BEFORE_RUNS !== 'false',
    viewportWidth: parseInt(process.env.CYPRESS_VIEWPORT_WIDTH) || 1280,
    viewportHeight: parseInt(process.env.CYPRESS_VIEWPORT_HEIGHT) || 720,
    defaultCommandTimeout: parseInt(process.env.TEST_TIMEOUT) || 60000,
    
    // Environment-specific settings
    env: {
      IS_TESTING: process.env.IS_TESTING || 'false',
      DEBUG: process.env.DEBUG || 'false',
      LOG_LEVEL: process.env.LOG_LEVEL || 'info'
    }
  },
});
