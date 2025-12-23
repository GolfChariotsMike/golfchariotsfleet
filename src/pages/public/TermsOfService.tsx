import { SEO } from "@/components/SEO";

export default function TermsOfService() {
  return (
    <div className="page-transition pt-20">
      <SEO
        title="Terms of Service"
        description="Read Golf Chariots Australia's terms of service. Understand the terms and conditions for using our products and services."
        canonicalUrl="/terms"
        noIndex={false}
      />
      <section className="relative py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container-wide">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
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
              1. Agreement to Terms
            </h2>
            <p className="text-muted-foreground mb-6">
              By accessing or using the Golf Chariots Australia website and services, you agree to be 
              bound by these Terms of Service. If you do not agree with any part of these terms, you 
              may not access our website or use our services.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              2. About Our Services
            </h2>
            <p className="text-muted-foreground mb-6">
              Golf Chariots Australia provides golf scooter sales, leasing, and related services to 
              golf courses and individuals throughout Australia. Our services include the supply of 
              fat tyre golf scooters, maintenance support, and fleet management solutions.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              3. Use of Website
            </h2>
            <p className="text-muted-foreground mb-4">
              You agree to use our website only for lawful purposes and in a way that does not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Infringe the rights of others</li>
              <li>Restrict or inhibit anyone else's use of the website</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Transmit any harmful code or malware</li>
              <li>Use automated systems to access the website without permission</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              4. Products and Pricing
            </h2>
            <p className="text-muted-foreground mb-6">
              All product descriptions, specifications, and pricing on our website are subject to 
              change without notice. While we strive to provide accurate information, we do not 
              warrant that product descriptions or other content is accurate, complete, or error-free. 
              Prices quoted are in Australian Dollars (AUD) unless otherwise stated.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              5. Orders and Payments
            </h2>
            <p className="text-muted-foreground mb-4">
              When you place an order or enter into a leasing agreement with us:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>You confirm that all information provided is accurate and complete</li>
              <li>We reserve the right to refuse or cancel any order at our discretion</li>
              <li>Payment terms will be specified in your individual agreement or invoice</li>
              <li>Deposits may be required for custom orders or leasing arrangements</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              6. Delivery
            </h2>
            <p className="text-muted-foreground mb-6">
              We deliver to locations across Australia. Delivery times are estimates only and may 
              vary depending on your location and product availability. We will communicate any 
              delays as soon as possible. Risk of loss and title for items pass to you upon delivery.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              7. Warranty
            </h2>
            <p className="text-muted-foreground mb-6">
              Our products come with guarantees that cannot be excluded under the Australian Consumer 
              Law. You are entitled to a replacement or refund for a major failure and compensation 
              for any other reasonably foreseeable loss or damage. You are also entitled to have goods 
              repaired or replaced if goods fail to be of acceptable quality and the failure does not 
              amount to a major failure. Specific warranty terms will be provided with your purchase 
              or lease agreement.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              8. Leasing Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              For leased equipment:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
              <li>Equipment remains the property of Golf Chariots Australia</li>
              <li>You are responsible for proper care and maintenance as outlined in your agreement</li>
              <li>You must not modify, sublease, or transfer the equipment without our written consent</li>
              <li>Insurance requirements may apply as specified in your lease agreement</li>
              <li>End-of-lease terms will be outlined in your individual agreement</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground mb-6">
              To the maximum extent permitted by law, Golf Chariots Australia shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, or any loss of 
              profits or revenues, whether incurred directly or indirectly, or any loss of data, use, 
              goodwill, or other intangible losses resulting from your use of our services.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              10. Indemnification
            </h2>
            <p className="text-muted-foreground mb-6">
              You agree to indemnify and hold harmless Golf Chariots Australia, its officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including legal fees) arising from your use of our services or violation of these Terms.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              11. Intellectual Property
            </h2>
            <p className="text-muted-foreground mb-6">
              All content on this website, including text, graphics, logos, images, and software, is 
              the property of Golf Chariots Australia or its content suppliers and is protected by 
              Australian and international copyright laws. You may not reproduce, distribute, or 
              create derivative works from this content without our express written permission.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              12. Governing Law
            </h2>
            <p className="text-muted-foreground mb-6">
              These Terms shall be governed by and construed in accordance with the laws of Western 
              Australia, Australia. Any disputes arising from these Terms or your use of our services 
              shall be subject to the exclusive jurisdiction of the courts of Western Australia.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-muted-foreground mb-6">
              We reserve the right to modify these Terms at any time. Changes will be effective 
              immediately upon posting to our website. Your continued use of our services after any 
              changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
              14. Contact Us
            </h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these Terms of Service, please contact us at:
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
