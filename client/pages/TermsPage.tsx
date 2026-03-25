import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service (“Terms”) govern your access to and use of the
          websites, applications, and services offered by{" "}
          <strong>Roof Wise Pro</strong> (“we,” “us,” or “our”) relating to{" "}
          <strong>Roof Wise Pro</strong> (the “Service”). By accessing or using
          the Service, you agree to these Terms. If you do not agree, do not use
          the Service.
        </p>
      </section>

      <section>
        <h2 className="mt-8">2. Eligibility</h2>
        <p>
          You must be at least the age of majority in your jurisdiction to use
          the Service on behalf of yourself or a business. If you use the
          Service on behalf of a company or organization, you represent that you
          have authority to bind that entity.
        </p>
      </section>

      <section>
        <h2 className="mt-8">3. The Service</h2>
        <p>
          Roof Wise Pro provides tools to create and manage a branded,
          interactive map and related content (for example, project locations,
          images, and reviews) that you may publish or embed for your customers
          and prospects. Features, limits, and availability may change over
          time. We may modify or discontinue parts of the Service with
          reasonable notice where practicable.
        </p>
      </section>

      <section>
        <h2 className="mt-8">4. Accounts and security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. You must
          provide accurate registration information and notify us promptly at{" "}
          <a
            href="mailto:support@roofwise-la.com"
            className="font-medium text-primary underline underline-offset-2"
          >
            support@roofwise-la.com
          </a>{" "}
          of any unauthorized use.
        </p>
      </section>

      <section>
        <h2 className="mt-8">5. Your content and license</h2>
        <p>
          You retain ownership of content you submit to the Service (“Your
          Content”), such as business information, logos, photos, project
          details, and review data you choose to collect or display. You grant
          us a worldwide, non-exclusive license to host, store, process,
          reproduce, and display Your Content solely to operate, provide,
          secure, and improve the Service and as described in our Privacy
          Policy.
        </p>
        <p>
          You represent that you have all rights necessary to submit Your
          Content and that its use does not violate law or third-party rights.
          You are responsible for obtaining consent where required (for example,
          for customer photos or reviews).
        </p>
      </section>

      <section>
        <h2 className="mt-8">6. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use the Service for unlawful, fraudulent, harassing, defamatory, or
            harmful purposes.
          </li>
          <li>
            Attempt to gain unauthorized access to the Service, other accounts,
            or our systems (including probing, scanning, or bypassing security).
          </li>
          <li>
            Upload malware, interfere with the Service’s operation, or impose an
            unreasonable load on our infrastructure.
          </li>
          <li>
            Misrepresent your identity, your business, or the origin or accuracy
            of map data, reviews, or media.
          </li>
          <li>
            Scrape or harvest data from the Service in violation of these Terms
            or applicable law.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mt-8">7. Third-party services</h2>
        <p>
          The Service relies on infrastructure and integrations such as database
          and authentication providers (for example, Supabase), mapping and
          geocoding providers (for example, Mapbox), and hosting providers. Your
          use may also be subject to those providers’ terms and privacy
          policies. We do not control third-party services and are not
          responsible for their availability or practices.
        </p>
      </section>

      <section>
        <h2 className="mt-8">8. Fees and payment</h2>
        <p>
          If you purchase paid access to the Service, you agree to pay
          applicable fees and taxes. Payments may be processed by a third-party
          payment processor when that functionality is enabled. You authorize us
          and our processors to charge your designated payment method. Fees are
          generally non-refundable except where required by law or as expressly
          stated in our marketing or checkout flow (for example, a stated
          money-back guarantee period, if offered).
        </p>
      </section>

      <section>
        <h2 className="mt-8">9. Intellectual property</h2>
        <p>
          The Service, including its software, design, branding (except your own
          marks you upload), and documentation, is owned by us or our licensors.
          Except for the limited rights expressly granted in these Terms, no
          rights are transferred to you. “Roof Wise Pro” and related marks are
          our trademarks or used under license; you may not use them except as
          needed to identify your lawful use of the Service.
        </p>
      </section>

      <section>
        <h2 className="mt-8">10. Disclaimer of warranties</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS,
          IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
          THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL
          COMPONENTS.
        </p>
      </section>

      <section>
        <h2 className="mt-8">11. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE OR OUR
          AFFILIATES, OFFICERS, EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
          ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
          SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE
          SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS
          YOU PAID US FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM
          OR (B) ONE HUNDRED U.S. DOLLARS (US $100), EXCEPT WHERE PROHIBITED BY
          LAW.
        </p>
      </section>

      <section>
        <h2 className="mt-8">12. Indemnity</h2>
        <p>
          You will defend, indemnify, and hold harmless us and our affiliates
          from and against any claims, damages, losses, and expenses (including
          reasonable attorneys’ fees) arising out of Your Content, your use of
          the Service, or your violation of these Terms or applicable law.
        </p>
      </section>

      <section>
        <h2 className="mt-8">13. Termination</h2>
        <p>
          You may stop using the Service at any time. We may suspend or
          terminate your access if you materially breach these Terms, if we are
          required to do so by law, or if we discontinue the Service. Provisions
          that by their nature should survive termination (including ownership,
          disclaimers, limitation of liability, and indemnity) will survive.
        </p>
      </section>

      <section>
        <h2 className="mt-8">14. Governing law and venue</h2>
        <p>
          These Terms are governed by the laws of{" "}
          <strong>California, US</strong>, without regard to conflict-of-law
          principles. You agree that the courts located in{" "}
          <strong>United States</strong> will have exclusive jurisdiction over
          disputes, except that we may seek injunctive relief in any court of
          competent jurisdiction.
        </p>
      </section>

      <section>
        <h2 className="mt-8">15. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. We will post the revised
          Terms on this page and update the “Last updated” date. If changes are
          material, we will provide additional notice as appropriate (for
          example, by email or in-product notice). Your continued use after the
          effective date constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2 className="mt-8">16. Contact</h2>
        <p>
          Questions about these Terms:{" "}
          <a
            href="mailto:support@roofwise-la.com"
            className="font-medium text-primary underline underline-offset-2"
          >
            support@roofwise-la.com
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
