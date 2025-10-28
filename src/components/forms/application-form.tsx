// components/forms/application-form.tsx
'use client'

import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { BasicInfoSection, PersonalEssaySection, MembershipSection, HealthSection,
         CovidPolicySection, AshramStaySection, SevadhariSection } from "./basic-info"

import { useToast } from "@/hooks/use-toast"

const sections = [
  "Basic Information",
  "Personal Essay",
  "Membership & Teachings",
  "Health Information",
  "Covid Policy",
  "Ashram Stay",
  "Sevadhari Questions"
]

export function ApplicationForm() {
  const [currentSection, setCurrentSection] = useState(0)
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      // Basic Info
      email: "",
      firstName: "",
      lastName: "",
      programType: "",
      programDate: "",
      gender: "",
      dateOfBirth: "",
      currentAge: "",
      phone: "",
      maritalStatus: "",
      nationality: "",
      residence: "",
      occupation: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
        email: "",
        address: ""
      },
      
      // Personal Essay
      personalEssay: "",
      
      // Membership
      connection: "",
      membershipStatus: "",
      membershipDuration: "",
      hasAttendedOnlineRetreats: "",
      pastOnlineRetreatsDetails: "",
      teachingsFamiliarity: "",
      booksRead: [],
      hasAtmanologySessions: "",
      atmanologySessionsDetails: "",
      spiritualPractice: "",
      
      // Health
      hasHealthConditions: "",
      healthConditionsDetails: "",
      hasMedications: "",
      medicationsDetails: "",
      hasPastSurgeries: "",
      pastSurgeriesDetails: "",
      hasAnaphylaxis: "",
      anaphylaxisDetails: "",
      hasMentalHealthHistory: "",
      mentalHealthDetails: "",
      hasOtherMedicalConcerns: "",
      otherMedicalConcernsDetails: "",
      hasDietaryRestrictions: "",
      dietaryRestrictionsDetails: "",
      hasAllergies: "",
      allergiesDetails: "",
      hasSleepingIssues: "",
      sleepingIssuesDetails: "",
      
      // Covid Policy
      isVaccinated: "",
      hasVaccinatedHousehold: "",
      vaccinatedHouseholdDetails: "",
      hasVaccinatedContact: "",
      vaccinatedContactDetails: "",
      hasMedicalFunds: "",
      hasCurrentDoctor: "",
      doctorContactDetails: "",
      
      // Ashram Stay
      agreesToGuidelines: "",
      guidelinesIssues: "",
      hasSmokingHistory: "",
      smokingHistoryDetails: "",
      hasProgramFunds: "",
      healthInsuranceStatus: "",

      // Sevadhari specific fields (only shown if programType === "sevadhari")
      passportNumber: "",
      sevadhariMotivation: "",
      strengthsWeaknesses: "",
      communityLivingThoughts: "",
      hasPastCommunityExperience: "",
      pastCommunityExperienceDetails: "",
      workSkills: [],
      workExperience: "",
      hasPsychologicalHistory: "",
      psychologicalHistoryDetails: "",
      commitmentLength: "",
      agreesToSchedule: "",
      scheduleIssuesDetails: "",

      // File uploads
      photoFileName: "",
      resumeFileName: "",
    }
  })

  const programType = form.watch("programType")
  const isSevadhariProgram = programType === "sevadhari"

  const onSubmit = async (data: any) => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(current => current + 1)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      toast({
        title: "Success",
        description: "Your application has been submitted successfully.",
      })

      // Optionally reset form or redirect
      // form.reset()
      // router.push('/thank-you')
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

    // Adjust total sections based on program type
    const totalSections = isSevadhariProgram ? sections.length : sections.length - 1


  const progress = ((currentSection + 1) / sections.length) * 100

  

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{sections[currentSection]}</CardTitle>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentSection === 0 && <BasicInfoSection form={form} />}
              {currentSection === 1 && <PersonalEssaySection form={form} />}
              {currentSection === 2 && <MembershipSection form={form} />}
              {currentSection === 3 && <HealthSection form={form} />}
              {currentSection === 4 && <CovidPolicySection form={form} />}
              {currentSection === 5 && <AshramStaySection form={form} />}
              {isSevadhariProgram && currentSection === 6 && <SevadhariSection form={form} />}

              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentSection(current => Math.max(0, current - 1))}
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>
                <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? 'Submitting...' 
            : currentSection === (isSevadhariProgram ? sections.length - 1 : sections.length - 2)
              ? 'Submit Application' 
              : 'Next'
          }
        </Button>

              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}