import OpenAI from 'openai';
import ErrorResponse from '../utils/errorResponse.js';

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate resume content using OpenAI
 * @param {Object} params - Parameters for resume generation
 * @param {string} params.jobTitle - Target job title
 * @param {string} params.experience - User's work experience
 * @param {string[]} params.skills - Array of skills
 * @param {string} [params.additionalInfo] - Additional information for personalization
 * @returns {Promise<Object>} Generated resume content
 */
export const generateResumeWithAI = async ({ jobTitle, experience, skills, additionalInfo = '' }) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Generate a professional resume for a ${jobTitle} position with the following details:\n\nJob Title: ${jobTitle}\n\nExperience:\n${experience}\n\nSkills:\n${skills.join(', ')}\n\nAdditional Information:\n${additionalInfo}\n\nPlease structure the resume with the following sections:\n1. Professional Summary\n2. Skills (categorized if possible)\n3. Work Experience (with bullet points highlighting achievements)\n4. Education\n5. Certifications (if any)\n6. Additional Sections (projects, volunteer work, etc.)\n\nFormat the response as a JSON object with a 'sections' array. Each section should have a 'title' and 'content' field.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' for faster, less expensive responses
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Generate a well-structured resume based on the provided information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Extract the generated content
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Failed to generate resume content');
    }

    // Try to parse the JSON response
    try {
      // Sometimes the response might include markdown code blocks with JSON
      const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      const result = JSON.parse(jsonString);
      
      // Validate the response structure
      if (!result.sections || !Array.isArray(result.sections)) {
        throw new Error('Invalid response format from AI');
      }
      
      return result;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // If JSON parsing fails, return a structured error
      throw new Error('Failed to parse AI-generated content');
    }
  } catch (error) {
    console.error('Error in generateResumeWithAI:', error);
    throw new ErrorResponse(
      error.message || 'Failed to generate resume with AI',
      error.statusCode || 500
    );
  }
};

/**
 * Generate a cover letter using OpenAI
 * @param {Object} params - Parameters for cover letter generation
 * @param {string} params.jobTitle - Target job title
 * @param {string} params.company - Company name
 * @param {string} params.experience - User's work experience
 * @param {string} [params.additionalInfo] - Additional information for personalization
 * @returns {Promise<string>} Generated cover letter
 */
export const generateCoverLetter = async ({ jobTitle, company, experience, additionalInfo = '' }) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company} with the following experience:\n\n${experience}\n\nAdditional Information:\n${additionalInfo}\n\nPlease make the cover letter concise, professional, and tailored to the position.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' for faster, less expensive responses
      messages: [
        {
          role: 'system',
          content: 'You are a professional cover letter writer. Generate a compelling cover letter based on the provided information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extract the generated content
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Failed to generate cover letter');
    }
    
    return content.trim();
  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    throw new ErrorResponse(
      error.message || 'Failed to generate cover letter',
      error.statusCode || 500
    );
  }
};

// Named exports are used above
