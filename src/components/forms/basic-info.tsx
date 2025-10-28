// components/forms/basic-info-section.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "../ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { getProgramDates } from '@/lib/api'
import { useEffect, useState } from "react"

interface ProgramDate {
    id: number
    attributes: {
      start_date: string
      end_date: string
      program: string
    }
  }
  

//import { FormData } from "./application-form" // assuming we put the FormData interface there

/**
 * // types/form.ts

export interface FormData {
  // Basic Info
  email: string
  firstName: string
  lastName: string
  programType: string
  programDate: string
  gender: string
  dateOfBirth: string
  currentAge: number
  phone: string
  maritalStatus: string
  nationality: string
  residence: string
  occupation: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email: string
    address: string
  }
  
  // Personal Essay
  personalEssay: string
  
  // Membership
  connection: string
  membershipStatus: string
  membershipDuration: string
  hasAttendedOnlineRetreats: boolean
  pastOnlineRetreatsDetails: string
  teachingsFamiliarity: string
  booksRead: string[]
  hasAtmanologySessions: boolean
  atmanologySessionsDetails: string
  spiritualPractice: string
  
  // Health
  hasHealthConditions: boolean
  healthConditionsDetails: string
  hasMedications: boolean
  medicationsDetails: string
  hasPastSurgeries: boolean
  pastSurgeriesDetails: string
  hasAnaphylaxis: boolean
  anaphylaxisDetails: string
  hasMentalHealthHistory: boolean
  mentalHealthDetails: string
  hasOtherMedicalConcerns: boolean
  otherMedicalConcernsDetails: string
  hasDietaryRestrictions: boolean
  dietaryRestrictionsDetails: string
  hasAllergies: boolean
  allergiesDetails: string
  hasSleepingIssues: boolean
  sleepingIssuesDetails: string
  
  // Covid Policy
  isVaccinated: boolean
  hasVaccinatedHousehold: boolean
  vaccinatedHouseholdDetails: string
  hasVaccinatedContact: boolean
  vaccinatedContactDetails: string
  hasMedicalFunds: boolean
  hasCurrentDoctor: boolean
  doctorContactDetails: string
  
  // Ashram Stay
  agreesToGuidelines: boolean
  guidelinesIssues: string
  hasSmokingHistory: boolean
  smokingHistoryDetails: string
  hasProgramFunds: boolean
  healthInsuranceStatus: string

  // Sevadhari specific fields
  passportNumber: string
  sevadhariMotivation: string
  strengthsWeaknesses: string
  communityLivingThoughts: string
  hasPastCommunityExperience: boolean
  pastCommunityExperienceDetails: string
  workSkills: string[]
  workExperience: string
  hasPsychologicalHistory: boolean
  psychologicalHistoryDetails: string
  commitmentLength: string
  agreesToSchedule: boolean
  scheduleIssuesDetails: string
}
 */

interface SectionProps {
    form: UseFormReturn<any>
  }

