interface LearningPoint {
  title: string;
  description: string;
}

interface LearningPointsProps {
  learningPoints: LearningPoint[];
}

const LearningPoints = ({ learningPoints }: LearningPointsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {learningPoints.map((point, index) => (
        <div key={index} className="bg-purple-50 p-5 rounded-lg">
          <h3 className="text-lg font-bold text-purple-800 mb-2">
            {point.title}
          </h3>
          <p className="text-gray-700">{point.description}</p>
        </div>
      ))}
    </div>
  );
};

export default LearningPoints;
