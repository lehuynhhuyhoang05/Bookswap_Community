const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  if (src) {
    return (
      <img
        className={`${sizes[size]} rounded-full object-cover ${className}`}
        src={src}
        alt={alt}
      />
    );
  }

  return (
    <div className={`${sizes[size]} bg-gray-300 rounded-full flex items-center justify-center ${className}`}>
      <span className="text-gray-600 font-medium text-sm">
        {alt ? alt.charAt(0).toUpperCase() : 'U'}
      </span>
    </div>
  );
};

export default Avatar;