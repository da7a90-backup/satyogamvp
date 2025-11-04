import { chromium } from '@playwright/test';
import * as fs from 'fs';

interface FormQuestion {
  question: string;
  type: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormData {
  title: string;
  description: string;
  questions: FormQuestion[];
}

async function scrapeGoogleForm(url: string, isFirstForm: boolean, browser: any, context: any): Promise<FormData | null> {
  const page = await context.newPage();

  try {
    console.log(`Navigating to: ${url}`);

    // Convert edit URL to viewform URL to actually fill it out
    const viewUrl = url.replace('/edit', '/viewform').split('?')[0];
    await page.goto(viewUrl, { waitUntil: 'networkidle' });

    // Wait for the form to load
    await page.waitForTimeout(3000);

    // Take a screenshot
    await page.screenshot({ path: `./scripts/form-start-${Date.now()}.png` });

    // Try multiple possible selectors for title
    let title = '';
    const titleSelectors = [
      '.freebirdFormviewerViewHeaderTitle',
      '[role="heading"]',
      'h1',
      '.documentTitle'
    ];

    for (const selector of titleSelectors) {
      try {
        const el = page.locator(selector).first();
        if (await el.count() > 0) {
          title = await el.textContent() || '';
          if (title && title.length > 3) {
            console.log(`Form title: ${title}`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Try multiple selectors for description
    let description = '';
    const descSelectors = [
      '.freebirdFormviewerViewHeaderDescription',
      '.freebirdFormviewerViewHeaderRequiredLegend'
    ];

    for (const selector of descSelectors) {
      try {
        const el = page.locator(selector).first();
        if (await el.count() > 0) {
          description = await el.textContent() || '';
          if (description) break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Extract all questions by going through the form
    const questions: FormQuestion[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`\n--- Extracting questions from page ${currentPage} ---`);

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Take screenshot of current page
      await page.screenshot({ path: `./scripts/form-page-${currentPage}-${Date.now()}.png` });

      // Find all question containers on current page
      const questionElements = await page.locator('[role="listitem"]').all();
      console.log(`Found ${questionElements.length} question elements on page ${currentPage}`);

      for (let i = 0; i < questionElements.length; i++) {
        const questionEl = questionElements[i];
        try {
          // Try to get question text
          let questionText = '';
          const possibleTextSelectors = [
            '.freebirdFormviewerComponentsQuestionBaseTitle',
            '[role="heading"]',
            '.freebirdFormviewerComponentsQuestionBaseHeader'
          ];

          for (const selector of possibleTextSelectors) {
            try {
              const el = questionEl.locator(selector).first();
              if (await el.count() > 0) {
                questionText = await el.textContent() || '';
                if (questionText && questionText.length > 1) break;
              }
            } catch (e) {
              // Continue
            }
          }

          // Skip if no meaningful text (might be a section header)
          if (!questionText || questionText.length < 2 || questionText === 'Namaste & Welcome,' || questionText === 'How does it work?' || questionText === 'Who can apply?') {
            continue;
          }

          // Get question description if exists
          let questionDescription: string | undefined;
          try {
            const descEl = questionEl.locator('.freebirdFormviewerComponentsQuestionBaseDescription').first();
            if (await descEl.count() > 0) {
              questionDescription = await descEl.textContent() || undefined;
            }
          } catch (e) {
            // No description
          }

          // Check if required
          let required = false;
          try {
            const requiredIndicator = await questionEl.locator('.freebirdFormviewerComponentsQuestionBaseRequiredAsterisk').count();
            required = requiredIndicator > 0;
          } catch (e) {
            // Not required
          }

          // Determine question type and options
          let type = 'text';
          let options: string[] | undefined;

          // Check for radio buttons
          const radioButtons = await questionEl.locator('[role="radio"]').all();
          if (radioButtons.length > 0) {
            type = 'radio';
            options = [];
            for (const radio of radioButtons) {
              try {
                // Get the label text for this radio button
                const labelDiv = radio.locator('..');
                const labelText = await labelDiv.textContent();
                if (labelText) {
                  const cleanLabel = labelText.trim();
                  if (cleanLabel && !options.includes(cleanLabel)) {
                    options.push(cleanLabel);
                  }
                }
              } catch (e) {
                // Skip this option
              }
            }
          }

          // Check for checkboxes
          const checkboxes = await questionEl.locator('[role="checkbox"]').all();
          if (checkboxes.length > 0) {
            type = 'checkbox';
            options = [];
            for (const checkbox of checkboxes) {
              try {
                const labelDiv = checkbox.locator('..');
                const labelText = await labelDiv.textContent();
                if (labelText) {
                  const cleanLabel = labelText.trim();
                  if (cleanLabel && !options.includes(cleanLabel)) {
                    options.push(cleanLabel);
                  }
                }
              } catch (e) {
                // Skip this option
              }
            }
          }

          // Check for dropdown
          const dropdowns = await questionEl.locator('select, [role="listbox"]').all();
          if (dropdowns.length > 0) {
            type = 'dropdown';
            options = [];
            for (const dropdown of dropdowns) {
              try {
                // Click dropdown to open options
                await dropdown.click();
                await page.waitForTimeout(500);

                const selectOptions = await page.locator('[role="option"]').all();
                for (const opt of selectOptions) {
                  const optText = await opt.textContent();
                  if (optText && optText !== 'Choose' && !options.includes(optText.trim())) {
                    options.push(optText.trim());
                  }
                }

                // Close dropdown by pressing Escape
                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);
              } catch (e) {
                // Skip this dropdown
              }
            }
          }

          // Check for textarea
          const textAreas = await questionEl.locator('textarea').count();
          if (textAreas > 0) {
            type = 'textarea';
          }

          // Check for text input (date, email, etc.)
          const textInputs = await questionEl.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]').all();
          if (textInputs.length > 0 && type === 'text') {
            // Check the type attribute
            for (const input of textInputs) {
              const inputType = await input.getAttribute('type');
              if (inputType === 'email') {
                type = 'email';
                break;
              } else if (inputType === 'tel') {
                type = 'tel';
                break;
              } else if (inputType === 'date') {
                type = 'date';
                break;
              }
            }
          }

          // Check for file upload
          const fileInputs = await questionEl.locator('input[type="file"]').count();
          if (fileInputs > 0) {
            type = 'file';
          }

          questions.push({
            question: questionText.trim(),
            type,
            required,
            ...(options && options.length > 0 && { options }),
            ...(questionDescription && { description: questionDescription.trim() }),
          });

          console.log(`  ${questions.length}. ${questionText.trim()} (${type}${required ? ', required' : ''})`);
        } catch (err) {
          console.error(`  Error extracting question ${i}:`, err);
        }
      }

      // Check if there's a Submit button (meaning we're on the last page)
      const submitButtonExists = await page.locator('span:has-text("Submit"), button:has-text("Submit"), div[role="button"]:has-text("Submit")').count() > 0;

      if (submitButtonExists) {
        console.log('\nFound "Submit" button - this is the last page');
        hasMorePages = false;
        continue;
      }

      // Try to find "Next" button
      const nextButtonSelectors = [
        'span:has-text("Next")',
        'button:has-text("Next")',
        'div[role="button"]:has-text("Next")',
        '[aria-label="Next page"]'
      ];

      let nextButton = null;
      for (const selector of nextButtonSelectors) {
        const btn = page.locator(selector).first();
        if (await btn.count() > 0) {
          try {
            if (await btn.isVisible()) {
              nextButton = btn;
              console.log(`\nFound "Next" button with selector: ${selector}`);
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }

      if (!nextButton) {
        console.log('\nNo "Next" button found - this might be the last page or a single-page form');
        hasMorePages = false;
        continue;
      }

      // Fill in ALL required fields before clicking next
      console.log('Filling required fields before clicking Next...');

      // Fill text inputs
      const textInputs = await page.locator('input[aria-required="true"]').all();
      for (let i = 0; i < textInputs.length; i++) {
        try {
          const input = textInputs[i];
          const inputType = await input.getAttribute('type');
          const inputName = await input.getAttribute('aria-label') || `input-${i}`;

          let fillValue = 'test';
          if (inputType === 'email') {
            fillValue = 'test@example.com';
          } else if (inputType === 'tel') {
            fillValue = '+1234567890';
          } else if (inputType === 'date') {
            fillValue = '01/01/2000';
          } else if (inputName.toLowerCase().includes('age')) {
            fillValue = '25';
          } else if (inputName.toLowerCase().includes('name')) {
            fillValue = 'Test Name';
          } else if (inputName.toLowerCase().includes('phone')) {
            fillValue = '+1234567890';
          }

          await input.fill(fillValue);
          console.log(`  Filled input: ${inputName} = ${fillValue}`);
          await page.waitForTimeout(200);
        } catch (e) {
          console.log(`  Could not fill input ${i}: ${e}`);
        }
      }

      // Fill textareas
      const textAreas = await page.locator('textarea[aria-required="true"]').all();
      for (let i = 0; i < textAreas.length; i++) {
        try {
          const textarea = textAreas[i];
          const textareaName = await textarea.getAttribute('aria-label') || `textarea-${i}`;
          await textarea.fill('Test response for textarea field');
          console.log(`  Filled textarea: ${textareaName}`);
          await page.waitForTimeout(200);
        } catch (e) {
          console.log(`  Could not fill textarea ${i}: ${e}`);
        }
      }

      // Click required radio buttons
      const requiredRadioGroups = await page.locator('[role="radiogroup"][aria-required="true"]').all();
      for (let i = 0; i < requiredRadioGroups.length; i++) {
        try {
          const radioGroup = requiredRadioGroups[i];
          const groupLabel = await radioGroup.getAttribute('aria-label') || `radio-group-${i}`;
          const firstRadio = radioGroup.locator('[role="radio"]').first();
          if (await firstRadio.count() > 0) {
            await firstRadio.click();
            console.log(`  Clicked radio in group: ${groupLabel}`);
            await page.waitForTimeout(300);
          }
        } catch (e) {
          console.log(`  Could not click radio group ${i}: ${e}`);
        }
      }

      // Select required dropdowns
      const requiredDropdowns = await page.locator('[role="listbox"][aria-required="true"]').all();
      for (let i = 0; i < requiredDropdowns.length; i++) {
        try {
          const dropdown = requiredDropdowns[i];
          const dropdownLabel = await dropdown.getAttribute('aria-label') || `dropdown-${i}`;

          // Click to open
          await dropdown.click();
          await page.waitForTimeout(500);

          // Select first non-empty option
          const options = await page.locator('[role="option"]').all();
          if (options.length > 1) {
            await options[1].click(); // Skip the first "Choose" option
            console.log(`  Selected option in dropdown: ${dropdownLabel}`);
            await page.waitForTimeout(300);
          }
        } catch (e) {
          console.log(`  Could not select dropdown ${i}: ${e}`);
        }
      }

      // Try regular select elements too
      const selectElements = await page.locator('select[aria-required="true"]').all();
      for (let i = 0; i < selectElements.length; i++) {
        try {
          const select = selectElements[i];
          const selectLabel = await select.getAttribute('aria-label') || `select-${i}`;

          // Get all options
          const options = await select.locator('option').all();
          if (options.length > 1) {
            const secondOption = await options[1].getAttribute('value');
            if (secondOption) {
              await select.selectOption(secondOption);
              console.log(`  Selected option in select: ${selectLabel}`);
              await page.waitForTimeout(200);
            }
          }
        } catch (e) {
          console.log(`  Could not select from select element ${i}: ${e}`);
        }
      }

      // Wait a bit for validation to process
      await page.waitForTimeout(1000);

      // Take screenshot before clicking next
      await page.screenshot({ path: `./scripts/before-next-page-${currentPage}.png` });

      // Now try to click Next
      try {
        await nextButton.click();
        console.log(`Clicked "Next" button, moving to page ${currentPage + 1}...`);
        await page.waitForTimeout(3000); // Wait longer for page transition

        // Check if we actually moved to a new page or if there's a validation error
        const errorMessages = await page.locator('[role="alert"], .freebirdFormviewerViewItemsItemErrorMessage').all();
        if (errorMessages.length > 0) {
          console.log('⚠️  Validation errors detected:');
          for (const error of errorMessages) {
            const errorText = await error.textContent();
            console.log(`  - ${errorText}`);
          }
          // If there are errors, we can't proceed
          hasMorePages = false;
        } else {
          currentPage++;
        }
      } catch (e) {
        console.log(`Error clicking Next button: ${e}`);
        hasMorePages = false;
      }
    }

    await page.close();

    return {
      title: title.trim(),
      description: description.trim(),
      questions,
    };
  } catch (error) {
    console.error('Error scraping form:', error);
    await page.close();
    return null;
  }
}

async function loginToGoogle(page: any) {
  console.log('Logging into Google...');

  // Navigate to Google login
  await page.goto('https://accounts.google.com/');
  await page.waitForTimeout(2000);

  // Enter email
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill('sid@barrack.studio');
  await page.click('#identifierNext');
  await page.waitForTimeout(3000);

  // Enter password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill('Sd98@Barrack');
  await page.click('#passwordNext');
  await page.waitForTimeout(5000);

  console.log('Login completed');
}

async function main() {
  const forms = [
    {
      name: 'shakti-saturation-program-application',
      url: 'https://docs.google.com/forms/d/1uB0f2dBSIIVS3mPMAFsxySj5G26tgVOYMztalPU0WD4/edit?pli=1&pli=1',
      category: 'application'
    },
    {
      name: 'sevadhari-program-application',
      url: 'https://docs.google.com/forms/d/13rapWBd0LuJbVPLl0SqA8Swa0RsLK3Gs1JFhtsayYzU/edit?ts=6706bd4a',
      category: 'application'
    },
    {
      name: 'form-3',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLScGrcDM-qZv8vFs84pgpkEFvuDao7HEmcNgbOxkOFDof5m3dg/viewform?usp=sharing',
      category: 'application'
    },
    {
      name: 'form-4',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdx03ITKf19wpjBMZfmmTnDwLvQ3GLrWlDxk7epjNu7FeW7Xw/viewform?usp=sharing',
      category: 'application'
    },
    {
      name: 'darshan-retreat-application',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSciEfFFWFkGbtYvxAcdE99kXgSyZv-Jyg8_vqU0ViA1fcNkTA/viewform?usp=sharing',
      category: 'application'
    },
    {
      name: 'online-retreat-scholarship-7day',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSf0tj-xJDziNIr1fDtugG-SOWRJUq8ibDZcbngcvVfSmZzf8w/viewform?usp=sharing',
      category: 'scholarship'
    },
    {
      name: 'online-retreat-scholarship-5day',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSeGs2K1fJzTleBe9D8OCwWIXMFtdMGXVapv_3Jbn3WlMCeLWg/viewform?usp=sharing',
      category: 'scholarship'
    },
    {
      name: 'pragyani-questionnaire',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdBAB1D8s4p1GQrjbOu8cHKw4bCehKlASP6TZZWmW8HxNFVCw/viewform?usp=sharing',
      category: 'questionnaire'
    },
  ];

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const loginPage = await context.newPage();

  // Login to Google first
  await loginToGoogle(loginPage);
  await loginPage.close();

  const results: Record<string, FormData | null> = {};

  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    console.log(`\n=== Scraping ${form.name} ===\n`);
    const data = await scrapeGoogleForm(form.url, i === 0, browser, context);
    results[form.name] = data;
  }

  await browser.close();

  // Save results to JSON file
  const outputPath = './scripts/google-forms-data.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to ${outputPath}`);

  // Print summary
  console.log('\n=== SUMMARY ===');
  for (const [name, data] of Object.entries(results)) {
    if (data) {
      console.log(`${name}: ${data.questions.length} questions`);
    } else {
      console.log(`${name}: Failed to scrape`);
    }
  }
}

main();
