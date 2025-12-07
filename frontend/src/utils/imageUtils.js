/**
 * Image utilities for handling book covers and fallback images
 */

/**
 * Get a valid book cover URL with fallback
 * @param {string} coverUrl - Original cover image URL
 * @param {string} bookTitle - Book title for placeholder
 * @param {object} options - Options for placeholder (bgColor, width, height, etc.)
 * @returns {string} Valid image URL
 */
export const getBookCoverUrl = (coverUrl, bookTitle = 'Book', options = {}) => {
  // If no cover URL provided, return placeholder
  if (!coverUrl || coverUrl.trim() === '') {
    return createPlaceholderUrl(bookTitle, options);
  }

  // If it's a relative URL (starts with /), keep it as is
  if (coverUrl.startsWith('/')) {
    return coverUrl;
  }

  // Check if URL is valid absolute URL
  try {
    const url = new URL(coverUrl);
    
    // Check if it's a known problematic source
    if (isProblematicSource(url.hostname)) {
      return createPlaceholderUrl(bookTitle, options);
    }

    // Ensure HTTPS for external sources
    if (url.protocol === 'http:') {
      return coverUrl.replace('http:', 'https:');
    }

    return coverUrl;
  } catch (error) {
    // Not a valid absolute URL, but might be a valid relative path or data URI
    // Check if it's a data URI
    if (coverUrl.startsWith('data:')) {
      return coverUrl;
    }
    
    // If it looks like a path, keep it
    if (coverUrl.includes('.') && (coverUrl.includes('/') || coverUrl.includes('\\'))) {
      return coverUrl;
    }
    
    // Otherwise return placeholder
    return createPlaceholderUrl(bookTitle, options);
  }
};

/**
 * Create a placeholder image URL using SVG data URI (always reliable)
 * @param {string} text - Text to display on placeholder
 * @param {object} options - Options for placeholder
 * @returns {string} SVG data URI (no network required)
 */
export const createPlaceholderUrl = (text = 'Book', options = {}) => {
  const {
    width = 300,
    height = 400,
    bgColor = '6366F1', // Indigo-500
    textColor = 'FFFFFF', // White
    maxLength = 15
  } = options;

  // Always use SVG data URI (no external services that might fail)
  const displayText = text.substring(0, maxLength);
  const bgColorHex = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;
  const textColorHex = textColor.startsWith('#') ? textColor : `#${textColor}`;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColorHex}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="${textColorHex}" text-anchor="middle" dominant-baseline="middle">
        ${displayText}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
};

/**
 * Check if hostname is from a known problematic source
 * @param {string} hostname - URL hostname
 * @returns {boolean} True if problematic
 */
const isProblematicSource = (hostname) => {
  const problematicSources = [
    // OpenLibrary is slow but works - removed from blacklist
    // Add problematic sources here if needed (sources that never load)
  ];

  return problematicSources.some(source => hostname.includes(source));
};

/**
 * Handle image loading error with SVG data URI fallback
 * @param {Event} event - Error event
 * @param {string} bookTitle - Book title for fallback
 * @param {object} options - Placeholder options
 */
export const handleImageError = (event, bookTitle = 'Book', options = {}) => {
  // Prevent infinite loop - if already showing fallback, hide the image
  if (event.target.dataset.fallbackAttempted === 'true') {
    event.target.style.display = 'none';
    return;
  }
  
  // Mark as fallback attempted and use SVG data URI (guaranteed to work)
  event.target.dataset.fallbackAttempted = 'true';
  event.target.src = createPlaceholderUrl(bookTitle, options);
};

/**
 * Get color for placeholder based on category
 * @param {string} category - Book category
 * @returns {string} Hex color code
 */
export const getCategoryColor = (category) => {
  const colors = {
    'Fiction': '8B5CF6', // Purple
    'Non-Fiction': '3B82F6', // Blue
    'Science': '10B981', // Green
    'Technology': '06B6D4', // Cyan
    'Programming': '6366F1', // Indigo
    'History': 'F59E0B', // Amber
    'Biography': 'EC4899', // Pink
    'Business': 'EF4444', // Red
    'Education': '14B8A6', // Teal
    'default': '6B7280' // Gray
  };

  return colors[category] || colors['default'];
};

/**
 * Preload image to check if it's valid
 * @param {string} url - Image URL
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
};

/**
 * Get optimized image URL for different sizes
 * @param {string} url - Original image URL
 * @param {string} size - Size variant (small, medium, large)
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, size = 'medium') => {
  // For Google Books thumbnails
  if (url.includes('books.google.com')) {
    const sizeParams = {
      small: '&zoom=1',
      medium: '&zoom=2',
      large: '&zoom=3'
    };
    return url.includes('zoom=') 
      ? url.replace(/zoom=\d/, `zoom=${size === 'small' ? 1 : size === 'large' ? 3 : 2}`)
      : url + sizeParams[size];
  }

  // For Open Library covers
  if (url.includes('covers.openlibrary.org')) {
    const sizeMap = {
      small: 'S',
      medium: 'M',
      large: 'L'
    };
    return url.replace(/-[SML]\.jpg$/, `-${sizeMap[size]}.jpg`);
  }

  return url;
};
