import { Suspense } from 'react';
import { getFormBySlug } from '@/lib/dynamic-forms-api';
import { MultiStepDynamicForm } from '@/components/forms/MultiStepDynamicForm';
import { FormTemplate, FormQuestion } from '@/types/dynamic-form';

interface ApplyPageProps {
  searchParams: Promise<{
    form?: string;
    memberDiscount?: string;
    retreatId?: string;
  }>;
}

// Transform backend questions array into sections structure
function transformFormData(formData: FormTemplate): FormTemplate {
  if (!formData.questions || formData.questions.length === 0) {
    return formData;
  }

  // Group questions by page_number
  const questionsByPage = formData.questions.reduce((acc, question) => {
    const page = question.page_number || 1;
    if (!acc[page]) {
      acc[page] = [];
    }
    acc[page].push(question);
    return acc;
  }, {} as Record<number, FormQuestion[]>);

  // Convert to sections array
  const sections = Object.entries(questionsByPage)
    .map(([pageNumber, questions]) => {
      // Sort questions by order_index
      const sortedQuestions = [...questions].sort((a, b) =>
        (a.order_index || 0) - (b.order_index || 0)
      );

      // Get section heading from first question with section_heading, or use default
      const sectionHeading = sortedQuestions.find(q => q.section_heading)?.section_heading
        || `Step ${pageNumber}`;

      return {
        id: `section-${pageNumber}`,
        form_template_id: formData.id,
        title: sectionHeading,
        description: null,
        order: parseInt(pageNumber),
        tagline: null,
        image_url: null,
        fields: sortedQuestions.map(q => {
          // Map backend question types to frontend field types
          let fieldType = q.question_type.toUpperCase();
          if (fieldType === 'TEL') fieldType = 'PHONE';
          if (fieldType === 'DROPDOWN') fieldType = 'SELECT';

          // If it's a FILE field with image/* allowed, treat it as PHOTO (with face detection)
          if (fieldType === 'FILE' && q.allowed_file_types?.some(type => type.includes('image'))) {
            fieldType = 'PHOTO';
          }

          return {
            id: q.id,
            section_id: `section-${pageNumber}`,
            label: q.question_text,
            field_type: fieldType as any,
            placeholder: q.placeholder,
            help_text: q.description,
            is_required: q.is_required,
            order: q.order_index || 0,
            options: q.options,
            validation_rules: q.validation_rules,
            group_id: null,
            width: null
          };
        })
      };
    })
    .sort((a, b) => a.order - b.order);

  return {
    ...formData,
    sections: sections as any
  };
}

// Loading component
function FormLoading() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
        <p className="font-['Avenir_Next'] text-[16px] text-[#717680]">Loading form...</p>
      </div>
    </div>
  );
}

// Error component
function FormError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-[#CBCBCB] rounded-[8px] p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-[#942017]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="font-['Inter'] text-[24px] font-bold text-black mb-2">Form Not Found</h2>
        <p className="font-['Avenir_Next'] text-[16px] text-[#717680] mb-6">{message}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[#7D1A13] text-white rounded-[8px] font-['Avenir_Next'] font-semibold text-[16px] hover:bg-[#6a1610] transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const formSlug = params.form;
  const memberDiscount = params.memberDiscount === 'true';
  const retreatId = params.retreatId;

  if (!formSlug) {
    return (
      <FormError message="No form specified. Please provide a form slug in the URL query parameter." />
    );
  }

  try {
    const rawFormData = await getFormBySlug(formSlug);

    if (!rawFormData.is_active) {
      return <FormError message="This form is not currently available." />;
    }

    // Transform the backend data structure to match component expectations
    const formData = transformFormData(rawFormData);

    return (
      <Suspense fallback={<FormLoading />}>
        <MultiStepDynamicForm
          formData={formData}
          memberDiscountEligible={memberDiscount}
          retreatId={retreatId}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching form:', error);
    return (
      <FormError
        message={
          error instanceof Error
            ? error.message
            : 'The requested form could not be found. Please check the URL and try again.'
        }
      />
    );
  }
}
