const supportedLanguages = {
    'python': 38,    // Python (3.8.1)
    'javascript': 26, // JavaScript (Node.js 12.14.0)
    'java': 25,      // Java (OpenJDK 13.0.1)
    'cpp': 12,       // C++ (GCC 9.2.0)
    'c': 7,          // C (GCC 9.2.0)
    'go': 22,        // Go (1.13.5)
    'ruby': 40,      // Ruby (2.7.0)
    'rust': 41,      // Rust (1.40.0)
    'php': 34,       // PHP (7.4.1)
    'csharp': 8      // C# (Mono 6.6.0.161)
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