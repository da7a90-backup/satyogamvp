export const generateMockData = (count: number) => {
    const programs = ['shakti', 'sevadhari', 'darshan']
    const statuses = ['pending', 'under_review', 'accepted', 'rejected']
    const nationalities = ['USA', 'Canada', 'UK', 'France', 'Germany', 'Spain', 'Brazil', 'Mexico', 'India', 'Australia']
    const maritalStatuses = ['single', 'married', 'divorced', 'widowed', 'separated', 'partnership', 'celibate']
    const membershipStatuses = ['free_trial', 'gyani', 'vigyani', 'pragyani', 'none']
    const connectionSources = ['past_visitor', 'word_of_mouth', 'internet_search', 'newsletter', 'youtube', 'facebook', 'twitter', 'instagram', 'podcast']
  
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      attributes: {
        email: `user${index + 1}@example.com`,
        firstName: `FirstName${index + 1}`,
        lastName: `LastName${index + 1}`,
        programType: programs[Math.floor(Math.random() * programs.length)],
        programDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        dateOfBirth: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        currentAge: 25 + Math.floor(Math.random() * 40),
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        maritalStatus: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        residence: `City${index + 1}, Country${index + 1}`,
        occupation: `Occupation${index + 1}`,
        
        // Membership details
        connection: connectionSources[Math.floor(Math.random() * connectionSources.length)],
        membershipStatus: membershipStatuses[Math.floor(Math.random() * membershipStatuses.length)],
        hasAttendedOnlineRetreats: Math.random() > 0.5,
        teachingsFamiliarity: `Experience level ${Math.floor(Math.random() * 5) + 1}/5`,
        
        // Health information
        hasHealthConditions: Math.random() > 0.7,
        hasMedications: Math.random() > 0.7,
        hasDietaryRestrictions: Math.random() > 0.6,
        
        // Covid status
        isVaccinated: Math.random() > 0.5,
        hasVaccinatedHousehold: Math.random() > 0.5,
        
        // Program status
        status: statuses[Math.floor(Math.random() * statuses.length)],
        hasProgramFunds: Math.random() > 0.2,
        healthInsuranceStatus: ['yes', 'no', 'will_get'][Math.floor(Math.random() * 3)],
        
        // Timestamps
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        updatedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      }
    }))
  }
  