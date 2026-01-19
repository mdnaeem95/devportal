import { Metadata } from "next";
import { LegalLayout } from "@/components/public/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Zovo collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="Your privacy is important to us. This policy explains how we collect, use, and protect your information."
      lastUpdated="January 19, 2026"
    >
      <section>
        <h2>1. Introduction</h2>
        <p>
          Zovo ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
          how we collect, use, disclose, and safeguard your information when you use our client management 
          platform at zovo.dev (the "Service").
        </p>
        <p>
          By using the Service, you agree to the collection and use of information in accordance with this 
          policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Information You Provide</h3>
        <p>We collect information you directly provide when using our Service, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
          <li><strong>Business Information:</strong> Business name, address, tax ID, and logo for your invoices and contracts</li>
          <li><strong>Client Information:</strong> Names, email addresses, phone numbers, company names, and addresses of your clients</li>
          <li><strong>Project Data:</strong> Project names, descriptions, milestones, and related details</li>
          <li><strong>Financial Information:</strong> Invoice amounts, payment terms, and billing details</li>
          <li><strong>Contract Content:</strong> The text content of contracts you create and send</li>
          <li><strong>Time Tracking Data:</strong> Descriptions, durations, and timestamps of your work sessions</li>
          <li><strong>Files:</strong> Documents, images, and other files you upload as deliverables</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <p>When you access our Service, we automatically collect certain information:</p>
        <ul>
          <li><strong>Usage Data:</strong> Pages visited, features used, and actions taken within the Service</li>
          <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
          <li><strong>Log Data:</strong> IP addresses, access times, and referring URLs</li>
          <li><strong>Cookies:</strong> Small data files stored on your device (see Section 6)</li>
        </ul>

        <h3>2.3 Information from Third Parties</h3>
        <p>We may receive information about you from third-party services you connect:</p>
        <ul>
          <li><strong>Clerk (Authentication):</strong> Profile information from your authentication provider</li>
          <li><strong>Stripe (Payments):</strong> Payment status and transaction details (not full card numbers)</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service</li>
          <li>Process transactions and send related information (invoices, receipts, confirmations)</li>
          <li>Send contracts to your clients for electronic signature</li>
          <li>Send invoice payment reminders and notifications</li>
          <li>Communicate with you about your account, updates, and promotional offers</li>
          <li>Respond to your comments, questions, and support requests</li>
          <li>Monitor and analyze usage patterns to improve user experience</li>
          <li>Detect, prevent, and address technical issues and security threats</li>
          <li>Comply with legal obligations and enforce our terms</li>
        </ul>
      </section>

      <section>
        <h2>4. Information Sharing and Disclosure</h2>
        
        <h3>4.1 With Your Clients</h3>
        <p>
          When you send contracts or invoices to clients, we share necessary information with them, including 
          your business name, contact information, and the content of the documents. Client portal pages display 
          project information, milestones, invoices, and deliverables you've chosen to share.
        </p>

        <h3>4.2 Service Providers</h3>
        <p>We share information with third-party service providers who assist in operating our Service:</p>
        <ul>
          <li>
            <strong>Clerk</strong> — Authentication and user management. 
            <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </li>
          <li>
            <strong>Stripe</strong> — Payment processing and Connect accounts. 
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </li>
          <li>
            <strong>Resend</strong> — Transactional email delivery. 
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </li>
          <li>
            <strong>Cloudflare</strong> — File storage (R2) and content delivery. 
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </li>
          <li>
            <strong>Vercel</strong> — Application hosting and deployment. 
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </li>
          <li>
            <strong>Neon</strong> — Database hosting. 
            <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </li>
        </ul>

        <h3>4.3 Legal Requirements</h3>
        <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>

        <h3>4.4 Business Transfers</h3>
        <p>
          If Zovo is involved in a merger, acquisition, or sale of assets, your information may be transferred 
          as part of that transaction. We will notify you via email and/or prominent notice on our Service 
          before your information becomes subject to a different privacy policy.
        </p>

        <h3>4.5 With Your Consent</h3>
        <p>We may share your information with third parties when you have given us explicit consent to do so.</p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to provide 
          you services. We will retain and use your information as necessary to comply with our legal obligations, 
          resolve disputes, and enforce our agreements.
        </p>
        <p>Specific retention periods:</p>
        <ul>
          <li><strong>Account Data:</strong> Retained until you delete your account</li>
          <li><strong>Transaction Records:</strong> Retained for 7 years for legal and tax purposes</li>
          <li><strong>Signed Contracts:</strong> Retained indefinitely unless you request deletion</li>
          <li><strong>Log Data:</strong> Retained for 90 days</li>
        </ul>
      </section>

      <section>
        <h2>6. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar tracking technologies to track activity on our Service and hold certain information.</p>
        
        <h3>6.1 Types of Cookies We Use</h3>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the Service to function (authentication, security)</li>
          <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors use the Service</li>
        </ul>

        <h3>6.2 Managing Cookies</h3>
        <p>
          Most web browsers allow you to control cookies through their settings preferences. However, 
          limiting cookies may affect the functionality of our Service.
        </p>
      </section>

      <section>
        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to protect your personal 
          information against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </p>
        <ul>
          <li>Encryption of data in transit (TLS/SSL) and at rest</li>
          <li>Secure authentication through Clerk</li>
          <li>Regular security assessments and monitoring</li>
          <li>Access controls limiting who can access your data</li>
          <li>Secure handling of payment information through Stripe (PCI-DSS compliant)</li>
        </ul>
        <p>
          While we strive to protect your personal information, no method of transmission over the Internet 
          or electronic storage is 100% secure. We cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>8. Your Rights and Choices</h2>
        <p>Depending on your location, you may have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information</li>
          <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
          <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
          <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
        </ul>
        <p>
          To exercise these rights, please contact us at <a href="mailto:privacy@zovo.dev">privacy@zovo.dev</a>. 
          We will respond to your request within 30 days.
        </p>

        <h3>8.1 Account Deletion</h3>
        <p>
          You may delete your account at any time through the Settings page. Upon deletion, we will remove 
          your personal information, except for data we are required to retain for legal or legitimate 
          business purposes.
        </p>

        <h3>8.2 Email Communications</h3>
        <p>
          You can opt out of promotional emails by clicking the "unsubscribe" link in any promotional email. 
          You cannot opt out of transactional emails related to your account or services you've requested 
          (e.g., invoice notifications, contract signing requests).
        </p>
      </section>

      <section>
        <h2>9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and maintained on servers located outside of your country, 
          where data protection laws may differ. We take appropriate safeguards to ensure that your personal 
          information remains protected in accordance with this Privacy Policy.
        </p>
      </section>

      <section>
        <h2>10. Children's Privacy</h2>
        <p>
          Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
          personal information from children under 18. If we learn that we have collected personal information 
          from a child under 18, we will delete that information promptly.
        </p>
      </section>

      <section>
        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page and updating the "Last updated" date. For significant changes, 
          we will provide additional notice via email or through the Service.
        </p>
        <p>
          Your continued use of the Service after any modifications indicates your acceptance of the updated 
          Privacy Policy.
        </p>
      </section>

      <section>
        <h2>12. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:privacy@zovo.dev">privacy@zovo.dev</a></li>
          <li><strong>Website:</strong> <a href="https://zovo.dev">https://zovo.dev</a></li>
        </ul>
      </section>
    </LegalLayout>
  );
}