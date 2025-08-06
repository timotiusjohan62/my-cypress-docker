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
          const evidenceDir = path.join(process.cwd(), 'cypress', 'evidence');
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
          const evidenceDir = path.join(process.cwd(), 'cypress', 'evidence');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const reportPath = path.join(evidenceDir, `test-evidence-report-${timestamp}.json`);
          
          fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
          console.log(`📊 Evidence report generated: test-evidence-report-${timestamp}.json`);
          return null;
        }
      });
    },
    baseUrl: 'http://backend:4000',
    // Evidence recording configuration - Custom JSON logging only
    video: false,
    screenshotOnRunFailure: false,
    trashAssetsBeforeRuns: true,
    viewportWidth: 1280,
    viewportHeight: 720
  },
});