export function BasicInfoSection({ form }: SectionProps) {
    const [programDates, setProgramDates] = useState<ProgramDate[]>([])
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const programType = form.watch('programType')
  
    const formatDate = (isoDate: string) => {
        return new Date(isoDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
    useEffect(() => {
      if (programType) {
        getProgramDates(programType)
          .then(data => setProgramDates(data.data))
          .catch(error => console.error('Error:', error))
      }
    }, [programType])
    
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="programType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Type*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="shakti">Shakti Saturation Month</SelectItem>
                  <SelectItem value="sevadhari">Sevadhari Program</SelectItem>
                  <SelectItem value="darshan">Darshan Retreat</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
  control={form.control}
  name="programDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Program Date*</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select program dates" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {programDates.map((date) => (
            <SelectItem key={date.id} value={date.id.toString()}>
              {formatDate(date.attributes.start_date)} - {formatDate(date.attributes.end_date)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth*</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number*</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marital Status*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="separated">Separated</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="celibate">Celibate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="residence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residence (City, State/Province, Country)*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Photo Upload Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
        <div className="space-y-4">
          <div>
            <FormLabel>Upload a recent photo*</FormLabel>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setPhotoFile(file)
                    // Store filename in form
                    form.setValue('photoFileName', file.name)
                  }
                }}
                className="cursor-pointer"
              />
              {photoFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {photoFile.name}
                </p>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Please upload a clear, recent photo of yourself (JPG, PNG, max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergencyContact.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContact.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Spouse, Parent, Sibling" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone*</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email*</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyContact.address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Contact Address*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

// components/forms/personal-essay-section.tsx
export function PersonalEssaySection({ form }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="personalEssay"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Please tell us why you wish to participate in a Sat Yoga Ashram event*</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Write simply and from the heart, without worrying about language or style. You can give us a snapshot of your current life situation and how you envision your visit can be of benefit to you."
                className="min-h-[200px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// components/forms/membership-section.tsx
export function MembershipSection({ form }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="connection"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How did you hear about us?*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="past_visitor">Past Visitor</SelectItem>
                <SelectItem value="word_of_mouth">Word of Mouth</SelectItem>
                <SelectItem value="internet_search">Internet Search</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="membershipStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Are you currently a Sat Yoga online member?*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select membership status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="free_trial">Yes, I am on a free trial</SelectItem>
                <SelectItem value="gyani">Yes, I am a Gyani Member</SelectItem>
                <SelectItem value="vigyani">Yes, I am a Vigyani Member</SelectItem>
                <SelectItem value="pragyani">Yes, I am a Pragyani Member</SelectItem>
                <SelectItem value="none">No, I am not currently an online member</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hasAttendedOnlineRetreats"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Have you attended any of our past online retreats?*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('hasAttendedOnlineRetreats') === 'yes' && (
        <FormField
          control={form.control}
          name="pastOnlineRetreatsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify which retreats and dates</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="teachingsFamiliarity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How familiar are you with Shunyamurti's teachings?*</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Have you watched Shunyamurti's teachings online? What drew you to them and how have they helped you in your life?"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// components/forms/health-section.tsx
export function HealthSection({ form }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="hasHealthConditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Do you have any medical/health conditions?*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('hasHealthConditions') === 'yes' && (
        <FormField
          control={form.control}
          name="healthConditionsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please describe your health conditions</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="hasMedications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Are you currently taking any medications?*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('hasMedications') === 'yes' && (
        <FormField
          control={form.control}
          name="medicationsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please list your medications</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="hasDietaryRestrictions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Do you have any dietary restrictions?*</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('hasDietaryRestrictions') === 'yes' && (
        <FormField
          control={form.control}
          name="dietaryRestrictionsDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please describe your dietary restrictions</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

// components/forms/covid-policy-section.tsx (continued)
export function CovidPolicySection({ form }: SectionProps) {
    return (
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm mb-2">Our Ashram's Policy Regarding Those Who Received an Injection:</p>
          <p className="text-sm mb-2">
            The welfare of every soul is precious to us. We have a responsibility to provide the healthiest 
            environment possible for our community and all our visitors.
          </p>
          <p className="text-sm">
            Until we discover sufficient credible contradictory evidence, or an antidote, our duty requires 
            protecting our uninjected community and retreatants.
          </p>
        </div>
  
        <FormField
          control={form.control}
          name="isVaccinated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Have you received any version of the covid injection?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no">No, I have not taken the shot nor am planning to take it</SelectItem>
                  <SelectItem value="yes">Yes, I have taken the shot or have planned to do so</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="hasVaccinatedHousehold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Have you been living with anyone who has had the injection?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select yes or no" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        {form.watch('hasVaccinatedHousehold') === 'yes' && (
          <FormField
            control={form.control}
            name="vaccinatedHouseholdDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please provide details about duration and relationship</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    )
  }
  
  // components/forms/ashram-stay-section.tsx
  export function AshramStaySection({ form }: SectionProps) {
    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="agreesToGuidelines"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you agree to follow our Ashram Guidelines during your stay?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes, I have read and agree to follow the Ashram Guidelines</SelectItem>
                  <SelectItem value="no">No, I will have trouble following the Ashram Guidelines</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        {form.watch('agreesToGuidelines') === 'no' && (
          <FormField
            control={form.control}
            name="guidelinesIssues"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please explain what issues you may have with the guidelines</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
  
        <FormField
          control={form.control}
          name="hasSmokingHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have any smoking history?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select yes or no" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        {form.watch('hasSmokingHistory') === 'yes' && (
          <FormField
            control={form.control}
            name="smokingHistoryDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please provide details about your smoking history</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Include if you are currently trying to quit or using nicotine patches/gum"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
  
        <FormField
          control={form.control}
          name="hasProgramFunds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have funds available to cover the program contribution?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select yes or no" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="healthInsuranceStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have international health insurance?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your insurance status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="will_get">Not currently, but I would be able to get insurance if accepted</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )
  }
  
  export function SevadhariSection({ form }: SectionProps) {
    const [resumeFile, setResumeFile] = useState<File | null>(null)

    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="passportNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passport Number*</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="sevadhariMotivation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why do you desire to study and serve at the Sat Yoga Ashram?*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What do you hope to gain from your experience?"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="strengthsWeaknesses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you describe your strengths and weaknesses?*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please tell us about your interpersonal skills, how you deal with challenges, characteristics, talents, etc."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="communityLivingThoughts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What does it mean for you to live in community?*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="How would it challenge you? How would it help you grow? Are you comfortable with living and working in close quarters with others?"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="commitmentLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How long are you able to commit for?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select commitment length" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="three_months">3 months</SelectItem>
                  <SelectItem value="six_months">6 months</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="workSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Areas you are most qualified to work in:*</FormLabel>
              <Select onValueChange={(value) => field.onChange([...field.value, value])} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skills" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="gardens">Gardens & Landscaping</SelectItem>
                  <SelectItem value="healing">Healing & Healthcare</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping & Hospitality</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure & Construction</SelectItem>
                  <SelectItem value="kitchen">Kitchen & Food Processing</SelectItem>
                  <SelectItem value="media">Media & IT</SelectItem>
                  <SelectItem value="outreach">Outreach & Publications</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
  
        <FormField
          control={form.control}
          name="workExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What experience, training, or certifications do you have in the areas you chose?*</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resume/CV Upload */}
        <div className="pt-4">
          <FormLabel>Upload your CV/Resume*</FormLabel>
          <div className="mt-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setResumeFile(file)
                  form.setValue('resumeFileName', file.name)
                }
              }}
              className="cursor-pointer"
            />
            {resumeFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {resumeFile.name}
              </p>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Please upload your resume or CV (PDF, DOC, DOCX, max 5MB)
          </p>
        </div>
      </div>
    )
  }
  