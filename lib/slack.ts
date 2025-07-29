interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
}

interface SlackConversation {
  id: string;
  name?: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
}

interface SlackResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  response_metadata?: {
    next_cursor?: string;
  };
}

class SlackClient {
  private apiToken: string | null = null;
  private baseUrl = 'https://slack.com/api';

  private getToken(): string {
    if (!this.apiToken) {
      const token = process.env.SLACK_API_TOKEN;
      if (!token) {
        throw new Error('SLACK_API_TOKEN environment variable is required');
      }
      this.apiToken = token;
    }
    return this.apiToken;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<SlackResponse<T>> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    
    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error || 'Unknown error'}`);
    }

    return {
      ok: true,
      data: data,
      response_metadata: data.response_metadata,
    };
  }

  async getConversations(limit: number = 100): Promise<SlackConversation[]> {
    const response = await this.makeRequest<any>('conversations.list', {
      limit,
      types: 'public_channel,private_channel,im,mpim',
      exclude_archived: true,
    });

    return response.data?.channels || [];
  }

  async getMessages(channelId: string, limit: number = 50): Promise<SlackMessage[]> {
    const response = await this.makeRequest<any>('conversations.history', {
      channel: channelId,
      limit: Math.min(limit, 15), // Respect 2025 rate limits
    });

    return response.data?.messages || [];
  }

  async testConnection(): Promise<string> {
    try {
      const response = await this.makeRequest<any>('auth.test');
      
      if (response.data) {
        const { user, team, user_id, team_id, bot_id, is_bot } = response.data;
        return `✅ Slack connection successful!\nUser: ${user || 'N/A'} (${user_id || 'N/A'})\nTeam: ${team || 'N/A'} (${team_id || 'N/A'})\nBot ID: ${bot_id || 'N/A'}\nIs Bot: ${is_bot || false}`;
      }
      
      return "✅ Slack connection successful!";
    } catch (error) {
      throw new Error(`Slack connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllMyMessages(limit: number = 200): Promise<string> {
    try {
      // Debug: Let's try different endpoints to see what works
      let debugInfo = "🔍 Debugging Slack token capabilities:\n\n";
      
      // Test auth.test first
      try {
        const authResponse = await this.makeRequest<any>('auth.test');
        debugInfo += `✅ auth.test: ${JSON.stringify(authResponse.data, null, 2)}\n\n`;
      } catch (error) {
        debugInfo += `❌ auth.test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      }
      
      // Try rtm.connect (works with most token types)
      try {
        const rtmResponse = await this.makeRequest<any>('rtm.connect');
        debugInfo += `✅ rtm.connect: works\n\n`;
      } catch (error) {
        debugInfo += `❌ rtm.connect failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      }
      
             // Try users.info on self
       try {
         const userResponse = await this.makeRequest<any>('users.info', { user: 'me' });
         debugInfo += `✅ users.info: works\n\n`;
       } catch (error) {
         debugInfo += `❌ users.info failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
       }
       
       // Try app-level endpoints that might work
       try {
         const appsResponse = await this.makeRequest<any>('apps.connections.open');
         debugInfo += `✅ apps.connections.open: works\n\n`;
       } catch (error) {
         debugInfo += `❌ apps.connections.open failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
       }
       
       // Try team.info (often works with app tokens)
       try {
         const teamResponse = await this.makeRequest<any>('team.info');
         debugInfo += `✅ team.info: ${JSON.stringify(teamResponse.data, null, 2)}\n\n`;
       } catch (error) {
         debugInfo += `❌ team.info failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
       }
       
       // Try api.test (should work with any token)
       try {
         const apiResponse = await this.makeRequest<any>('api.test');
         debugInfo += `✅ api.test: ${JSON.stringify(apiResponse.data, null, 2)}\n\n`;
       } catch (error) {
         debugInfo += `❌ api.test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
       }
       
       debugInfo += "📝 **Analysis**: This appears to be a Demo App token with very limited permissions.\n";
       debugInfo += "To access messages, you'll need a proper Bot Token with these scopes:\n";
       debugInfo += "- channels:read, channels:history\n";
       debugInfo += "- groups:read, groups:history\n";
       debugInfo += "- im:read, im:history\n";
       debugInfo += "- mpim:read, mpim:history\n\n";
       debugInfo += "Please create a new Slack app and install it with proper message reading permissions.";
      
       return debugInfo + "This debug info will help determine the right approach for your token type.";
    } catch (error) {
      throw new Error(`Failed to fetch Slack messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const slack = new SlackClient();