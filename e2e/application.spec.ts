import { test, expect } from '@playwright/test';

test.describe('Retreat Application Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apply');
  });

  test.describe('Form Navigation', () => {
    test('should display application form with progress bar', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      // Progress bar should be visible
      await expect(page.locator('[role="progressbar"]')).toBeVisible();
    });

    test('should disable previous button on first section', async ({ page }) => {
      const previousButton = page.getByRole('button', { name: 'Previous' });
      await expect(previousButton).toBeDisabled();
    });

    test('should navigate to next section on clicking Next', async ({ page }) => {
      // Fill required fields in basic info
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');

      // Select program type
      await page.click('[name="programType"]');
      await page.click('text=Shakti Saturation Month');

      // Wait for program dates to load
      await page.waitForTimeout(1000);

      // Select other required fields
      await page.click('[name="gender"]');
      await page.click('text=Male');

      await page.fill('input[name="dateOfBirth"]', '1990-01-01');
      await page.fill('input[name="phone"]', '+1234567890');

      await page.click('[name="maritalStatus"]');
      await page.click('text=Single');

      await page.fill('input[name="nationality"]', 'USA');
      await page.fill('input[name="residence"]', 'San Francisco, CA, USA');
      await page.fill('input[name="occupation"]', 'Software Engineer');

      // Click next
      await page.click('button:has-text("Next")');

      // Should show Personal Essay section
      await expect(page.getByRole('heading', { name: 'Personal Essay' })).toBeVisible();
    });

    test('should navigate back to previous section', async ({ page }) => {
      // Fill basic info and go to next section
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');

      await page.click('[name="programType"]');
      await page.click('text=Darshan Retreat');
      await page.waitForTimeout(1000);

      await page.click('[name="gender"]');
      await page.click('text=Female');

      await page.fill('input[name="dateOfBirth"]', '1985-05-15');
      await page.fill('input[name="phone"]', '+9876543210');

      await page.click('[name="maritalStatus"]');
      await page.click('text=Married');

      await page.fill('input[name="nationality"]', 'Canada');
      await page.fill('input[name="residence"]', 'Toronto, ON, Canada');
      await page.fill('input[name="occupation"]', 'Teacher');

      await page.click('button:has-text("Next")');

      // Now on Personal Essay
      await expect(page.getByRole('heading', { name: 'Personal Essay' })).toBeVisible();

      // Click previous
      await page.click('button:has-text("Previous")');

      // Should be back on Basic Information
      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();

      // Form data should be preserved
      await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
      await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
    });
  });

  test.describe('Basic Information Section', () => {
    test('should display all required fields', async ({ page }) => {
      // Check all form fields are present
      await expect(page.getByLabel('Email Address*')).toBeVisible();
      await expect(page.getByLabel('First Name*')).toBeVisible();
      await expect(page.getByLabel('Last Name*')).toBeVisible();
      await expect(page.getByLabel('Program Type*')).toBeVisible();
      await expect(page.getByLabel('Gender*')).toBeVisible();
      await expect(page.getByLabel('Date of Birth*')).toBeVisible();
      await expect(page.getByLabel('Phone Number*')).toBeVisible();
      await expect(page.getByLabel('Marital Status*')).toBeVisible();
      await expect(page.getByLabel('Nationality*')).toBeVisible();
      await expect(page.getByLabel(/Residence/i)).toBeVisible();
      await expect(page.getByLabel('Occupation*')).toBeVisible();
    });

    test('should have all three program types', async ({ page }) => {
      await page.click('[name="programType"]');

      await expect(page.getByText('Shakti Saturation Month')).toBeVisible();
      await expect(page.getByText('Sevadhari Program')).toBeVisible();
      await expect(page.getByText('Darshan Retreat')).toBeVisible();
    });

    test('should load program dates after selecting program type', async ({ page }) => {
      await page.click('[name="programType"]');
      await page.click('text=Shakti Saturation Month');

      // Wait for program dates to load
      await page.waitForTimeout(1500);

      // Program date field should be visible
      await expect(page.getByLabel('Program Date*')).toBeVisible();
    });

    test('should have all marital status options', async ({ page }) => {
      await page.click('[name="maritalStatus"]');

      await expect(page.getByText('Single')).toBeVisible();
      await expect(page.getByText('Married')).toBeVisible();
      await expect(page.getByText('Widowed')).toBeVisible();
      await expect(page.getByText('Divorced')).toBeVisible();
      await expect(page.getByText('Separated')).toBeVisible();
      await expect(page.getByText('Partnership')).toBeVisible();
      await expect(page.getByText('Celibate')).toBeVisible();
    });
  });

  test.describe('Personal Essay Section', () => {
    test.beforeEach(async ({ page }) => {
      // Fill basic info to get to personal essay
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="firstName"]', 'Jane');
      await page.fill('input[name="lastName"]', 'Smith');

      await page.click('[name="programType"]');
      await page.click('text=Darshan Retreat');
      await page.waitForTimeout(1000);

      await page.click('[name="gender"]');
      await page.click('text=Female');

      await page.fill('input[name="dateOfBirth"]', '1992-03-20');
      await page.fill('input[name="phone"]', '+1555555555');

      await page.click('[name="maritalStatus"]');
      await page.click('text=Single');

      await page.fill('input[name="nationality"]', 'UK');
      await page.fill('input[name="residence"]', 'London, UK');
      await page.fill('input[name="occupation"]', 'Artist');

      await page.click('button:has-text("Next")');
    });

    test('should display personal essay textarea', async ({ page }) => {
      await expect(page.getByLabel(/Please tell us why you wish to participate/i)).toBeVisible();
    });

    test('should allow filling personal essay', async ({ page }) => {
      const essay = 'I have been following Shunyamurti\'s teachings for several years and feel called to deepen my practice through direct experience at the ashram.';

      await page.fill('textarea[name="personalEssay"]', essay);
      await expect(page.locator('textarea[name="personalEssay"]')).toHaveValue(essay);
    });
  });

  test.describe('Membership Section', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to membership section
      await fillBasicInfo(page);
      await page.click('button:has-text("Next")');

      // Fill personal essay
      await page.fill('textarea[name="personalEssay"]', 'Test essay content');
      await page.click('button:has-text("Next")');
    });

    test('should display membership questions', async ({ page }) => {
      await expect(page.getByLabel(/How did you hear about us/i)).toBeVisible();
      await expect(page.getByLabel(/Are you currently a Sat Yoga online member/i)).toBeVisible();
      await expect(page.getByLabel(/Have you attended any of our past online retreats/i)).toBeVisible();
      await expect(page.getByLabel(/How familiar are you with Shunyamurti's teachings/i)).toBeVisible();
    });

    test('should show conditional fields based on online retreat attendance', async ({ page }) => {
      // Select yes for online retreats
      await page.click('[name="hasAttendedOnlineRetreats"]');
      await page.click('text=Yes');

      // Details field should appear
      await expect(page.getByLabel(/Please specify which retreats and dates/i)).toBeVisible();
    });

    test('should have all membership status options', async ({ page }) => {
      await page.click('[name="membershipStatus"]');

      await expect(page.getByText(/free trial/i)).toBeVisible();
      await expect(page.getByText(/Gyani Member/i)).toBeVisible();
      await expect(page.getByText(/Vigyani Member/i)).toBeVisible();
      await expect(page.getByText(/Pragyani Member/i)).toBeVisible();
      await expect(page.getByText(/not currently an online member/i)).toBeVisible();
    });
  });

  test.describe('Health Section', () => {
    test.beforeEach(async ({ page }) => {
      await fillBasicInfo(page);
      await page.click('button:has-text("Next")');
      await page.fill('textarea[name="personalEssay"]', 'Test essay');
      await page.click('button:has-text("Next")');
      await fillMembershipSection(page);
      await page.click('button:has-text("Next")');
    });

    test('should display health questions', async ({ page }) => {
      await expect(page.getByLabel(/Do you have any medical\/health conditions/i)).toBeVisible();
      await expect(page.getByLabel(/Are you currently taking any medications/i)).toBeVisible();
      await expect(page.getByLabel(/Do you have any dietary restrictions/i)).toBeVisible();
    });

    test('should show conditional fields for health conditions', async ({ page }) => {
      await page.click('[name="hasHealthConditions"]');
      await page.click('text=Yes');

      await expect(page.getByLabel(/Please describe your health conditions/i)).toBeVisible();
    });

    test('should show conditional fields for medications', async ({ page }) => {
      await page.click('[name="hasMedications"]');
      await page.click('text=Yes');

      await expect(page.getByLabel(/Please list your medications/i)).toBeVisible();
    });

    test('should show conditional fields for dietary restrictions', async ({ page }) => {
      await page.click('[name="hasDietaryRestrictions"]');
      await page.click('text=Yes');

      await expect(page.getByLabel(/Please describe your dietary restrictions/i)).toBeVisible();
    });
  });

  test.describe('COVID Policy Section', () => {
    test.beforeEach(async ({ page }) => {
      await fillBasicInfo(page);
      await page.click('button:has-text("Next")');
      await page.fill('textarea[name="personalEssay"]', 'Test essay');
      await page.click('button:has-text("Next")');
      await fillMembershipSection(page);
      await page.click('button:has-text("Next")');
      await fillHealthSection(page);
      await page.click('button:has-text("Next")');
    });

    test('should display COVID policy notice', async ({ page }) => {
      await expect(page.getByText(/Our Ashram's Policy Regarding Those Who Received an Injection/i)).toBeVisible();
    });

    test('should display vaccination questions', async ({ page }) => {
      await expect(page.getByLabel(/Have you received any version of the covid injection/i)).toBeVisible();
      await expect(page.getByLabel(/Have you been living with anyone who has had the injection/i)).toBeVisible();
    });

    test('should show conditional fields for vaccinated household', async ({ page }) => {
      await page.click('[name="hasVaccinatedHousehold"]');
      await page.click('text=Yes');

      await expect(page.getByLabel(/Please provide details about duration and relationship/i)).toBeVisible();
    });
  });

  test.describe('Ashram Stay Section', () => {
    test.beforeEach(async ({ page }) => {
      await fillBasicInfo(page);
      await page.click('button:has-text("Next")');
      await page.fill('textarea[name="personalEssay"]', 'Test essay');
      await page.click('button:has-text("Next")');
      await fillMembershipSection(page);
      await page.click('button:has-text("Next")');
      await fillHealthSection(page);
      await page.click('button:has-text("Next")');
      await fillCovidSection(page);
      await page.click('button:has-text("Next")');
    });

    test('should display ashram stay questions', async ({ page }) => {
      await expect(page.getByLabel(/Do you agree to follow our Ashram Guidelines/i)).toBeVisible();
      await expect(page.getByLabel(/Do you have any smoking history/i)).toBeVisible();
      await expect(page.getByLabel(/Do you have funds available to cover the program contribution/i)).toBeVisible();
      await expect(page.getByLabel(/Do you have international health insurance/i)).toBeVisible();
    });

    test('should show conditional fields for guideline issues', async ({ page }) => {
      await page.click('[name="agreesToGuidelines"]');
      await page.click('text=No, I will have trouble');

      await expect(page.getByLabel(/Please explain what issues you may have/i)).toBeVisible();
    });

    test('should show conditional fields for smoking history', async ({ page }) => {
      await page.click('[name="hasSmokingHistory"]');
      await page.click('text=Yes');

      await expect(page.getByLabel(/Please provide details about your smoking history/i)).toBeVisible();
    });

    test('should have health insurance options', async ({ page }) => {
      await page.click('[name="healthInsuranceStatus"]');

      await expect(page.getByText('Yes')).toBeVisible();
      await expect(page.getByText('No')).toBeVisible();
      await expect(page.getByText(/Not currently, but I would be able to get insurance/i)).toBeVisible();
    });
  });

  test.describe('Sevadhari Specific Section', () => {
    test.beforeEach(async ({ page }) => {
      // Fill basic info with Sevadhari program type
      await page.fill('input[name="email"]', 'sevadhari@example.com');
      await page.fill('input[name="firstName"]', 'Alex');
      await page.fill('input[name="lastName"]', 'Johnson');

      await page.click('[name="programType"]');
      await page.click('text=Sevadhari Program');
      await page.waitForTimeout(1000);

      await page.click('[name="gender"]');
      await page.click('text=Male');

      await page.fill('input[name="dateOfBirth"]', '1988-07-10');
      await page.fill('input[name="phone"]', '+1999999999');

      await page.click('[name="maritalStatus"]');
      await page.click('text=Single');

      await page.fill('input[name="nationality"]', 'Australia');
      await page.fill('input[name="residence"]', 'Sydney, Australia');
      await page.fill('input[name="occupation"]', 'Carpenter');

      await page.click('button:has-text("Next")');
      await page.fill('textarea[name="personalEssay"]', 'Test essay for sevadhari');
      await page.click('button:has-text("Next")');
      await fillMembershipSection(page);
      await page.click('button:has-text("Next")');
      await fillHealthSection(page);
      await page.click('button:has-text("Next")');
      await fillCovidSection(page);
      await page.click('button:has-text("Next")');
      await fillAshramStaySection(page);
      await page.click('button:has-text("Next")');
    });

    test('should display sevadhari specific questions', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Sevadhari Questions' })).toBeVisible();

      await expect(page.getByLabel('Passport Number*')).toBeVisible();
      await expect(page.getByLabel(/Why do you desire to study and serve at the Sat Yoga Ashram/i)).toBeVisible();
      await expect(page.getByLabel(/How would you describe your strengths and weaknesses/i)).toBeVisible();
      await expect(page.getByLabel(/What does it mean for you to live in community/i)).toBeVisible();
      await expect(page.getByLabel(/How long are you able to commit for/i)).toBeVisible();
    });

    test('should have work skills dropdown', async ({ page }) => {
      await expect(page.getByLabel(/Areas you are most qualified to work in/i)).toBeVisible();

      await page.click('[name="workSkills"]');
      await expect(page.getByText('Administration')).toBeVisible();
      await expect(page.getByText('Agriculture')).toBeVisible();
      await expect(page.getByText('Fundraising')).toBeVisible();
      await expect(page.getByText(/Kitchen & Food Processing/i)).toBeVisible();
    });

    test('should have commitment length options', async ({ page }) => {
      await page.click('[name="commitmentLength"]');

      await expect(page.getByText('3 months')).toBeVisible();
      await expect(page.getByText('6 months')).toBeVisible();
    });

    test('should show Submit button on last section', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Submit Application' })).toBeVisible();
    });
  });

  test.describe('Form Submission', () => {
    test('should not show sevadhari section for non-sevadhari programs', async ({ page }) => {
      await fillBasicInfo(page);
      await page.click('button:has-text("Next")');
      await page.fill('textarea[name="personalEssay"]', 'Test essay');
      await page.click('button:has-text("Next")');
      await fillMembershipSection(page);
      await page.click('button:has-text("Next")');
      await fillHealthSection(page);
      await page.click('button:has-text("Next")');
      await fillCovidSection(page);
      await page.click('button:has-text("Next")');
      await fillAshramStaySection(page);

      // On Ashram Stay section, next button should say Submit
      await expect(page.getByRole('button', { name: 'Submit Application' })).toBeVisible();
    });

    test('should show submitting state when submitting', async ({ page }) => {
      await fillCompleteApplication(page, 'darshan');

      await page.click('button:has-text("Submit Application")');

      // Should show submitting state
      await expect(page.getByRole('button', { name: 'Submitting...' })).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/apply');

      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
      await expect(page.getByLabel('Email Address*')).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/apply');

      await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
    });
  });
});

