/**
 * GitHub API Integration for Production File Updates
 * Enables updating JSON files in production via GitHub API
 */

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
}

interface GitHubFileUpdate {
  path: string;
  content: string;
  message: string;
  sha?: string;
}

export class GitHubFileManager {
  private config: GitHubConfig;
  private apiBase = 'https://api.github.com';

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  /**
   * Get file content and SHA from GitHub
   */
  async getFile(filePath: string) {
    const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // File doesn't exist
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.sha,
    };
  }

  /**
   * Update file on GitHub
   */
  async updateFile({ path, content, message, sha }: GitHubFileUpdate) {
    const url = `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
    
    const body = {
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch: this.config.branch,
      ...(sha && { sha }), // Include SHA if updating existing file
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  /**
   * Update a JSON file with new data
   */
  async updateJsonFile(filePath: string, newData: Record<string, unknown>, commitMessage: string) {
    try {
      // Get current file (if exists)
      const existingFile = await this.getFile(filePath);
      
      // Convert data to JSON string
      const jsonContent = JSON.stringify(newData, null, 2);
      
      // Update file
      await this.updateFile({
        path: filePath,
        content: jsonContent,
        message: commitMessage,
        sha: existingFile?.sha,
      });

      return { success: true };
    } catch (error) {
      console.error('GitHub file update failed:', error);
      throw error;
    }
  }
}

/**
 * Initialize GitHub manager from environment variables
 */
export function createGitHubManager(): GitHubFileManager | null {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!owner || !repo || !token) {
    console.warn('GitHub credentials not configured. File updates disabled in production.');
    return null;
  }

  return new GitHubFileManager({ owner, repo, token, branch });
}

/**
 * Check if we're in production and should use GitHub API
 */
export function shouldUseGitHub(): boolean {
  return process.env.NODE_ENV === 'production' && 
         process.env.VERCEL === '1' &&
         Boolean(process.env.GITHUB_TOKEN);
}
