

# RepoIntel — AI Repository Intelligence

An AI-powered GitHub repository analysis tool that generates architecture insights, security audits, onboarding guides, dependency graphs, and maintainability scores from any public repository URL.

Built with React and a terminal-inspired developer UI.

---

## Preview

Analyze any public GitHub repository and receive:

* Architecture reconstruction
* Security observations
* Maintainability scoring
* Dependency visualization
* Refactoring recommendations
* AI-generated onboarding instructions
* Codebase metrics and complexity insights

---

## Features

### AI-Powered Repository Analysis

Paste a GitHub repository URL and RepoIntel generates a structured software engineering report using an LLM.

### Architecture Intelligence

* Detects architectural patterns
* Generates dependency graphs
* Explains system layers and structure

### Security Review

* Simulated static analysis insights
* Security warnings and recommendations
* Dependency health observations

### Engineering Metrics

* Code complexity analysis
* File/function counts
* Test coverage indicators
* Documentation quality scoring

### Refactoring Suggestions

Highlights:

* God functions
* Duplicate logic
* Dead code
* Structural improvements

### Developer Onboarding

Generates:

* Setup instructions
* First-run commands
* Important project files

### Terminal-Style UX

Animated logs simulate a real repository analysis pipeline:

* AST parsing
* Security scanning
* Embedding generation
* AI reasoning
* Architecture reconstruction

---

## Tech Stack

### Frontend

* React
* JSX
* Inline CSS styling

### AI

* Anthropic Claude API

### Visualization

* SVG dependency graphs
* Animated score rings

### UI/UX

* IBM Plex Sans
* JetBrains Mono

---

## Demo Repositories

Try analyzing:

* `vercel/next.js`
* `fastapi/fastapi`
* `tiangolo/sqlmodel`
* `shadcn-ui/ui`

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/repointel.git
cd repointel
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Configuration

You will need an Anthropic API key.

Create an environment file:

```bash
.env
```

Add:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

---

## Usage

1. Start the app
2. Paste a public GitHub repository URL
3. Click **Analyze**
4. View the generated intelligence report

Example:

```txt
https://github.com/vercel/next.js
```

---

## Report Structure

RepoIntel generates:

```json
{
  "repoName": "",
  "description": "",
  "techStack": {},
  "scores": {},
  "architecture": {},
  "metrics": {},
  "dependencies": {},
  "security": {},
  "insights": [],
  "refactoring": [],
  "onboarding": {}
}
```

---

## Project Structure

```txt
src/
│
├── App.jsx
├── components/
├── styles/
└── assets/
```

---

## Current Limitations

* Uses AI inference instead of real repository cloning
* No actual static analysis engine yet
* No GitHub authentication/rate limit handling
* Security scanning is simulated
* Public repositories only

---

## Future Improvements

* Real GitHub API integration
* Actual AST parsing backend
* Embedding-based repository search
* Semantic code navigation
* Multi-repository comparison
* CI/CD risk analysis
* Real security scanners (Semgrep, CodeQL)
* Exportable PDF reports
* Team collaboration dashboard

---

## Inspiration

RepoIntel was designed as a developer portfolio project focused on:

* AI-assisted software engineering
* Developer tooling
* System architecture visualization
* Modern technical UI design

---

## Screenshots

Add screenshots here:

```md
![Dashboard](./screenshots/dashboard.png)
```

---

## License

MIT License

---

## Author

Theja mk
