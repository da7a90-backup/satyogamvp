import TwoPaneComponent from '@/components/shared/TwoPaneComponent';

const QuestionsAnswersSection = () => {
  const questionsAnswersData = {
    mediaPosition: 'bottom' as const, // Video appears below the text
    topMedia: {
      type: 'video' as const,
      src: 'https://www.youtube.com/embed/nNXIRawMqZM', // Replace with actual YouTube video ID
      thumbnail: '/qna.jpg',
      aspectRatio: '1312/738',
      videoType: 'youtube' as const
    },
    leftPane: {
      title: "Questions and Answers with Shunyamurti"
    },
    rightPane: {
      type: 'paragraphs' as const,
      gap: '16px',
      content: [
        "One of the greatest joys of ashram life is gathering for sacred satsangs with Shunyamurti. These intimate meetings offer a rare opportunity to ask the deepest questions of the heart and receive precious guidance and Darshan."
      ]
    }
  };

  return <TwoPaneComponent data={questionsAnswersData} />;
};

export default QuestionsAnswersSection;