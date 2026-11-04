"use client";
import React from 'react';
import { ArrowUpRightIcon, ClockIcon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import { EnquiryForm } from './EnquiryForm';
import { contact } from '../data/company';

export function ContactSection() {
  return (
    <section id="contact" className="bg-paper">
      <div className="mx-auto max-w-site px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-10 overflow-hidden rounded-[32px] bg-brand p-6 text-white sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
          <div className="flex flex-col lg:col-span-5">
            <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[56px]">
              Let&apos;s build what&apos;s next for your business.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">
              Talk to our team about a project, a quotation or ongoing support. We respond within one business day.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-brand transition-colors duration-150 hover:bg-ink hover:text-white">
                
                <MessageCircleIcon className="h-4 w-4" /> Chat on WhatsApp
              </a>
              <a
                href={`tel:${contact.phoneIntl}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-medium text-white transition-colors duration-150 hover:border-white">
                
                <PhoneIcon className="h-4 w-4" /> {contact.phoneDisplay}
              </a>
            </div>

            <dl className="mt-auto grid grid-cols-1 gap-6 border-t border-white/25 pt-8 sm:grid-cols-2 lg:mt-14">
              <div>
                <dt className="flex items-center gap-2 text-sm text-white/75">
                  <MapPinIcon className="h-4 w-4" aria-hidden="true" /> Head office
                </dt>
                <dd className="mt-2 leading-relaxed">
                  {contact.address}
                  <br />
                  {contact.addressLine2}
                </dd>
                <a href={contact.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                  Get directions <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-white/75">
                  <ClockIcon className="h-4 w-4" aria-hidden="true" /> Open hours
                </dt>
                <dd className="mt-2 leading-relaxed">
                  {contact.hoursWeekday}
                  <br />
                  {contact.hoursSaturday}
                </dd>
                <a href={`mailto:${contact.email}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
                  <MailIcon className="h-3.5 w-3.5" /> {contact.email}
                </a>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>);

}