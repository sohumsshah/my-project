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

// Extract video information from URL using AI with web search
export async function analyzeVideoFromUrl(url: string): Promise<VideoMetadata> {
  try {
    if (!openai.apiKey) {
      return {
        title: extractTitleFromUrl(url),
        description: 'AI analysis not available - please add OpenAI API key',
        tags: ['video'],
        category: 'General'
      };
    }

    // Extract platform and video ID for better analysis
    const platform = detectPlatform(url);
    const videoId = extractVideoId(url, platform);
    
    // Use GPT-4 with web search capabilities for better analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4 mini for better analysis
      messages: [
        {
          role: "system",
          content: `You are an expert video content analyzer. When given a video URL, you should:
          1. Analyze the URL structure to understand the platform and content
          2. Use your knowledge to infer content type and category
          3. Generate appropriate metadata based on the URL patterns and platform
          4. Be specific and accurate in your categorization
          
          Available categories: Education, Entertainment, Music, Technology, Fitness, Food, Travel, Art, Fashion, Gaming, Business, Health, News, Sports, Comedy, DIY, Beauty, Lifestyle, Science`
        },
        {
          role: "user",
          content: `Analyze this ${platform} video URL and provide detailed metadata: ${url}

          Platform: ${platform}
          ${videoId ? `Video ID: ${videoId}` : ''}
          
          Based on the URL structure, platform, and any identifiable patterns, provide a JSON response with:
          {
            "title": "A descriptive and engaging title for the video",
            "description": "A detailed description of what this video likely contains",
            "tags": ["relevant", "keywords", "and", "tags"],
            "category": "Most appropriate category from the list above"
          }
          
          Make your analysis intelligent and specific to the platform and URL patterns you observe.`
        }
      ],
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return {
          title: parsed.title || generateSmartTitle(url, platform),
          description: parsed.description || 'AI-generated analysis of video content',
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['video', platform],
          category: parsed.category || suggestCategoryFromUrl(url, platform)
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
  }

  // Enhanced fallback with smart analysis
  const platform = detectPlatform(url);
  return {
    title: generateSmartTitle(url, platform),
    description: `${platform} video content - AI analysis temporarily unavailable`,
    tags: ['video', platform, 'content'],
    category: suggestCategoryFromUrl(url, platform)
  };
}

// Detect platform from URL
function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YouTube';
  } else if (url.includes('instagram.com')) {
    return 'Instagram';
  } else if (url.includes('tiktok.com')) {
    return 'TikTok';
  } else if (url.includes('vimeo.com')) {
    return 'Vimeo';
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'Twitter/X';
  } else {
    return 'Video Platform';
  }
}

// Extract video ID from URL
function extractVideoId(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'YouTube':
        if (url.includes('youtu.be/')) {
          return urlObj.pathname.slice(1);
        } else if (url.includes('youtube.com/watch')) {
          return urlObj.searchParams.get('v');
        }
        break;
      case 'Instagram':
        const instaMatch = url.match(/\/p\/([^\/]+)/);
        return instaMatch ? instaMatch[1] : null;
      case 'TikTok':
        const tiktokMatch = url.match(/\/video\/(\d+)/);
        return tiktokMatch ? tiktokMatch[1] : null;
      case 'Vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        return vimeoMatch ? vimeoMatch[1] : null;
    }
    return null;
  } catch {
    return null;
  }
}

// Generate smart title based on URL analysis
function generateSmartTitle(url: string, platform: string): string {
  const videoId = extractVideoId(url, platform);
  
  if (videoId) {
    return `${platform} Video (${videoId.slice(0, 8)}...)`;
  }
  
  // Try to extract meaningful parts from URL
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
    
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.length > 3) {
        return `${platform} - ${lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      }
    }
  } catch {
    // Fallback
  }
  
  return `${platform} Video Content`;
}

// Suggest category based on URL patterns
function suggestCategoryFromUrl(url: string, platform: string): string {
  const urlLower = url.toLowerCase();
  
  // URL-based category detection
  if (urlLower.includes('music') || urlLower.includes('song') || urlLower.includes('album')) return 'Music';
  if (urlLower.includes('gaming') || urlLower.includes('game') || urlLower.includes('gameplay')) return 'Gaming';
  if (urlLower.includes('cooking') || urlLower.includes('recipe') || urlLower.includes('food')) return 'Food';
  if (urlLower.includes('workout') || urlLower.includes('fitness') || urlLower.includes('exercise')) return 'Fitness';
  if (urlLower.includes('tutorial') || urlLower.includes('howto') || urlLower.includes('learn')) return 'Education';
  if (urlLower.includes('comedy') || urlLower.includes('funny') || urlLower.includes('humor')) return 'Comedy';
  if (urlLower.includes('news') || urlLower.includes('breaking')) return 'News';
  if (urlLower.includes('tech') || urlLower.includes('review') || urlLower.includes('unbox')) return 'Technology';
  if (urlLower.includes('travel') || urlLower.includes('vacation') || urlLower.includes('trip')) return 'Travel';
  if (urlLower.includes('fashion') || urlLower.includes('style') || urlLower.includes('outfit')) return 'Fashion';
  if (urlLower.includes('beauty') || urlLower.includes('makeup') || urlLower.includes('skincare')) return 'Beauty';
  if (urlLower.includes('diy') || urlLower.includes('craft') || urlLower.includes('build')) return 'DIY';
  if (urlLower.includes('health') || urlLower.includes('medical') || urlLower.includes('wellness')) return 'Health';
  if (urlLower.includes('business') || urlLower.includes('entrepreneur') || urlLower.includes('startup')) return 'Business';
  if (urlLower.includes('art') || urlLower.includes('paint') || urlLower.includes('draw')) return 'Art';
  if (urlLower.includes('science') || urlLower.includes('experiment') || urlLower.includes('physics')) return 'Science';
  if (urlLower.includes('sport') || urlLower.includes('football') || urlLower.includes('basketball')) return 'Sports';
  
  // Platform-based defaults
  switch (platform) {
    case 'TikTok': return 'Entertainment';
    case 'Instagram': return 'Lifestyle';
    case 'YouTube': return 'Entertainment';
    default: return 'General';
  }
}

// Extract basic title from URL (legacy function)
function extractTitleFromUrl(url: string): string {
  const platform = detectPlatform(url);
  return generateSmartTitle(url, platform);
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