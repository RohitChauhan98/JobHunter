# AI Agent Development Prompt: JobHunter

## 🎯 Mission
You are tasked with building **JobHunter**, an intelligent browser extension and web application that automates the job application process. Your goal is to help job seekers save time by auto-filling forms and generating contextual responses to application questions.

## 📚 Primary Reference
Read the complete specification in `PROJECT_SPECIFICATION.md` before starting. This document contains:
- Detailed architecture and design decisions
- Database schemas and API designs
- User flows and UI/UX specifications
- Security and privacy guidelines
- Development phases and milestones

## 🏗️ What You're Building

### Core Components
1. **Browser Extension (Chrome/Edge)**
   - Detects job application forms on any website
   - Auto-fills personal information, work history, education
   - Integrates AI to answer essay questions
   - Tracks applications and session status

2. **Web Dashboard (Next.js)**
   - User profile management
   - Resume upload and parsing
   - Application tracking and analytics
   - Settings and preferences

3. **Backend API (Node.js/FastAPI)**
   - RESTful API for data management
   - AI service integration (OpenAI/Claude)
   - Resume parsing
   - Session management

4. **Database (PostgreSQL + Redis)**
   - User profiles and credentials
   - Work experience, education, skills
   - Application history
   - Session storage

## 🎨 Key Features

### Auto-Fill Intelligence
- Detect form fields using pattern matching (name, email, phone, etc.)
- Map user profile data to form fields
- Handle dropdowns, checkboxes, radio buttons
- Support file uploads (resume, cover letter)
- Trigger proper events for React/Vue forms

### AI-Powered Responses
- Generate tailored answers to application questions
- Use context from job description and user profile
- Respect character limits
- Maintain professional tone
- Allow user review and editing

### Session Management
- Semi-automated authentication (user logs in, extension saves cookies)
- Track login status across platforms (Indeed, LinkedIn, Wellfound)
- Notify when re-authentication needed
- Secure cookie storage

### Application Tracking
- Record all submitted applications
- Track status (submitted, rejected, interview, offer)
- Show analytics (applications per week, response rate)
- Export data capability

## 💻 Development Guidelines

### Code Quality Standards

#### 1. Documentation Requirements
Every file must start with:
```javascript
/**
 * File: fileName.js
 * Purpose: Brief description of what this file does
 * 
 * Key functionality:
 * - Feature 1
 * - Feature 2
 * 
 * Usage:
 *   const example = new Example();
 *   example.method();
 */
```

#### 2. Function Documentation
Every function must have JSDoc:
```javascript
/**
 * Brief description of what the function does
 * 
 * Detailed explanation if needed, including algorithm description,
 * edge cases, or important behaviors.
 * 
 * @param {Type} paramName - Description of parameter
 * @returns {Type} Description of return value
 * 
 * @example
 * functionName(exampleParam);
 * // Expected output or behavior
 */
function functionName(paramName) {
  // Implementation with inline comments for complex logic
}
```

#### 3. Inline Comments
Add comments for:
- Complex algorithms or logic
- Non-obvious decisions
- Workarounds or hacks
- TODO items with context

```javascript
// Check if field is a date input by examining multiple attributes
// because different sites use different naming conventions
const isDateField = element.type === 'date' || 
                   /date|dob|birth/i.test(element.name) ||
                   /date|dob|birth/i.test(element.placeholder);
```

#### 4. README Files
Create README.md in every major directory:
```markdown
# Directory Name

## Purpose
Brief description of what this directory contains

## Structure
- `file1.js` - Description
- `file2.js` - Description

## Usage
How to use the code in this directory

## Testing
How to test this module
```

### Naming Conventions
- **Files:** Use descriptive names
  - Components: `FormDetector.jsx`, `UserProfile.jsx`
  - Utilities: `fieldMapper.js`, `sessionManager.js`
  - Constants: `FIELD_PATTERNS.js`, `API_ENDPOINTS.js`

- **Variables:** Use meaningful names
  ```javascript
  // Bad
  const d = new Date();
  const fn = user.firstName;
  
  // Good
  const currentDate = new Date();
  const userFirstName = user.firstName;
  ```

- **Functions:** Use verb-noun pairs
  ```javascript
  // Good function names
  detectApplicationForm()
  mapFieldToUserData()
  generateAIResponse()
  validateSession()
  ```

### Error Handling
Always implement proper error handling:
```javascript
try {
  const result = await performOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error.message);
  // Log to error tracking service in production
  logger.error('performOperation failed', { error, context });
  
  // Return graceful fallback or throw with context
  throw new Error(`Failed to perform operation: ${error.message}`);
}
```

### Testing Requirements
Write tests for all critical functionality:
```javascript
describe('FormDetector', () => {
  describe('detectApplicationForm', () => {
    it('should detect Indeed application forms', () => {
      // Test implementation
    });
    
    it('should detect LinkedIn Easy Apply forms', () => {
      // Test implementation
    });
    
    it('should return null for non-application pages', () => {
      // Test implementation
    });
  });
});
```

## 🚀 Development Phases

### Phase 1: Foundation (Start Here)
1. Set up project structure (extension, web, backend)
2. Create basic extension that detects forms
3. Build user profile schema and database
4. Implement basic authentication
5. Create simple dashboard UI

**Deliverable:** Extension detects forms, user can create profile

### Phase 2: Auto-Fill
1. Implement field mapping algorithm
2. Build auto-fill functionality
3. Handle different input types
4. Support file uploads
5. Test on major platforms

**Deliverable:** Working auto-fill for standard fields