// Helper functions
async function fillBasicInfo(page: any) {
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');

  await page.click('[name="programType"]');
  await page.click('text=Darshan Retreat');
  await page.waitForTimeout(1000);

  await page.click('[name="gender"]');
  await page.click('text=Male');

  await page.fill('input[name="dateOfBirth"]', '1990-01-15');
  await page.fill('input[name="phone"]', '+1234567890');

  await page.click('[name="maritalStatus"]');
  await page.click('text=Single');

  await page.fill('input[name="nationality"]', 'USA');
  await page.fill('input[name="residence"]', 'New York, NY, USA');
  await page.fill('input[name="occupation"]', 'Engineer');
}

async function fillMembershipSection(page: any) {
  await page.click('[name="connection"]');
  await page.click('text=Internet Search');

  await page.click('[name="membershipStatus"]');
  await page.click('text=Pragyani');

  await page.click('[name="hasAttendedOnlineRetreats"]');
  await page.click('text=No');

  await page.fill('textarea[name="teachingsFamiliarity"]', 'I have been watching videos for 2 years');
}

async function fillHealthSection(page: any) {
  await page.click('[name="hasHealthConditions"]');
  await page.click('text=No');

  await page.click('[name="hasMedications"]');
  await page.click('text=No');

  await page.click('[name="hasDietaryRestrictions"]');
  await page.click('text=No');
}

