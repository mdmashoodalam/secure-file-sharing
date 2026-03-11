import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  // Social media links with SVG icons
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/mdmashoodalam',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/mdmashoodalam/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.045-8.789 0-9.708h3.554v1.375c.424-.654 1.379-1.587 3.353-1.587 2.449 0 4.282 1.591 4.282 5.006v4.914zM5.337 9.433c-1.144 0-1.915-.757-1.915-1.705 0-.951.77-1.707 1.958-1.707 1.188 0 1.914.757 1.938 1.707 0 .948-.75 1.705-1.981 1.705zm1.946 11.019H3.39V9.744h3.893v10.708zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/mdmashoodalam',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.306l7.732-8.835L.424 2.25h6.771l4.6 6.088 5.313-6.088zM17.002 18.257h1.646L6.84 3.95H5.074l11.928 14.307z"/>
        </svg>
      )
    },
    {
      name: 'Email',
      url: 'mailto:mashoodalam05@gmail.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      )
    },
  ];

  return (
    <footer className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-white overflow-hidden border-t border-blue-700/30">
      
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        {/* Top left accent */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-conic from-blue-600 via-purple-600 to-blue-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse"></div>
        
        {/* Bottom right accent */}
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-conic from-cyan-600 via-blue-600 to-cyan-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Compact 2-row layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          
          {/* Left: Brand + Tech Stack */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/40 flex-shrink-0">
              <span className="text-lg">🔒</span>
            </div>
            
            {/* Brand Info */}
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                SecureShare
              </h3>
              <p className="text-xs text-gray-300 font-mono">Java • React • MySQL • AES-256</p>
            </div>
          </div>

          {/* Center: Developer Info + Socials */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-white">Md Mashood ALam</p>
              <p className="text-xs text-gray-300">Full-Stack Developer</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-gray-200 transition-all duration-300 hover:border-blue-400/50 hover:bg-white/15 hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Copyright + Status */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-300 font-medium">Active</span>
            </div>
            <p className="text-gray-400 whitespace-nowrap">&copy; {currentYear}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
