# Today's Todoist Tasks

Get today's tasks from your Todoist account using the MCP server.

## Prerequisites

1. **Get Todoist API Token**:
   - Visit: https://todoist.com/prefs/integrations
   - Scroll down to "API token" section
   - Copy your personal API token

2. **Configure Environment**:
   - Add to your `.env.local` file:
     ```
     TODOIST_API_TOKEN=your-actual-token-here
     ```

## Usage

Test the Todoist integration by calling the MCP tool:

```
Use the get_todays_tasks tool to retrieve today's tasks from Todoist
```

## Expected Response

The tool will return:
- 📋 Formatted list of today's tasks
- 🎯 Priority indicators (🔴 P1, 🟡 P2, 🔵 P3, ⚪ P4)
- 📁 Project names for each task
- ⏰ Due times (if specified)
- 🏷️ Labels (if assigned)
- 📝 Task descriptions (if available)

## Troubleshooting

If you get an error:
1. **Authentication Error**: Check that `TODOIST_API_TOKEN` is correctly set
2. **Network Error**: Verify internet connection and Todoist service status
3. **No Tasks**: If no tasks are due today, you'll see a success message: "No tasks due today! 🎉"

## Features

- Automatically sorts by priority (highest first)
- Shows project context for each task
- Includes time information for scheduled tasks
- Handles empty task lists gracefully
- Provides detailed error messages for debugging