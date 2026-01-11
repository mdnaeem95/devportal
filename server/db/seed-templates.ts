import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "./index";
import { templates } from "./schema";


const systemTemplates = [
  {
    type: "contract" as const,
    name: "Web Development Agreement",
    description: "Standard contract for website development projects",
    content: `# Web Development Agreement

**Date:** {{date}}
**Project:** {{project_name}}

This Web Development Agreement ("Agreement") is entered into between:

**Developer:** {{developer_name}}
**Client:** {{client_name}}

## 1. Project Scope

The Developer agrees to design and develop a website as described below:

{{scope_description}}

## 2. Timeline

- **Project Start:** {{start_date}}
- **Estimated Completion:** {{end_date}}

### Milestones

{{milestones}}

## 3. Payment Terms

**Total Project Cost:** {{total_amount}}

Payment is due according to the milestone schedule above. All invoices are payable within 14 days of receipt.

## 4. Intellectual Property

Upon receipt of full payment:
- Client receives full ownership of all custom code, designs, and content created specifically for this project
- Developer retains rights to pre-existing code, frameworks, and libraries used
- Open-source components remain subject to their respective licenses

## 5. Revisions & Change Requests

- Two (2) rounds of revisions are included per milestone
- Additional revisions or scope changes will be quoted separately
- All change requests must be submitted in writing

## 6. Confidentiality

Both parties agree to maintain confidentiality of proprietary information shared during this project.

## 7. Warranty

Developer warrants that deliverables will function as specified for **30 days** after project completion. Bug fixes during this period are included at no additional cost.

## 8. Limitation of Liability

Developer's total liability shall not exceed the total amount paid under this Agreement.

## 9. Termination

Either party may terminate with **14 days** written notice. Upon termination:
- Client pays for all completed work
- Developer delivers all work completed to date

---

**CLIENT**

Signature: _________________________

Name: {{client_name}}

Date: _________________________


**DEVELOPER**

Signature: _________________________

Name: {{developer_name}}

Date: _________________________
`,
    isSystem: true,
    isDefault: true,
  },
  {
    type: "contract" as const,
    name: "Mobile App Development Agreement",
    description: "Contract template for iOS/Android app development",
    content: `# Mobile App Development Agreement

**Date:** {{date}}
**Project:** {{project_name}}

This Mobile App Development Agreement ("Agreement") is entered into between:

**Developer:** {{developer_name}}
**Client:** {{client_name}}

## 1. Project Overview

The Developer agrees to design and develop a mobile application as described below:

{{scope_description}}

**Target Platforms:** iOS / Android / Both

## 2. Timeline & Milestones

- **Project Start:** {{start_date}}
- **Estimated Completion:** {{end_date}}

### Milestone Schedule

{{milestones}}

## 3. Payment Terms

**Total Project Cost:** {{total_amount}}

## 4. App Store Submission

- Developer will prepare the app for submission to App Store and/or Google Play
- Client is responsible for developer account fees and app store fees
- App store approval is subject to Apple/Google review and not guaranteed

## 5. Source Code & IP

Upon full payment:
- Client receives complete source code and assets
- Client owns all custom code developed for this project
- Third-party libraries and SDKs remain subject to their licenses

## 6. Ongoing Maintenance

This agreement covers initial development only. Ongoing maintenance, updates, and support can be arranged under a separate agreement.

## 7. Warranty

Developer warrants the app will function as specified for **60 days** after initial app store approval.

## 8. Confidentiality

Both parties agree to keep proprietary information confidential.

---

**Signatures**

Client: _________________________ Date: _________

Developer: _________________________ Date: _________
`,
    isSystem: true,
    isDefault: false,
  },
  {
    type: "contract" as const,
    name: "Consulting Agreement",
    description: "Hourly or retainer-based consulting contract",
    content: `# Consulting Agreement

**Effective Date:** {{date}}

This Consulting Agreement ("Agreement") is between:

**Consultant:** {{developer_name}}
**Client:** {{client_name}}

## 1. Services

The Consultant agrees to provide technical consulting services including:

{{scope_description}}

## 2. Term

This agreement begins on {{start_date}} and continues until {{end_date}} or until terminated by either party.

## 3. Compensation

**Rate:** $XXX per hour

**Payment Terms:**
- Invoices submitted bi-weekly/monthly
- Payment due within 14 days of invoice
- Minimum billing increment: 30 minutes

## 4. Working Relationship

- Consultant operates as an independent contractor
- Consultant controls their own schedule and methods
- Client provides necessary access and information

## 5. Confidentiality

Consultant agrees to maintain confidentiality of all proprietary information and will not disclose to third parties.

## 6. Intellectual Property

- Work product created during engagement belongs to Client
- Consultant retains rights to general knowledge and skills developed

## 7. Termination

Either party may terminate with **7 days** written notice. Upon termination:
- Consultant invoices for all work completed
- Client pays outstanding invoices within 14 days

---

**Agreed and accepted:**

Client: _________________________ Date: _________

Consultant: _________________________ Date: _________
`,
    isSystem: true,
    isDefault: false,
  },
  {
    type: "contract" as const,
    name: "Maintenance & Support Retainer",
    description: "Ongoing maintenance and support agreement",
    content: `# Maintenance & Support Agreement

**Effective Date:** {{date}}

This Maintenance & Support Agreement ("Agreement") is between:

**Provider:** {{developer_name}}
**Client:** {{client_name}}

## 1. Covered Systems

This agreement covers maintenance and support for:

{{scope_description}}

## 2. Services Included

### Included in Monthly Retainer:
- Bug fixes and security patches
- Minor updates and improvements
- Server monitoring and uptime management
- Up to X hours of support per month
- Response within 24 business hours

### Not Included (Quoted Separately):
- New feature development
- Major redesigns or overhauls
- Third-party integration issues
- Work exceeding monthly hour allocation

## 3. Term & Payment

**Monthly Retainer:** $XXX/month
**Term:** {{start_date}} to {{end_date}} (auto-renews monthly)
**Payment:** Due on the 1st of each month

## 4. Support Process

1. Submit requests via email/ticketing system
2. Provider acknowledges within 24 business hours
3. Critical issues addressed within 4 hours
4. Regular updates provided on progress

## 5. Termination

Either party may terminate with **30 days** written notice.

---

**Signatures**

Client: _________________________ Date: _________

Provider: _________________________ Date: _________
`,
    isSystem: true,
    isDefault: false,
  },
];

export async function seedTemplates() {
  console.log("Seeding system templates...");

  for (const template of systemTemplates) {
    // Check if template already exists
    const existing = await db.query.templates.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.isSystem, true), eq(t.name, template.name)),
    });

    if (!existing) {
      await db.insert(templates).values({
        ...template,
        userId: null, // System templates have no user
      });
      console.log(`Created template: ${template.name}`);
    } else {
      console.log(`Template already exists: ${template.name}`);
    }
  }

  console.log("Done seeding templates.");
}

// Run if called directly
// npx tsx server/db/seed-templates.ts
seedTemplates().catch(console.error);