### Phase 3: AI Integration
1. Integrate OpenAI/Claude API
2. Build context-aware prompt system
3. Implement answer generation
4. Add review/edit UI
5. Test answer quality

**Deliverable:** AI generates quality answers to questions

### Phase 4: Polish
1. Add application tracking
2. Build analytics dashboard
3. Implement session management
4. Comprehensive testing
5. Documentation

**Deliverable:** Production-ready MVP

## 🔍 Important Patterns to Follow

### Browser Extension Communication
```javascript
// Content Script → Background
chrome.runtime.sendMessage({
  type: 'FILL_FORM',
  data: { formData }
}, (response) => {
  console.log('Response:', response);
});

// Background → Content Script
chrome.tabs.sendMessage(tabId, {
  type: 'FORM_DETECTED',
  data: { formFields }
});
```

### API Communication
```javascript
// Always use try-catch with API calls
async function fetchUserProfile() {
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
}
```

### Form Field Detection
```javascript
/**
 * Detects and classifies form fields
 * 
 * Uses multiple heuristics:
 * 1. Field name/id attributes
 * 2. Label text
 * 3. Placeholder text
 * 4. Input type
 * 5. Parent form context
 */
function classifyField(element) {
  const label = getFieldLabel(element);
  const name = element.name || element.id || '';
  const placeholder = element.placeholder || '';
  
  // Combine all signals
  const signals = `${label} ${name} ${placeholder}`.toLowerCase();
  
  // Check against patterns
  if (/first[\s_-]?name/i.test(signals)) return 'firstName';
  if (/last[\s_-]?name/i.test(signals)) return 'lastName';
  // ... more patterns
  
  return 'unknown';
}
```

## 🔒 Security Checklist

- [ ] Never log sensitive data (passwords, API keys)
- [ ] Encrypt data at rest (user profiles, resumes)
- [ ] Use HTTPS for all API calls
- [ ] Validate all user inputs
- [ ] Implement rate limiting
- [ ] Use secure cookie storage
- [ ] Add CORS protection
- [ ] Sanitize HTML/SQL inputs
- [ ] Implement CSP headers
- [ ] Regular dependency updates

## 📋 Development Checklist

Before considering a feature "done":
- [ ] Code is well-commented
- [ ] Functions have JSDoc documentation
- [ ] Error handling is implemented
- [ ] Unit tests are written
- [ ] Integration tests pass
- [ ] Tested on real platforms
- [ ] README updated if needed
- [ ] No console.log statements (use proper logger)
- [ ] Code is formatted (Prettier)
- [ ] Linting passes (ESLint)
- [ ] Type checking passes (TypeScript)

## 🎯 Success Criteria

### Technical
- Form detection accuracy: >95% on major platforms
- Auto-fill accuracy: >90% for common fields
- AI answer quality: >4/5 user rating
- Page load impact: <100ms
- Extension size: <5MB

### User Experience
- Onboarding: <5 minutes
- First auto-fill: <2 clicks
- Application time saved: >60%
- User satisfaction: >4.5/5 stars

## 📝 Quick Reference

### File Locations
```
extension/src/
  ├── background/        # Extension background logic
  ├── content/          # Injected page scripts
  ├── popup/            # Extension popup UI
  └── utils/            # Shared utilities

web-dashboard/src/
  ├── app/              # Next.js pages
  ├── components/       # React components
  └── lib/              # Utilities

backend/src/
  ├── controllers/      # Request handlers
  ├── models/          # Database models
  ├── routes/          # API routes
  └── services/        # Business logic
```

### Common Commands
```bash
# Development
npm run dev              # Start all services
npm run dev:extension    # Extension only
npm run dev:web         # Dashboard only
npm run dev:api         # Backend only

# Testing
npm test                # Run all tests
npm run test:unit       # Unit tests only
npm run test:e2e        # End-to-end tests

# Code Quality
npm run lint            # Check linting
npm run format          # Format code
npm run type-check      # TypeScript check
```

## 🚨 Common Pitfalls to Avoid

1. **Don't** assume form structures are consistent
2. **Don't** forget to trigger events when filling React/Vue forms
3. **Don't** store plain-text passwords or sensitive data
4. **Don't** make synchronous API calls
5. **Don't** skip error handling
6. **Don't** hardcode values (use constants/config)
7. **Don't** commit API keys or secrets
8. **Don't** forget to clean up event listeners
9. **Don't** assume browser APIs work the same everywhere
10. **Don't** skip testing on actual job sites

## 🎓 Learning Resources

If you need to understand something better:
- **Chrome Extension Docs:** https://developer.chrome.com/docs/extensions/
- **React Docs:** https://react.dev/
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **OpenAI API:** https://platform.openai.com/docs

## 📞 When You Need Help

If something is unclear or you need to make a decision:
1. Check the PROJECT_SPECIFICATION.md for details
2. Look for similar patterns in the codebase
3. Flag the issue with a clear TODO comment
4. Document your decision in comments
5. Add to the questions list in QUESTIONS.md

## 🎉 Getting Started

1. Read PROJECT_SPECIFICATION.md thoroughly
2. Set up your development environment
3. Start with Phase 1: Foundation
4. Create the basic project structure
5. Begin with the browser extension boilerplate
6. Follow the development phases in order
7. Test frequently on real job sites
8. Document as you go

Remember: **Quality over speed**. Well-documented, tested code is far more valuable than rushing through features.

Good luck building JobHunter! 🚀

---

**Version:** 1.0  
**Last Updated:** February 2026
