import { env } from '../config';
import { logger } from '../utils';

/**
 * AI Integration Module.
 * Connects to OpenAI API for intelligent features.
 * Falls back gracefully when no API key is configured.
 */
export class AIService {
  private static isEnabled(): boolean {
    return env.AI_ENABLED;
  }

  static async generateTaskDescription(title: string, context?: string): Promise<string> {
    if (!AIService.isEnabled()) {
      return `Task: ${title}\n\nDescription: [AI feature requires OPENAI_API_KEY configuration]\n\nPlease provide a detailed description for this task.`;
    }
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful project management assistant. Generate clear, concise task descriptions.' },
            { role: 'user', content: `Generate a detailed task description for: "${title}"${context ? `. Context: ${context}` : ''}` }
          ],
          max_tokens: 300,
        }),
      });
      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate description.';
    } catch (error) {
      logger.error('AI task description generation failed', { error: String(error) });
      return 'AI service temporarily unavailable. Please write the description manually.';
    }
  }

  static async generateSubtasks(title: string, description?: string): Promise<string[]> {
    if (!AIService.isEnabled()) {
      return ['[AI feature requires OPENAI_API_KEY]', 'Break this task down manually into smaller subtasks'];
    }
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Break down tasks into subtasks. Return a JSON array of strings.' },
            { role: 'user', content: `Break down this task into subtasks:\nTitle: ${title}\n${description ? `Description: ${description}` : ''}` }
          ],
          max_tokens: 400,
        }),
      });
      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content || '[]';
      try { return JSON.parse(content); } catch { return content.split('\n').filter((l: string) => l.trim()); }
    } catch (error) {
      logger.error('AI subtask generation failed', { error: String(error) });
      return ['AI service temporarily unavailable'];
    }
  }

  static async generateProjectSummary(projectName: string, tasks: any[]): Promise<string> {
    if (!AIService.isEnabled()) {
      const done = tasks.filter(t => t.status === 'DONE').length;
      return `Project "${projectName}": ${tasks.length} total tasks, ${done} completed, ${tasks.length - done} remaining. AI-powered summary requires OPENAI_API_KEY configuration.`;
    }
    try {
      const taskSummary = tasks.map(t => `- ${t.title} (${t.status})`).join('\n');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Summarize project status concisely for a team standup.' },
            { role: 'user', content: `Summarize the status of project "${projectName}":\n${taskSummary}` }
          ],
          max_tokens: 300,
        }),
      });
      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || 'Unable to generate summary.';
    } catch (error) {
      logger.error('AI project summary failed', { error: String(error) });
      return 'AI service temporarily unavailable.';
    }
  }

  static getStatus(): { enabled: boolean; message: string } {
    return {
      enabled: AIService.isEnabled(),
      message: AIService.isEnabled() ? 'AI features are active' : 'AI features disabled. Set OPENAI_API_KEY to enable.',
    };
  }
}