async function fillCovidSection(page: any) {
  await page.click('[name="isVaccinated"]');
  await page.click('text=No, I have not taken the shot');

  await page.click('[name="hasVaccinatedHousehold"]');
  await page.click('text=No');
}

async function fillAshramStaySection(page: any) {
  await page.click('[name="agreesToGuidelines"]');
  await page.click('text=Yes, I have read and agree');

  await page.click('[name="hasSmokingHistory"]');
  await page.click('text=No');

  await page.click('[name="hasProgramFunds"]');
  await page.click('text=Yes');

  await page.click('[name="healthInsuranceStatus"]');
  await page.click('text=Yes');
}

async function fillCompleteApplication(page: any, programType: 'darshan' | 'shakti' | 'sevadhari') {
  // Fill basic info
  await fillBasicInfo(page);
  await page.click('button:has-text("Next")');

  // Personal essay
  await page.fill('textarea[name="personalEssay"]', 'Complete application test essay');
  await page.click('button:has-text("Next")');

  // Membership
  await fillMembershipSection(page);
  await page.click('button:has-text("Next")');

  // Health
  await fillHealthSection(page);
  await page.click('button:has-text("Next")');

  // COVID
  await fillCovidSection(page);
  await page.click('button:has-text("Next")');

  // Ashram Stay
  await fillAshramStaySection(page);

  if (programType === 'sevadhari') {
    await page.click('button:has-text("Next")');
    // Fill sevadhari section
    await page.fill('input[name="passportNumber"]', 'X1234567');
    await page.fill('textarea[name="sevadhariMotivation"]', 'I want to serve and learn');
    await page.fill('textarea[name="strengthsWeaknesses"]', 'Strong work ethic, learning patience');
    await page.fill('textarea[name="communityLivingThoughts"]', 'I embrace community living');

    await page.click('[name="commitmentLength"]');
    await page.click('text=6 months');

    await page.fill('textarea[name="workExperience"]', '5 years experience in construction');
  }
}
