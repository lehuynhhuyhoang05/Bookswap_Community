// src/components/ui/Tooltip.jsx
const Tooltip = ({ children, content, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positions[position]} hidden group-hover:block z-50`}>
        <div className="bg-gray-900 text-white text-sm rounded py-1 px-2 whitespace-nowrap">
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === 'top' ? 'top-full -translate-x-1/2 left-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full -translate-x-1/2 left-1/2 -mb-1' :
            position === 'left' ? 'left-full -translate-y-1/2 top-1/2 -mr-1' :
            'right-full -translate-y-1/2 top-1/2 -ml-1'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;