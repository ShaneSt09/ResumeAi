import { JobExperience, Education, GenerateResumeParams, ResumeContent } from './resume';

// API types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Resume generation API
export interface ResumeGenerationResponse extends ResumeContent {
  atsScore: number;
  atsKeywords: string[];
}

export interface ResumeGenerationApi {
  generateResume: (params: GenerateResumeParams) => Promise<ApiResponse<ResumeGenerationResponse>>;
  optimizeForATS: (resumeContent: string) => Promise<ApiResponse<{ optimizedContent: string; score: number }>>;
}

// User authentication types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    subscription: {
      status: 'active' | 'inactive' | 'trialing';
      expiresAt: number | null;
    };
  };
}
