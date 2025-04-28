import CourseClassPage from '@/components/dashboard/course/user/CourseClassPage';

export default function CourseClassRoute({ params }: { params: { slug: string, id: string } }) {
  return <CourseClassPage course