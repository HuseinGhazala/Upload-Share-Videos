'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    title: 'شحن سريع',
    desc: 'توصيل خلال ٢٤ إلى ٤٨ ساعة داخل المدن الرئيسية.',
    icon: '🚚',
  },
  {
    title: 'دفع آمن',
    desc: 'تشفير كامل لبيانات البطاقات والمحافظ الرقمية.',
    icon: '🔒',
  },
  {
    title: 'إرجاع ميسّر',
    desc: 'استرجاع المنتجات خلال ١٤ يوماً بإجراءات بسيطة.',
    icon: '↩️',
  },
  {
    title: 'دعم على مدار الساعة',
    desc: 'فريق خدمة عملاء جاهز للرد في أي وقت.',
    icon: '💬',
  },
];

/** GSAP + ScrollTrigger: scroll-revealed feature cards */
export default function FeatureSection() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.shop-feature-card');
      gsap.from(cards, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        y: 56,
        opacity: 0,
        duration: 0.75,
        stagger: 0.14,
        ease: 'power3.out',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="features" ref={sectionRef} className="mb-16 scroll-mt-24">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-indigo-300/80 mb-2">لماذا تختارنا؟</p>
        <h2 className="text-2xl sm:text-3xl font-bold">مميزات تجربتنا</h2>
        <p className="text-white/55 text-sm mt-2 max-w-lg mx-auto">
          هذا القسم يُحرَّك عبر GSAP ScrollTrigger عند التمرير.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="shop-feature-card glass-panel p-5 opacity-0"
          >
            <span className="text-2xl mb-3 block" aria-hidden>
              {f.icon}
            </span>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
