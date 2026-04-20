const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-300 rounded-md ${className}`} />
  );
};
 

export default Skeleton;
