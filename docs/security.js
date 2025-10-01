function validateParam(param) {
  if (!param || param.length === 0) return false; //not empty

  if (param.length > 50) return false; //max 50

  if (!/^[a-zA-Z0-9._-]+$/.test(param)) return false; //regex

  const prohibitedWords = [
    "script",
    "iframe",
    "eval",
    "alert",
    "document",
    "window",
    "cookie",
    "onclick",
    "onerror",
    "onload",
  ];
  const inputLower = param.toLowerCase();
  if (prohibitedWords.some((words) => inputLower.includes(words))) return false;

  return true;
}

function sanitize(txt) {
  return txt
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function blockAccess(reason) {
  document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        text-align: center;
        padding: 2rem;
        margin: 0;
      ">
        <!-- Warning Icon with Pulse Animation -->
        <div style="
          font-size: 5rem;
          margin-bottom: 1.5rem;
          animation: pulse 1.5s ease-in-out infinite;
        ">
          ⚠️
        </div>
        
        <!-- Main Title -->
        <h1 style="
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        ">
          Access Denied
        </h1>
        
        <!-- Description -->
        <p style="
          font-size: 1.125rem;
          max-width: 600px;
          line-height: 1.6;
          margin: 0 0 2rem 0;
          opacity: 0.95;
        ">
          Invalid parameter detected.<br>
          Suspicious activity has been logged and blocked.
        </p>
        
        <!-- Divider Line -->
        <div style="
          width: 80px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          margin: 1.5rem 0;
        "></div>
        
        <!-- Instructions -->
        <p style="
          font-size: 0.875rem;
          max-width: 500px;
          line-height: 1.5;
          opacity: 0.7;
          margin: 0;
        ">
          If you're a legitimate user, please use only allowed values:<br>
          <strong>letters, numbers, dots, hyphens, underscores</strong>
        </p>
        
        <!-- Footer Note -->
        <p style="
          font-size: 0.75rem;
          opacity: 0.5;
          margin-top: 3rem;
          font-family: 'Courier New', monospace;
        ">
          Security ID: ${Date.now().toString(36).toUpperCase()}
        </p>
        
        <!-- CSS Animations -->
        <style>
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
          
          /* Prevent any interaction */
          * {
            user-select: none;
            pointer-events: none;
          }
        </style>
      </div>
    `;
  throw new Error(`Access blocked: ${reason}`);
}

// putting everything together
function getSafeParam(NameParam, valueDefault = "downloads") {
  const params = new URLSearchParams(window.location.search);
  const param = params.get(NameParam);

  const valueFinal = param || valueDefault;

  if (!validateParam(valueFinal)) {
    blockAccess("Invalid parameter detected");
  }

  return sanitize(valueFinal);
}

export { validateParam, sanitize, getSafeParam };
