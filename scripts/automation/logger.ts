/**
 * Logging system for automation processes
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AUTOMATION_CONFIG } from './config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
}

class Logger {
  private logFile: string;
  private currentDate: string;

  constructor() {
    this.currentDate = new Date().toISOString().split('T')[0];
    this.logFile = path.join(AUTOMATION_CONFIG.output.logDirectory, `automation-${this.currentDate}.log`);
    this.ensureLogDirectory();
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir(AUTOMATION_CONFIG.output.logDirectory, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    const logLine = `${entry.timestamp} [${LogLevel[entry.level]}] ${entry.message}${entry.data ? ' | ' + JSON.stringify(entry.data) : ''}\n`;
    
    // Write to console
    console.log(logLine.trim());
    
    // Write to file
    try {
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  debug(message: string, data?: any, source?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      data,
      source
    });
  }

  info(message: string, data?: any, source?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      data,
      source
    });
  }

  warn(message: string, data?: any, source?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      data,
      source
    });
  }

  error(message: string, data?: any, source?: string): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      data,
      source
    });
  }

  async getRecentLogs(hours: number = 24): Promise<string[]> {
    try {
      const content = await fs.readFile(this.logFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      return lines.filter(line => {
        const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
        if (!timestampMatch) return false;
        
        const logTime = new Date(timestampMatch[1]);
        return logTime >= cutoffTime;
      });
    } catch (error) {
      this.error('Failed to read log file:', error);
      return [];
    }
  }

  async archiveOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const logDir = AUTOMATION_CONFIG.output.logDirectory;
      const files = await fs.readdir(logDir);
      
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      for (const file of files) {
        if (file.startsWith('automation-') && file.endsWith('.log')) {
          const dateMatch = file.match(/automation-(\d{4}-\d{2}-\d{2})\.log/);
          if (dateMatch) {
            const fileDate = new Date(dateMatch[1]);
            if (fileDate < cutoffDate) {
              await fs.unlink(path.join(logDir, file));
              this.info(`Archived old log file: ${file}`);
            }
          }
        }
      }
    } catch (error) {
      this.error('Failed to archive old logs:', error);
    }
  }
}

export const logger = new Logger();
