// main.js

// Initialize CodeMirror editor
const editor = CodeMirror(document.getElementById('editor'), {
    value: '// Write your JavaScript code here\n',
    mode: 'javascript',
    lineNumbers: true,
    theme: 'dracula',
    autoCloseBrackets: true,
    matchBrackets: true,
    extraKeys: { 'Ctrl-Space': 'autocomplete' },
  });
  
  // Event listener for Run Code button
  document.getElementById('run-btn').addEventListener('click', () => {
    const userCode = editor.getValue();
    runUserCode(userCode);
  });
  
  function runUserCode(code) {
    const outputElement = document.getElementById('output');
    outputElement.textContent = ''; // Clear previous output
  
    // Clear previous error highlights
    editor.eachLine((line) => {
      editor.removeLineClass(line, 'background', 'line-error');
    });
  
    // Show spinner
    document.getElementById('spinner').style.display = 'inline-block';
  
    // Prepare the iframe
    const iframe = document.getElementById('sandbox-iframe');
  
    // Create the iframe content
    const iframeContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          // Override console methods
          ['log', 'error', 'warn', 'info'].forEach(function(method) {
            console[method] = function(...args) {
              parent.postMessage({ type: method, message: args.join(' ') }, '*');
            };
          });
  
          // Capture errors
          window.onerror = function(message, source, lineno, colno, error) {
            parent.postMessage({ type: 'error', message: message + ' at line ' + lineno }, '*');
          };
        <\/script>
      </head>
      <body>
        <script>
          try {
            ${code}
          } catch (e) {
            console.error('Error: ' + e.message);
          }
        <\/script>
      </body>
      </html>
    `;
  
    // Set the iframe content
    iframe.srcdoc = iframeContent;
  
    // Hide spinner after iframe loads
    iframe.onload = () => {
      document.getElementById('spinner').style.display = 'none';
    };
  }
  
  // Listen for messages from the iframe
  window.addEventListener('message', (event) => {
    if (event.source !== document.getElementById('sandbox-iframe').contentWindow) {
      return; // Ignore messages not from the iframe
    }
  
    const data = event.data;
    const outputElement = document.getElementById('output');
  
    if (['log', 'error', 'warn', 'info'].includes(data.type)) {
      outputElement.textContent += data.type.toUpperCase() + ': ' + data.message + '\n';
  
      if (data.type === 'error') {
        // Extract line number from error message
        const lineNumberMatch = data.message.match(/line (\d+)/);
        if (lineNumberMatch) {
          const lineNumber = parseInt(lineNumberMatch[1], 10) - 1; // Zero-based index
          editor.addLineClass(lineNumber, 'background', 'line-error');
        }
      }
    }
  });
  
  // Theme toggle
  let isDarkTheme = true;
  
  document.getElementById('theme-btn').addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    const theme = isDarkTheme ? 'dracula' : 'default';
    editor.setOption('theme', theme);
  
    // Toggle Bootstrap theme
    document.body.classList.toggle('bg-dark');
    document.body.classList.toggle('text-light');
    document.body.classList.toggle('bg-light');
    document.body.classList.toggle('text-dark');
  });
  
  // Font size adjustment
  document.getElementById('font-size').addEventListener('change', (e) => {
    const fontSize = e.target.value;
    editor.getWrapperElement().style.fontSize = fontSize;
  });
  
  // Editor theme switching
  document.getElementById('theme-select').addEventListener('change', (e) => {
    const theme = e.target.value;
    editor.setOption('theme', theme);
  });
  
  // Save and load code
  document.getElementById('save-btn').addEventListener('click', () => {
    const userCode = editor.getValue();
    localStorage.setItem('savedCode', userCode);
    alert('Code saved successfully.');
  });
  
  document.getElementById('load-btn').addEventListener('click', () => {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
      editor.setValue(savedCode);
    } else {
      alert('No saved code found.');
    }
  });
  
  // Clear output
  document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('output').textContent = '';
  });
  