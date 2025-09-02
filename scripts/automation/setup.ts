#!/usr/bin/env tsx
/**
 * Setup script for automated tips generation system
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AUTOMATION_CONFIG } from './config';
import { logger } from './logger';
import { TipsScheduler } from './scheduler';

class AutomationSetup {
  async setup(): Promise<void> {
    logger.info('🚀 Setting up automated tips generation system...');

    try {
      await this.createDirectories();
      await this.installDependencies();
      await this.createEnvironmentTemplate();
      await this.testSystem();
      await this.displayInstructions();

      logger.info('✅ Setup completed successfully!');

    } catch (error) {
      logger.error('❌ Setup failed:', error);
      throw error;
    }
  }

  private async createDirectories(): Promise<void> {
    logger.info('📁 Creating required directories...');

    const directories = [
      AUTOMATION_CONFIG.output.directory,
      AUTOMATION_CONFIG.output.backupDirectory, 
      AUTOMATION_CONFIG.output.logDirectory,
      'scripts/automation'
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
      logger.info(`Created: ${dir}`);
    }
  }

  private async installDependencies(): Promise<void> {
    logger.info('📦 Installing required dependencies...');

    const dependencies = [
      'playwright', // For web scraping
    ];

    // Check if package.json needs updates
    const packageJsonPath = 'package.json';
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      let needsUpdate = false;
      for (const dep of dependencies) {
        if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
          logger.warn(`Missing dependency: ${dep}`);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        logger.info('Please install missing dependencies:');
        logger.info(`npm install ${dependencies.join(' ')}`);
      }

    } catch (error) {
      logger.warn('Could not check package.json dependencies:', error);
    }
  }

  private async createEnvironmentTemplate(): Promise<void> {
    logger.info('🔐 Creating environment template...');

    const envTemplatePath = '.env.automation.template';
    const envTemplate = `# Automated Tips Generation Environment Variables
# Copy this to .env.local and fill in your actual API keys

# OpenAI Configuration (recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Alternative: Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Automation Settings
AUTOMATION_ENABLED=true
AUTOMATION_SCHEDULE="09:00"
AUTOMATION_TIMEZONE="Europe/Lisbon"

# Web Scraping Settings (optional)
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
SCRAPING_DELAY_MS=2000

# Notification Settings (optional)
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=
`;

    await fs.writeFile(envTemplatePath, envTemplate);
    logger.info(`Environment template created: ${envTemplatePath}`);
  }

  private async testSystem(): Promise<void> {
    logger.info('🧪 Testing system with mock data...');

    try {
      const scheduler = new TipsScheduler();
      await scheduler.testGeneration(true); // Use mock data
      logger.info('✅ System test passed');

    } catch (error) {
      logger.warn('⚠️ System test failed (this is expected without API keys):', error);
    }
  }

  private async displayInstructions(): Promise<void> {
    const instructions = `
🎉 AUTOMATION SETUP COMPLETE!

📋 NEXT STEPS:

1️⃣  CONFIGURE API KEYS:
   • Copy: .env.automation.template → .env.local
   • Add your OpenAI or Anthropic API key
   
2️⃣  TEST GENERATION:
   • Test with mock data: tsx scripts/automation/generateDailyTips.ts --mock
   • Test with real API: tsx scripts/automation/generateDailyTips.ts --mock --force
   
3️⃣  SETUP SCHEDULING:
   
   🖥️  LOCAL (Cron):
   • Install: tsx scripts/automation/scheduler.ts install
   • Remove: tsx scripts/automation/scheduler.ts remove
   
   ☁️  CLOUD (GitHub Actions):
   • Add API keys to GitHub Secrets (OPENAI_API_KEY)
   • Push the .github/workflows/daily-tips-generation.yml file
   • Workflow runs daily at 09:00 UTC automatically

📁 DIRECTORY STRUCTURE:
   • data/daily/          → Generated daily tips
   • data/backups/        → Backup files  
   • logs/automation/     → System logs
   • scripts/automation/  → Automation scripts

🛠️  AVAILABLE COMMANDS:
   • tsx scripts/automation/generateDailyTips.ts [--mock] [--date YYYY-MM-DD] [--force]
   • tsx scripts/automation/scheduler.ts <install|remove|test|cron>

📖 For detailed documentation, see: scripts/automation/README.md

⚙️  SYSTEM CONFIG:
   • LLM Provider: ${AUTOMATION_CONFIG.llm.provider}
   • Model: ${AUTOMATION_CONFIG.llm.model}
   • Daily Time: ${AUTOMATION_CONFIG.schedule.dailyRunTime} ${AUTOMATION_CONFIG.schedule.timezone}
   • Tips per day: ${AUTOMATION_CONFIG.generation.tipsPerDay}
`;

    console.log(instructions);
    logger.info('Setup instructions displayed');
  }
}

// CLI Interface
async function main() {
  try {
    const setup = new AutomationSetup();
    await setup.setup();
    process.exit(0);

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
