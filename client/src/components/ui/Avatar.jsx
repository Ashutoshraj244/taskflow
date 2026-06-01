import { initials, colorFromString } from '../../utils';

const Avatar = ({ name = '', src, size = 'sm', className = '' }) => {
  const sizeMap = {
    xs: 'w-5 h-5 text-2xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  const bg = colorFromString(name);

  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ backgroundColor: bg + '30', color: bg }}
      title={name}
    >
      {initials(name)}
    </div>
  );
};

export default Avatar;
