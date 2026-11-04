"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, LoaderCircleIcon } from 'lucide-react';
import { solutions } from '../data/solutions';
import { contact } from '../data/company';

type Status = 'idle' | 'submitting' | 'success';
type Fields = {name: string;company: string;email: string;interest: string;message: string;};
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: '', company: '', email: '', interest: '', message: '' };
const ease = [0.23, 1, 0.32, 1] as const;

export function EnquiryForm({ initialInterest = "" }: { initialInterest?: string }) {
  const [fields, setFields] = useState<Fields>({ ...empty, interest: initialInterest });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(fields);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const body = `Name: ${fields.name}\nCompany: ${fields.company || 'Not specified'}\nReply email: ${fields.email}\nInterest: ${fields.interest}\n\n${fields.message}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`MDT enquiry: ${fields.interest}`)}&body=${encodeURIComponent(body)}`;
    setStatus('success');
  };

  const reset = () => {
    setFields({ ...empty, interest: initialInterest });
    setStatus('idle');
  };

  const inputBase =
  'mt-2 w-full rounded-xl border bg-white px-4 py-3 text-ink placeholder:text-ink/35 transition-colors duration-150 focus:border-ink focus:outline-none';

  return (
    <div className="relative rounded-[24px] bg-white p-7 text-ink lg:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ?
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease }}
          className="flex min-h-[420px] flex-col items-start justify-center"
          role="status">
          
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
              <CheckIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-6 text-3xl font-semibold">Your email draft is ready.</h3>
            <p className="mt-3 max-w-sm leading-relaxed text-muted">
              Send the draft from your email app to reach our team. If an app didn&apos;t open, email {contact.email} or use the WhatsApp link beside this form.
            </p>
            <button type="button" onClick={reset} className="mt-8 font-medium text-ink underline underline-offset-4">
              Edit your enquiry
            </button>
          </motion.div> :

        <motion.form
          key="form"
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          
            <h3 className="text-2xl font-semibold">Start a conversation</h3>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name} htmlFor="f-name">
                <input id="f-name" value={fields.name} onChange={update('name')} className={`${inputBase} ${errors.name ? 'border-brand' : 'border-line'}`} placeholder="Jane Wanjiku" />
              </Field>
              <Field label="Company" htmlFor="f-company">
                <input id="f-company" value={fields.company} onChange={update('company')} className={`${inputBase} border-line`} placeholder="Optional" />
              </Field>
              <Field label="Work email" error={errors.email} htmlFor="f-email">
                <input id="f-email" type="email" value={fields.email} onChange={update('email')} className={`${inputBase} ${errors.email ? 'border-brand' : 'border-line'}`} placeholder="you@company.co.ke" />
              </Field>
              <Field label="Area of interest" error={errors.interest} htmlFor="f-interest">
                <select id="f-interest" value={fields.interest} onChange={update('interest')} className={`${inputBase} ${errors.interest ? 'border-brand' : 'border-line'} ${fields.interest ? '' : 'text-ink/40'}`}>
                  <option value="">Select one</option>
                  {initialInterest && !solutions.some(s => s.title === initialInterest) && <option value={initialInterest}>{initialInterest}</option>}
                  {solutions.map((s) =>
                <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                )}
                  <option value="Other">Something else</option>
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="How can we help?" error={errors.message} htmlFor="f-message">
                <textarea id="f-message" rows={4} value={fields.message} onChange={update('message')} className={`${inputBase} resize-none ${errors.message ? 'border-brand' : 'border-line'}`} placeholder="Tell us about your project, timeline or the equipment you need." />
              </Field>
            </div>
            <button
            type="submit"
            disabled={status === 'submitting'}
            className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-4 font-medium text-white transition-colors duration-150 hover:bg-brand-dark disabled:opacity-70 sm:w-auto">
            
              {status === 'submitting' ?
            <>
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Sending
                </> :

            <>
                  Continue in email <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
            }
            </button>
            <p className="mt-3 text-xs text-muted">Opens a draft in your email app. Nothing is sent until you send it.</p>
          </motion.form>
        }
      </AnimatePresence>
    </div>);

}

type FieldProps = {label: string;htmlFor: string;error?: string;children: React.ReactNode;};

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-brand">{error}</p>}
    </div>);

}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Please enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Please enter a valid email.';
  if (!f.interest) e.interest = 'Choose an area.';
  if (f.message.trim().length < 10) e.message = 'A few more details help us respond faster.';
  return e;
}