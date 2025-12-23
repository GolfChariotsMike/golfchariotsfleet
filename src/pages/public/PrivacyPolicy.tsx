import { SEO } from "@/components/SEO";

export default function PrivacyPolicy() {
  return (
    <div className="page-transition pt-20">
      <SEO
        title="Privacy Policy"
        description="Read Golf Chariots Australia's privacy policy. Learn how we collect, use, and protect your personal information."
        canonicalUrl="/privacy"
        noIndex={false}
      />
      <section className="relative py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container-wide">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-primary-foreground/80">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              1. Introduction
            </h2>
            <p className="text-muted-foreground mb-6">
              Golf Chariots Australia ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our website or use our services.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We may collect information about you in a variety of ways, including:
            </p>
            <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">
              Personal Data
            </h3>
            <p className="text-muted-foreground mb-4">
              When you contact us through our website, we collect personally identifiable information 
              that you voluntarily provide, such as:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Details of your inquiry</li>
            </ul>

            <h3 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">
              Automatically Collected Information
            </h3>
            <p className="text-muted-foreground mb-6">
              When you access our website, we may automatically collect certain information about your 
              device, including your IP address, browser type, operating system, access times, and the 
              pages you have viewed directly before and after accessing the website.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send you information about our products and services</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
              <li>To prevent fraudulent activity</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              4. Disclosure of Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> We may share your information with third-party 
                service providers that perform services on our behalf, such as email delivery services.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information where required 
                to comply with applicable law, governmental requests, or legal process.
              </li>
              <li>
                <strong>Business Transfers:</strong> We may share or transfer your information in 
                connection with a merger, acquisition, or sale of assets.
              </li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              5. Data Security
            </h2>
            <p className="text-muted-foreground mb-6">
              We implement appropriate technical and organisational security measures to protect your 
              personal information. However, no electronic transmission over the internet or information 
              storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee 
              that hackers, cybercriminals, or other unauthorised third parties will not be able to 
              defeat our security.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              6. Your Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              Under Australian privacy law, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="text-muted-foreground mb-6">
              To exercise these rights, please contact us using the details below.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              7. Third-Party Services
            </h2>
            <p className="text-muted-foreground mb-6">
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices or content of these external sites. We encourage you to review the 
              privacy policies of any third-party sites you visit.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-muted-foreground mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              9. Contact Us
            </h2>
            <p className="text-muted-foreground mb-6">
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-secondary p-6 rounded-lg">
              <p className="text-foreground font-semibold">Golf Chariots Australia</p>
              <p className="text-muted-foreground">Email: info@golfchariots.com.au</p>
              <p className="text-muted-foreground">Location: Perth, Western Australia</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
