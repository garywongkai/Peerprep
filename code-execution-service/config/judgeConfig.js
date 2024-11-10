const supportedLanguages = {
    'python': 71,    // Python (3.8.1)
    'javascript': 63, // JavaScript (Node.js 12.14.0)
    'java': 62,      // Java (OpenJDK 13.0.1)
    'cpp': 54,       // C++ (GCC 9.2.0)
    'c': 50,         // C (GCC 9.2.0)
    'go': 60,        // Go (1.13.5)
    'ruby': 72,      // Ruby (2.7.0)
    'rust': 73,      // Rust (1.40.0)
    'php': 68,       // PHP (7.4.1)
    'csharp': 51     // C# (Mono 6.6.0.161)
  };
  
  const config = {
    apiEndpoint: 'https://judge0-ce.p.rapidapi.com',
    apiKey: process.env.JUDGE0_API_KEY,
    apiHost: 'judge0-ce.p.rapidapi.com'
  };
  
  module.exports = {
    supportedLanguages,
    config
  };