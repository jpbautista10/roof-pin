import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p className="not-prose rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
        <strong>Operator notice:</strong> Replace bracketed placeholders and
        confirm your Supabase project region, hosting locations, and payment
        processor details with qualified counsel. This policy describes the
        Service as implemented in the product today.
      </p>

      <section>
        <h2>1. Who we are</h2>
        <p>
          This Privacy Policy explains how <strong>Roof Wise Pro</strong> (“we,”
          “us,” or “our”) collects, uses, and shares information in connection
          with <strong>Roof Wise Pro</strong> (the “Service”).
        </p>
      </section>

      <section>
        <h2 className="mt-8">2. Information we collect</h2>

        <h3 className="mt-4">2.1 Account and contact data</h3>
        <p>
          When you register or use the Service, we may collect your name, email
          address, password or authentication tokens (managed by our
          authentication provider), and company or profile details you choose to
          provide.
        </p>

        <h3 className="mt-4">2.2 Customer content you upload</h3>
        <p>
          We store content you add to the Service, including business branding
          (such as logos and colors), project or location records, addresses or
          place labels, photos (for example, before/after images), and
          review-related data you configure or collect through the Service.
        </p>

        <h3 className="mt-4">2.3 Map and location data</h3>
        <p>
          To display maps and place pins, we process geographic coordinates and
          related metadata. We may use third-party mapping and geocoding
          services (such as Mapbox) to suggest or refine locations when you use
          import or address features.
        </p>

        <h3 className="mt-4">2.4 Reviews and end-user submissions</h3>
        <p>
          Where you enable review collection, we may process review text,
          ratings, and identifiers that reviewers submit through flows you
          publish (for example, public review links). You are responsible for
          notices and consents required for your use case.
        </p>

        <h3 className="mt-4">2.5 Technical and usage data</h3>
        <p>
          We and our hosting providers may process server logs, IP addresses,
          device and browser type, and timestamps for security, debugging, and
          reliability. We do not use third-party advertising cookies on the
          marketing site as of the date of this policy; session and functional
          cookies may be used for authentication and app preferences.
        </p>
      </section>

      <section>
        <h2 className="mt-8">3. How we use information</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide, operate, maintain, and improve the Service.</li>
          <li>Authenticate users and protect accounts.</li>
          <li>
            Display your branded map and related content to visitors you direct
            to your public pages or embeds.
          </li>
          <li>
            Process support requests and communicate with you about the Service.
          </li>
          <li>
            Comply with law, enforce our Terms, and protect rights and safety.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mt-8">4. Legal bases (EEA/UK users)</h2>
        <p>
          Where GDPR applies, we rely on appropriate legal bases such as:
          performance of a contract (providing the Service); legitimate
          interests (security, product improvement, and communication with
          business users), where not overridden by your rights; consent where
          required; and legal obligation where applicable.
        </p>
      </section>

      <section>
        <h2 className="mt-8">5. How we share information</h2>
        <p>
          We do not sell your personal information. We share information only as
          needed with:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Infrastructure providers</strong> — for example, our
            database, authentication, file storage, and application hosting
            (such as Supabase and your deployment host), who process data under
            our instructions.
          </li>
          <li>
            <strong>Mapping providers</strong> — for example, Mapbox, for map
            tiles, geocoding, or related APIs when you use those features.
          </li>
          <li>
            <strong>Payment processors</strong> — when you make a purchase,
            payment data is handled by our payment processor; we generally
            receive limited transaction metadata, not full card numbers.
          </li>
          <li>
            <strong>Email delivery</strong> — for transactional or
            support-related email sent through a provider we configure.
          </li>
          <li>
            <strong>Legal and safety</strong> — if required by law or to protect
            rights and security.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mt-8">6. Public display and embeds</h2>
        <p>
          Content you publish through the Service (for example, your public map
          at a URL we provide or an embedded map on your website) may be visible
          to anyone with access to that URL or embed. Do not publish sensitive
          personal data you are not permitted to share.
        </p>
      </section>

      <section>
        <h2 className="mt-8">7. Data retention</h2>
        <p>
          We retain information for as long as your account is active or as
          needed to provide the Service, comply with legal obligations, resolve
          disputes, and enforce agreements. Retention periods may vary by data
          category; contact us to request deletion subject to applicable law.
        </p>
      </section>

      <section>
        <h2 className="mt-8">8. Security</h2>
        <p>
          We implement administrative, technical, and organizational measures
          designed to protect information. No method of transmission or storage
          is 100% secure; we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="mt-8">9. International transfers</h2>
        <p>
          Your information will be processed in the United States and other
          countries where we or our vendors operate. Where required, we use
          appropriate safeguards for cross-border transfers.
        </p>
      </section>

      <section>
        <h2 className="mt-8">10. Your rights and choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, or export personal information, or to object to or restrict
          certain processing. You may also have the right to lodge a complaint
          with a supervisory authority. To exercise rights, contact us at{" "}
          <a
            href="mailto:support@roofwise-la.com"
            className="font-medium text-primary underline underline-offset-2"
          >
            support@roofwise-la.com
          </a>
          . We may verify your request before responding.
        </p>
        <p>
          <strong>California residents:</strong> You may have additional rights
          under the CCPA/CPRA, including to know, delete, and correct personal
          information, and to opt out of certain sharing (we do not “sell”
          personal information in the traditional sense or share it for
          cross-context behavioral advertising as described in the CCPA). You
          may designate an authorized agent as permitted by law.
        </p>
      </section>

      <section>
        <h2 className="mt-8">11. Children</h2>
        <p>
          The Service is not directed to children under 13 (or 16 where
          required). We do not knowingly collect personal information from
          children. If you believe we have, contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2 className="mt-8">12. Enterprise / DPA</h2>
        <p>
          If you need a Data Processing Addendum for your organization, contact
          us at the email below.
        </p>
      </section>

      <section>
        <h2 className="mt-8">13. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the
          updated policy on this page and revise the “Last updated” date.
          Material changes may be communicated by email or in-product notice
          where appropriate.
        </p>
      </section>

      <section>
        <h2 className="mt-8">14. Contact</h2>
        <p>
          <strong>Roof Wise Pro</strong>
          <br />
          Email:{" "}
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
