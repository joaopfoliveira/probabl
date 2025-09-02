/**
 * Scheduler for automated daily tips generation
 * Supports both local cron and cloud scheduling
 */

import { spawn } from 'child_process';
import { AUTOMATION_CONFIG } from './config';
import { logger } from './logger';

export interface ScheduleConfig {
  timezone: string;
  time: string; // HH:MM format
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  enabled: boolean;
}

export class TipsScheduler {
  private scheduleConfig: ScheduleConfig;

  constructor(config?: Partial<ScheduleConfig>) {
    this.scheduleConfig = {
      timezone: AUTOMATION_CONFIG.schedule.timezone,
      time: AUTOMATION_CONFIG.schedule.dailyRunTime,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // Monday-Sunday (skip Sunday = 0)
      enabled: true,
      ...config
    };
  }

  /**
   * Generate crontab entry for the automation
   */
  generateCronExpression(): string {
    const [hours, minutes] = this.scheduleConfig.time.split(':').map(Number);
    const daysOfWeek = this.scheduleConfig.daysOfWeek?.join(',') || '*';
    
    // Cron format: minute hour day month day-of-week
    return `${minutes} ${hours} * * ${daysOfWeek}`;
  }

  /**
   * Generate full cron command
   */
  generateCronCommand(): string {
    const projectRoot = process.cwd();
    const scriptPath = `${projectRoot}/scripts/automation/generateDailyTips.ts`;
    const logPath = `${projectRoot}/${AUTOMATION_CONFIG.output.logDirectory}/cron.log`;
    
    return `cd ${projectRoot} && npx tsx ${scriptPath} >> ${logPath} 2>&1`;
  }

  /**
   * Install cron job (Linux/macOS)
   */
  async installCronJob(): Promise<void> {
    if (process.platform === 'win32') {
      throw new Error('Cron installation not supported on Windows. Use Task Scheduler or cloud scheduling.');
    }

    const cronExpression = this.generateCronExpression();
    const cronCommand = this.generateCronCommand();
    const fullCronEntry = `${cronExpression} ${cronCommand}`;

    logger.info('Installing cron job:', fullCronEntry);

    try {
      // Get current crontab
      const currentCrontab = await this.getCurrentCrontab();
      
      // Remove any existing entry for this project
      const filteredCrontab = currentCrontab
        .split('\n')
        .filter(line => !line.includes('generateDailyTips.ts'))
        .filter(line => line.trim() !== '')
        .join('\n');

      // Add new entry
      const newCrontab = filteredCrontab + '\n' + fullCronEntry + '\n';

      // Install new crontab
      await this.setCrontab(newCrontab);
      
      logger.info('Cron job installed successfully');
      logger.info(`Next run: ${this.getNextRunTime()}`);

    } catch (error) {
      logger.error('Failed to install cron job:', error);
      throw error;
    }
  }

  /**
   * Remove cron job
   */
  async removeCronJob(): Promise<void> {
    if (process.platform === 'win32') {
      logger.warn('Manual removal required on Windows');
      return;
    }

    try {
      const currentCrontab = await this.getCurrentCrontab();
      const filteredCrontab = currentCrontab
        .split('\n')
        .filter(line => !line.includes('generateDailyTips.ts'))
        .filter(line => line.trim() !== '')
        .join('\n');

      await this.setCrontab(filteredCrontab);
      logger.info('Cron job removed successfully');

    } catch (error) {
      logger.error('Failed to remove cron job:', error);
      throw error;
    }
  }

  /**
   * Test the generation script manually
   */
  async testGeneration(useMock: boolean = true): Promise<void> {
    logger.info('Testing tips generation...');
    
    const scriptPath = './scripts/automation/generateDailyTips.ts';
    const args = useMock ? ['--mock', '--force'] : ['--force'];

    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['tsx', scriptPath, ...args], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          logger.info('Test generation completed successfully');
          resolve();
        } else {
          logger.error(`Test generation failed with code ${code}`);
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        logger.error('Test generation failed:', error);
        reject(error);
      });
    });
  }

  private getCurrentCrontab(): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('crontab', ['-l'], { stdio: 'pipe' });
      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else if (code === 1 && error.includes('no crontab')) {
          resolve(''); // No existing crontab
        } else {
          reject(new Error(`crontab -l failed: ${error}`));
        }
      });
    });
  }

  private setCrontab(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('crontab', ['-'], { stdio: 'pipe' });

      child.stdin.write(content);
      child.stdin.end();

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`crontab installation failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private getNextRunTime(): string {
    const [hours, minutes] = this.scheduleConfig.time.split(':').map(Number);
    const now = new Date();
    const nextRun = new Date();
    
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.toLocaleString('en-US', {
      timeZone: this.scheduleConfig.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const scheduler = new TipsScheduler();

  try {
    switch (command) {
      case 'install':
        await scheduler.installCronJob();
        break;
      
      case 'remove':
        await scheduler.removeCronJob();
        break;
      
      case 'test':
        const useMock = args.includes('--mock');
        await scheduler.testGeneration(useMock);
        break;
      
      case 'cron':
        console.log('Cron expression:', scheduler.generateCronExpression());
        console.log('Cron command:', scheduler.generateCronCommand());
        break;
      
      default:
        console.log('Usage: tsx scheduler.ts <install|remove|test|cron> [--mock]');
        console.log('');
        console.log('Commands:');
        console.log('  install  - Install daily cron job');
        console.log('  remove   - Remove cron job');  
        console.log('  test     - Test generation (use --mock for mock data)');
        console.log('  cron     - Show cron expression and command');
        process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
