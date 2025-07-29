interface TodoistTask {
  id: string;
  project_id: string;
  section_id?: string;
  content: string;
  description?: string;
  is_completed: boolean;
  labels: string[];
  parent_id?: string;
  order: number;
  priority: number;
  due?: {
    date: string;
    datetime?: string;
    string: string;
    timezone?: string;
    is_recurring: boolean;
  };
  url: string;
  comment_count: number;
  created_at: string;
  creator_id: string;
}

interface TodoistProject {
  id: string;
  name: string;
  color: string;
  parent_id?: string;
  order: number;
  comment_count: number;
  is_shared: boolean;
  is_favorite: boolean;
  view_style: string;
  url: string;
}

class TodoistAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TodoistAPIError';
  }
}

export class TodoistClient {
  private readonly baseURL = 'https://api.todoist.com/rest/v2';
  private readonly token: string;

  constructor(token?: string) {
    this.token = token || process.env.TODOIST_API_TOKEN!;
    if (!this.token) {
      throw new TodoistAPIError('Todoist API token is required');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TodoistAPIError(
          `Todoist API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TodoistAPIError) {
        throw error;
      }
      throw new TodoistAPIError(`Network error: ${error}`);
    }
  }

  async getTasks(filter?: string): Promise<TodoistTask[]> {
    const endpoint = filter ? `/tasks?filter=${encodeURIComponent(filter)}` : '/tasks';
    return this.makeRequest<TodoistTask[]>(endpoint);
  }

  async getProjects(): Promise<TodoistProject[]> {
    return this.makeRequest<TodoistProject[]>('/projects');
  }

  async getTodaysTasks(): Promise<TodoistTask[]> {
    // Get tasks due today using Todoist's date filter
    return this.getTasks('today');
  }

  formatTasksForDisplay(tasks: TodoistTask[], projects?: TodoistProject[]): string {
    if (tasks.length === 0) {
      return 'No tasks due today! 🎉';
    }

    // Create a map of project IDs to names for better display
    const projectMap = new Map<string, string>();
    if (projects) {
      projects.forEach(project => {
        projectMap.set(project.id, project.name);
      });
    }

    const formatPriority = (priority: number): string => {
      switch (priority) {
        case 4: return '🔴 P1';
        case 3: return '🟡 P2';
        case 2: return '🔵 P3';
        default: return '⚪ P4';
      }
    };

    const formatDue = (due?: TodoistTask['due']): string => {
      if (!due) return '';
      if (due.datetime) {
        const time = new Date(due.datetime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return ` ⏰ ${time}`;
      }
      return ' 📅 Today';
    };

    const taskList = tasks
      .sort((a, b) => {
        // Sort by priority (higher priority first), then by order
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.order - b.order;
      })
      .map((task, index) => {
        const projectName = projectMap.get(task.project_id) || 'Unknown Project';
        const priority = formatPriority(task.priority);
        const dueInfo = formatDue(task.due);
        const labels = task.labels.length > 0 ? ` 🏷️ ${task.labels.join(', ')}` : '';
        
        return `${index + 1}. ${priority} ${task.content}${dueInfo}
   📁 ${projectName}${labels}${task.description ? `\n   📝 ${task.description}` : ''}`;
      })
      .join('\n\n');

    return `📋 Today's Tasks (${tasks.length} total):\n\n${taskList}`;
  }
}

// Export a default instance
export const todoist = new TodoistClient();