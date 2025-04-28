import {
  PlayCircleIcon,
  MeditationIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface CourseFeatureProps {
  features: {
    videoClasses: string;
    guidedMeditations: string;
    studyMaterials: string;
    supportInfo: string;
    curriculumAids: string;
  };
}

// Helper function to create icons
const MeditationIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2c.9 0 1.8.4 2.5 1 3.2 2.6 4.7 6.5 4.5 10.5-.2 3.3-1.3 6.8-4.5 9.5-.7.6-1.6 1-2.5 1-.9 0-1.8-.4-2.5-1-3.2-2.7-4.3-6.2-4.5-9.5-.2-4 1.3-7.9 4.5-10.5.7-.6 1.6-1 2.5-1z" />
    <path d="M12 15.5c1.7 0 3-1.8 3-4s-1.3-4-3-4-3 1.8-3 4 1.3 4 3 4z" />
  </svg>
);

const CourseFeatures = ({ features }: CourseFeatureProps) => {
  return (
    <div className="space-y-4">
      {features.videoClasses && (
        <div className="flex">
          <PlayCircleIcon className="h-6 w-6 text-purple-700 mr-3 flex-shrink-0" />
          <div>
            <p className="text-gray-800">{features.videoClasses}</p>
          </div>
        </div>
      )}

      {features.guidedMeditations && (
        <div className="flex">
          <MeditationIcon className="h-6 w-6 text-purple-700 mr-3 flex-shrink-0" />
          <div>
            <p className="text-gray-800">{features.guidedMeditations}</p>
          </div>
        </div>
      )}

      {features.studyMaterials && (
        <div className="flex">
          <DocumentTextIcon className="h-6 w-6 text-purple-700 mr-3 flex-shrink-0" />
          <div>
            <p className="text-gray-800">{features.studyMaterials}</p>
          </div>
        </div>
      )}

      {features.supportInfo && (
        <div className="flex">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-700 mr-3 flex-shrink-0" />
          <div>
            <p className="text-gray-800">{features.supportInfo}</p>
          </div>
        </div>
      )}

      {features.curriculumAids && (
        <div className="flex">
          <AcademicCapIcon className="h-6 w-6 text-purple-700 mr-3 flex-shrink-0" />
          <div>
            <p className="text-gray-800">{features.curriculumAids}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseFeatures;
