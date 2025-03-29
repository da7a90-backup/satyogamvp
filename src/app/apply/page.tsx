import { ApplicationForm } from "@/components/forms/application-form"
import { Toaster } from "@/components/ui/toaster"

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-background">
      <ApplicationForm />
      <Toaster />
    </main>
  )
}