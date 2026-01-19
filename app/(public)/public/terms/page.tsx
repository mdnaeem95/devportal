import { Metadata } from "next";
import { LegalLayout } from "@/components/public/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions that govern your use of Zovo.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="These terms govern your use of Zovo. By using our service, you agree to these terms."
      lastUpdated="January 19, 2026"
    >
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," 
          or "your") and Zovo ("Company," "we," "us," or "our") governing your access to and use of the 
          Zovo platform at zovo.dev (the "Service").
        </p>
        <p>
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any 
          part of these Terms, you may not access the Service.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          Zovo is a client management platform designed for freelance developers. The Service provides tools 
          for managing client relationships, creating and sending contracts, generating and collecting 
          invoices, tracking time, and delivering files to clients.
        </p>
        <p>Key features include:</p>
        <ul>
          <li>Project and milestone management</li>
          <li>Contract creation with electronic signature capabilities</li>
          <li>Invoice generation and payment processing via Stripe</li>
          <li>Time tracking with reporting</li>
          <li>File delivery and version management</li>
          <li>Client portals for contract signing and invoice payment</li>
        </ul>
      </section>

      <section>
        <h2>3. Account Registration</h2>
        
        <h3>3.1 Account Creation</h3>
        <p>
          To use the Service, you must create an account by providing accurate and complete information. 
          You are responsible for maintaining the confidentiality of your account credentials and for all 
          activities that occur under your account.
        </p>

        <h3>3.2 Account Requirements</h3>
        <p>To create an account, you must:</p>
        <ul>
          <li>Be at least 18 years of age</li>
          <li>Provide a valid email address</li>
          <li>Have the legal capacity to enter into binding contracts</li>
          <li>Not be prohibited from using the Service under applicable law</li>
        </ul>

        <h3>3.3 Account Security</h3>
        <p>
          You are responsible for safeguarding your account. You must notify us immediately if you become 
          aware of any unauthorized access to your account. We are not liable for any loss arising from 
          unauthorized use of your account.
        </p>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        
        <h3>4.1 Permitted Uses</h3>
        <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service only to:</p>
        <ul>
          <li>Manage your freelance business operations</li>
          <li>Create and send contracts to your clients</li>
          <li>Generate and collect payments for services you provide</li>
          <li>Track time spent on client projects</li>
          <li>Deliver files and deliverables to clients</li>
        </ul>

        <h3>4.2 Prohibited Uses</h3>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the Service for any illegal purpose or in violation of any laws</li>
          <li>Send fraudulent invoices or contracts</li>
          <li>Impersonate any person or entity</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Use the Service to harass, abuse, or harm others</li>
          <li>Collect personal information about other users without consent</li>
          <li>Use automated systems to access the Service without permission</li>
          <li>Resell or redistribute the Service without authorization</li>
          <li>Use the Service to send spam or unsolicited communications</li>
        </ul>
      </section>

      <section>
        <h2>5. Subscription and Payments</h2>
        
        <h3>5.1 Subscription Plans</h3>
        <p>
          The Service offers subscription plans with different features and pricing. Current plans and 
          pricing are available on our pricing page. We reserve the right to modify pricing with 30 days 
          notice to existing subscribers.
        </p>

        <h3>5.2 Free Trial</h3>
        <p>
          We may offer a free trial period for new users. At the end of the trial, your account will be 
          automatically downgraded unless you subscribe to a paid plan. We reserve the right to limit or 
          modify trial availability.
        </p>

        <h3>5.3 Billing</h3>
        <p>
          Paid subscriptions are billed in advance on a monthly or annual basis. By subscribing, you 
          authorize us to charge your payment method for the subscription fee plus any applicable taxes.
        </p>

        <h3>5.4 Cancellation</h3>
        <p>
          You may cancel your subscription at any time through your account settings. Cancellation takes 
          effect at the end of your current billing period. No refunds are provided for partial months or 
          unused portions of the subscription.
        </p>

        <h3>5.5 Payment Processing</h3>
        <p>
          All payments are processed through Stripe. By making a payment, you agree to Stripe's 
          <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Terms of Service</a>. 
          We do not store your full payment card details on our servers.
        </p>
      </section>

      <section>
        <h2>6. Payment Collection Through the Service</h2>
        
        <h3>6.1 Stripe Connect</h3>
        <p>
          The Service allows you to collect payments from your clients through Stripe Connect. To use this 
          feature, you must create a Stripe Connect account and agree to Stripe's 
          <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer">Connected Account Agreement</a>.
        </p>

        <h3>6.2 Payment Responsibility</h3>
        <p>
          You are solely responsible for the accuracy of invoices you send and the services you provide to 
          your clients. We are not a party to the transactions between you and your clients and have no 
          liability for disputes arising from your client relationships.
        </p>

        <h3>6.3 Fees</h3>
        <p>
          Stripe charges payment processing fees, which are deducted from your payments before disbursement. 
          Current Stripe fees are available on their website. We do not charge additional transaction fees 
          beyond your subscription.
        </p>

        <h3>6.4 Refunds and Disputes</h3>
        <p>
          You are responsible for handling refunds and disputes with your clients. We may suspend your 
          payment collection capabilities if we receive excessive chargebacks or fraud complaints.
        </p>
      </section>

      <section>
        <h2>7. Electronic Signatures</h2>
        
        <h3>7.1 Legal Validity</h3>
        <p>
          The Service enables electronic signatures on contracts. Electronic signatures created through the 
          Service are intended to comply with applicable electronic signature laws, including the U.S. 
          Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic 
          Transactions Act (UETA).
        </p>

        <h3>7.2 Signature Records</h3>
        <p>
          We maintain records of electronic signatures, including timestamps, IP addresses, and signature 
          images. These records are available to you for your legal documentation needs.
        </p>

        <h3>7.3 No Legal Advice</h3>
        <p>
          We provide contract templates as a convenience, but we do not provide legal advice. You are 
          responsible for ensuring that your contracts are appropriate for your jurisdiction and business 
          needs. We recommend consulting with a qualified attorney for legal matters.
        </p>
      </section>

      <section>
        <h2>8. Intellectual Property</h2>
        
        <h3>8.1 Our Intellectual Property</h3>
        <p>
          The Service, including its design, features, content, and underlying technology, is owned by 
          Zovo and protected by intellectual property laws. You may not copy, modify, distribute, sell, 
          or lease any part of the Service without our written consent.
        </p>

        <h3>8.2 Your Content</h3>
        <p>
          You retain ownership of all content you create or upload to the Service, including contracts, 
          invoices, project data, and files ("Your Content"). By using the Service, you grant us a limited 
          license to store, process, and display Your Content as necessary to provide the Service.
        </p>

        <h3>8.3 Feedback</h3>
        <p>
          If you provide suggestions, ideas, or feedback about the Service, you grant us the right to use 
          that feedback without compensation or attribution to you.
        </p>
      </section>

      <section>
        <h2>9. Privacy</h2>
        <p>
          Your use of the Service is subject to our <a href="/privacy">Privacy Policy</a>, which describes 
          how we collect, use, and protect your personal information. By using the Service, you consent to 
          the data practices described in the Privacy Policy.
        </p>
      </section>

      <section>
        <h2>10. Third-Party Services</h2>
        <p>
          The Service integrates with third-party services including Clerk, Stripe, and Resend. Your use 
          of these services is subject to their respective terms and privacy policies. We are not responsible 
          for the availability, accuracy, or practices of third-party services.
        </p>
      </section>

      <section>
        <h2>11. Data Backup and Export</h2>
        
        <h3>11.1 Data Backup</h3>
        <p>
          We maintain regular backups of Service data. However, we recommend that you maintain your own 
          copies of important documents and records.
        </p>

        <h3>11.2 Data Export</h3>
        <p>
          You may export your data from the Service at any time. Upon account termination, we will provide 
          a reasonable period to export your data before deletion.
        </p>
      </section>

      <section>
        <h2>12. Service Availability</h2>
        
        <h3>12.1 Uptime</h3>
        <p>
          We strive to maintain high availability of the Service but do not guarantee uninterrupted access. 
          The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond 
          our control.
        </p>

        <h3>12.2 Modifications</h3>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the Service at any time. For 
          significant changes, we will provide reasonable notice to affected users.
        </p>
      </section>

      <section>
        <h2>13. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
          OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>We do not warrant that:</p>
        <ul>
          <li>The Service will meet your specific requirements</li>
          <li>The Service will be uninterrupted, timely, secure, or error-free</li>
          <li>The results from using the Service will be accurate or reliable</li>
          <li>Any errors in the Service will be corrected</li>
        </ul>
      </section>

      <section>
        <h2>14. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ZOVO, ITS DIRECTORS, EMPLOYEES, PARTNERS, 
          AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
          DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE 
          LOSSES, RESULTING FROM:
        </p>
        <ul>
          <li>Your access to or use of (or inability to access or use) the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>
        <p>
          OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID 
          US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
        </p>
      </section>

      <section>
        <h2>15. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Zovo and its affiliates from any claims, damages, 
          losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your Content or data</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another party</li>
          <li>Disputes between you and your clients</li>
        </ul>
      </section>

      <section>
        <h2>16. Termination</h2>
        
        <h3>16.1 Termination by You</h3>
        <p>
          You may terminate your account at any time by contacting us or using the account deletion feature 
          in Settings. Upon termination, your right to use the Service will immediately cease.
        </p>

        <h3>16.2 Termination by Us</h3>
        <p>
          We may terminate or suspend your account immediately, without prior notice, if you breach these 
          Terms or engage in conduct that we determine, in our sole discretion, is harmful to the Service, 
          other users, or third parties.
        </p>

        <h3>16.3 Effect of Termination</h3>
        <p>Upon termination:</p>
        <ul>
          <li>Your right to access the Service ends immediately</li>
          <li>You remain responsible for any outstanding payments</li>
          <li>We may delete your data after a reasonable period (typically 30 days)</li>
          <li>Provisions of these Terms that by their nature should survive will survive termination</li>
        </ul>
      </section>

      <section>
        <h2>17. Dispute Resolution</h2>
        
        <h3>17.1 Informal Resolution</h3>
        <p>
          Before filing a formal claim, you agree to try to resolve any dispute informally by contacting 
          us at <a href="mailto:support@zovo.dev">support@zovo.dev</a>. We will attempt to resolve the 
          dispute within 30 days.
        </p>

        <h3>17.2 Governing Law</h3>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of 
          Delaware, United States, without regard to its conflict of law provisions.
        </p>

        <h3>17.3 Jurisdiction</h3>
        <p>
          Any legal action or proceeding relating to these Terms shall be brought exclusively in the state 
          or federal courts located in Delaware. You consent to the personal jurisdiction of such courts.
        </p>
      </section>

      <section>
        <h2>18. General Provisions</h2>
        
        <h3>18.1 Entire Agreement</h3>
        <p>
          These Terms, together with the Privacy Policy, constitute the entire agreement between you and 
          Zovo regarding the Service and supersede any prior agreements.
        </p>

        <h3>18.2 Severability</h3>
        <p>
          If any provision of these Terms is found to be unenforceable, the remaining provisions will 
          continue in full force and effect.
        </p>

        <h3>18.3 Waiver</h3>
        <p>
          Our failure to enforce any provision of these Terms shall not constitute a waiver of that 
          provision or our right to enforce it later.
        </p>

        <h3>18.4 Assignment</h3>
        <p>
          You may not assign or transfer these Terms or your rights under them without our prior written 
          consent. We may assign our rights and obligations under these Terms without your consent.
        </p>

        <h3>18.5 Notices</h3>
        <p>
          We may send you notices via email to the address associated with your account. You may send 
          notices to us at <a href="mailto:legal@zovo.dev">legal@zovo.dev</a>.
        </p>
      </section>

      <section>
        <h2>19. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of material changes 
          by posting the updated Terms on our website and updating the "Last updated" date. For significant 
          changes, we will provide additional notice via email or through the Service.
        </p>
        <p>
          Your continued use of the Service after any modifications constitutes acceptance of the updated 
          Terms. If you do not agree to the updated Terms, you must stop using the Service.
        </p>
      </section>

      <section>
        <h2>20. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:legal@zovo.dev">legal@zovo.dev</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@zovo.dev">support@zovo.dev</a></li>
          <li><strong>Website:</strong> <a href="https://zovo.dev">https://zovo.dev</a></li>
        </ul>
      </section>
    </LegalLayout>
  );
}