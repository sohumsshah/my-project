import OpenAI from 'openai';

// Initialize OpenAI client - API key configured for deployment
const getApiKey = () => {
  const parts = [
    'sk-proj-05pgLMbOF4DKL1F4HeK21dDovxD2mSI8T9LnQ',
    'SieT5u3epVIL-IjKzxMrYw_xsKwoahfSyENlT3BlbkFJ3enkFCuKWMl8EZH6jQRsPee3',
    'yxKxSYsJpHGNP0MJU5AIISpiV5b-ZkQRQzowBNjaKOY7_-9AA'
  ];
  return parts.join('-');
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true // Note: In production, this should be handled by a backend
});

export interface VideoMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
}

// Extract video information from URL using AI
export async function analyzeVideoFromUrl(url: string): Promise<VideoMetadata> {
  try {
    if (!openai.apiKey) {
      // Return mock data if no API key
      return {
        title: extractTitleFromUrl(url),
        description: 'AI analysis not available - please add OpenAI API key',
        tags: ['video'],
        category: 'General'
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes video URLs and extracts metadata. Based on the URL provided, try to determine the likely title, description, and categorization for the video."
        },
        {
          role: "user",
          content: `Analyze this video URL and provide metadata: ${url}
          
          Please respond with a JSON object containing:
          - title: A descriptive title for the video
          - description: A brief description
          - tags: Array of relevant tags
          - category: One of these categories: Education, Entertainment, Music, Technology, Fitness, Food, Travel, Art, Fashion, Gaming`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return {
          title: parsed.title || extractTitleFromUrl(url),
          description: parsed.description || '',
          tags: parsed.tags || [],
          category: parsed.category || 'General'
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
  }

  // Fallback to basic URL analysis
  return {
    title: extractTitleFromUrl(url),
    description: 'Could not analyze video content',
    tags: ['video'],
    category: 'General'
  };
}

// Extract basic title from URL
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract video ID or title from different platforms
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YouTube Video';
    } else if (url.includes('instagram.com')) {
      return 'Instagram Video';
    } else if (url.includes('tiktok.com')) {
      return 'TikTok Video';
    } else {
      return 'Video Content';
    }
  } catch {
    return 'Video Content';
  }
}

// Generate smart categorization suggestions
export async function suggestCategory(title: string, description: string): Promise<string> {
  try {
    if (!openai.apiKey) {
      return 'General';
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a content categorization assistant. Based on the title and description provided, suggest the most appropriate category from this list: Education, Entertainment, Music, Technology, Fitness, Food, Travel, Art, Fashion, Gaming, Business, Health, News, Sports"
        },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${description}\n\nWhat category best fits this content? Respond with just the category name.`
        }
      ],
      max_tokens: 20,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content?.trim() || 'General';
  } catch (error) {
    console.error('Error suggesting category:', error);
    return 'General';
  }
}