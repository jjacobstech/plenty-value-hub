import React from 'react'
import { Link } from '@adonisjs/inertia/react'
import PublicLayout from '@/components/layout/PublicLayout'

const sections = [
  {
    number: '1',
    title: 'Information We Collect',
    intro:
      'We collect information that you provide directly to us, as well as information gathered automatically when you use our Services.',
    subsections: [
      {
        title: '1.1 Information You Provide',
        items: [
          'Name and email address when subscribing to our newsletter',
          'Contact details when you reach out to us for support or inquiries',
          'Payment and billing information when making purchases through our marketplace',
          'Preferences, feedback, and survey responses you voluntarily submit',
          'Any other information you choose to share with us',
        ],
      },
      {
        title: '1.2 Information Collected Automatically',
        items: [
          'Device information including IP address, browser type, and operating system',
          'Usage data such as pages visited, links clicked, and time spent on our platform',
          'Referral URLs and traffic source data',
          'Cookies, web beacons, and similar tracking technologies (see Section 5)',
        ],
      },
    ],
  },
  {
    number: '2',
    title: 'How We Use Your Information',
    intro: 'Plenty Value uses the information we collect for the following purposes:',
    items: [
      'To deliver, personalise, and improve our newsletter and marketplace services',
      'To process transactions and send related information, including purchase confirmations',
      'To send promotional communications, product recommendations, and curated deals – you may opt out at any time',
      'To analyse subscriber engagement and platform usage in order to enhance content quality',
      'To facilitate affiliate partnerships and attribute referrals accurately',
      'To comply with legal obligations and enforce our Terms of Service',
      'To detect, prevent, and address fraudulent or unauthorised activity',
    ],
  },
  {
    number: '3',
    title: 'Sharing Your Information',
    intro:
      'We do not sell your personal information. We may share your data only in the following circumstances:',
    subsections: [
      {
        title: '3.1 Affiliate and Brand Partners',
        body: 'When you click on an affiliate link or make a purchase through our marketplace, certain information (such as referral data) may be shared with our brand partners solely for the purpose of tracking commissions and attributing sales. These partners are contractually bound to handle your data responsibly.',
      },
      {
        title: '3.2 Service Providers',
        body: 'We engage trusted third-party vendors (e.g., email service providers, analytics platforms, payment processors) who assist us in operating our Services. These parties access personal data only as necessary to perform services on our behalf and are prohibited from using it for other purposes.',
      },
      {
        title: '3.3 Legal Requirements',
        body: 'We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order or government agency).',
      },
      {
        title: '3.4 Business Transfers',
        body: 'In the event of a merger, acquisition, or sale of all or a portion of our assets, your personal information may be transferred as part of that transaction. We will notify you via email or prominent notice on our platform prior to such a transfer.',
      },
    ],
  },
  {
    number: '4',
    title: 'Data Retention',
    body: 'We retain your personal information for as long as necessary to fulfil the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you unsubscribe from our newsletter, we will remove your email address from our active mailing list within 10 business days. Certain residual data may be retained in backup systems for a limited period thereafter.',
  },
  {
    number: '5',
    title: 'Cookies and Tracking Technologies',
    intro:
      'Plenty Value uses cookies and similar technologies to enhance your experience on our platform. These include:',
    items: [
      'Essential Cookies: Necessary for the operation of our website and Services.',
      'Analytics Cookies: Help us understand how visitors interact with our platform (e.g., Google Analytics).',
      'Marketing Cookies: Used to deliver relevant advertisements and track affiliate referrals.',
    ],
    footer:
      'You may control cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of our Services. By continuing to use our platform, you consent to our use of cookies in accordance with this policy.',
  },
  {
    number: '6',
    title: 'Your Rights and Choices',
    intro:
      'Depending on your jurisdiction, you may have the following rights regarding your personal information:',
    items: [
      'Access: Request a copy of the personal data we hold about you.',
      'Correction: Request correction of inaccurate or incomplete information.',
      'Deletion: Request that we delete your personal data, subject to certain exceptions.',
      'Opt-Out: Unsubscribe from marketing communications at any time via the unsubscribe link in any email or by contacting us directly.',
      'Data Portability: Request that we provide your data in a structured, machine-readable format where technically feasible.',
      'Restriction: Request that we restrict the processing of your data under certain circumstances.',
    ],
    footer:
      'To exercise any of these rights, please contact us at the details provided in Section 11. We will respond to all verified requests within 30 days.',
  },
  {
    number: '7',
    title: 'Security',
    body: 'We implement industry-standard technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These measures include secure socket layer (SSL) encryption, access controls, and regular security assessments. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    number: '8',
    title: 'Third-Party Links',
    body: 'Our newsletter and marketplace may contain links to third-party websites, products, or services. This Privacy Policy does not apply to those third-party sites, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party sites you visit.',
  },
  {
    number: '9',
    title: "Children's Privacy",
    body: 'Our Services are not directed to individuals under the age of 13, and we do not knowingly collect personal information from children. If we become aware that we have inadvertently collected data from a child under 13, we will take prompt steps to delete such information. If you believe a child has provided us with personal data, please contact us immediately.',
  },
  {
    number: '10',
    title: 'Changes to This Privacy Policy',
    body: 'We reserve the right to update this Privacy Policy at any time. When we make material changes, we will notify subscribers via email and update the "Effective Date" at the top of this document. Your continued use of our Services following the posting of changes constitutes your acceptance of the revised policy.',
  },
]

function PrivacyPolicy() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div style={{ backgroundColor: '#001845' }} className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium mb-3" style={{ color: '#81C14B' }}>
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm">
            Effective Date: June 7, 2025 &nbsp;·&nbsp; Last Updated: June 7, 2025
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p
          className="text-muted-foreground leading-relaxed text-base border-l-4 pl-5 py-1"
          style={{ borderColor: '#81C14B' }}
        >
          Welcome to Plenty Value. We are committed to protecting your personal information and your
          right to privacy. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you visit our website, subscribe to our newsletter, or
          interact with our digital marketplace (collectively, the "Services"). Please read this
          policy carefully. If you do not agree with its terms, please discontinue use of our
          Services.
        </p>

        {/* Table of contents */}
        <nav className="mt-10 mb-12 p-6 rounded-xl border bg-muted/40">
          <p
            className="font-semibold text-sm uppercase tracking-widest mb-4"
            style={{ color: '#81C14B' }}
          >
            Contents
          </p>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.number}>
                <a
                  href={`#section-${s.number}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s.number}. {s.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#section-11"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                11. Contact Us
              </a>
            </li>
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.number} id={`section-${s.number}`}>
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: '#001845' }}
                >
                  {s.number}
                </span>
                {s.title}
              </h2>

              {s.intro && <p className="text-muted-foreground leading-relaxed mb-4">{s.intro}</p>}
              {s.body && <p className="text-muted-foreground leading-relaxed">{s.body}</p>}

              {s.items && (
                <ul className="space-y-2 mb-4">
                  {s.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed"
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#81C14B' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {s.subsections && (
                <div className="space-y-6 mt-4">
                  {s.subsections.map((sub, i) => (
                    <div key={i} className="pl-5 border-l-2" style={{ borderColor: '#81C14B20' }}>
                      <h3 className="font-semibold text-foreground mb-2">{sub.title}</h3>
                      {sub.body && (
                        <p className="text-muted-foreground text-sm leading-relaxed">{sub.body}</p>
                      )}
                      {sub.items && (
                        <ul className="space-y-1.5 mt-2">
                          {sub.items.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed"
                            >
                              <span
                                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: '#81C14B' }}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {s.footer && (
                <p className="text-muted-foreground leading-relaxed text-sm mt-4">{s.footer}</p>
              )}
            </section>
          ))}

          {/* Section 11: Contact Us */}
          <section id="section-11">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: '#001845' }}
              >
                11
              </span>
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div className="p-6 rounded-xl border bg-muted/40 space-y-2">
              <p className="font-semibold text-foreground">Plenty Value</p>
              <p className="text-muted-foreground text-sm">
                Email:{' '}
                <a
                  href="mailto:newsletter@plentyvalue.com"
                  className="font-medium hover:underline"
                  style={{ color: '#81C14B' }}
                >
                  newsletter@plentyvalue.com
                </a>
              </p>
              <p className="text-muted-foreground text-sm">
                Website:{' '}
                <a
                  href="https://www.plentyvalue.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: '#81C14B' }}
                >
                  www.plentyvalue.com
                </a>
              </p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mt-4">
              We are committed to resolving any complaints about our collection or use of your
              personal information. We will respond to all inquiries in a timely and transparent
              manner.
            </p>
          </section>
        </div>

        {/* Back to home */}
        <div className="mt-16 pt-8 border-t">
          <Link
            href="/"
            className="text-sm font-medium hover:underline"
            style={{ color: '#81C14B' }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy

PrivacyPolicy.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>
