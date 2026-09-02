import React from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '../components/PublicNav';
import { PublicFooter } from '../components/PublicFooter';
import { useAuth } from '../context/AuthContext';

export const FeaturesPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      badge: 'VISION ENGINE',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      title: 'Multimodal Vision Inspection',
      description: 'Powered by Gemini 2.5 Flash and Groq VLM engines. OmniSight inspects layout bounding boxes, overlapping typography, clipped containers, and contrast regressions with millimeter precision.',
      details: [
        'Pixel-accurate viewport auditing (375px Mobile, 768px Tablet, 1440px Desktop)',
        'Zero false positive heuristic bounding box detection',
        'Automatic visual artifact diffing with highlighted shift vectors',
      ],
    },
    {
      badge: 'AUTONOMOUS SELF-HEALING',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      title: 'LangGraph Self-Healing Loop',
      description: 'When regressions are detected, our self-healing agent parses your JSX AST and generates surgical Tailwind CSS class modifications to restore layout harmony.',
      details: [
        'Safe AST code modifications without altering business logic',
        'Multi-turn verification loop that re-tests fixes in headless Playwright',
        'Automatic conflict resolution and lint-clean code patches',
      ],
    },
    {
      badge: 'GITHUB & CI/CD',
      badgeColor: 'bg-teal-50 text-[#016464] border-teal-200',
      title: 'Automated Pull Request Creation',
      description: 'OmniSight connects directly to your GitHub repository. Once a visual fix is verified, it pushes a hotfix branch and opens an informative PR with before/after screenshots attached.',
      details: [
        'Detailed PR description with visual side-by-side comparisons',
        'One-click merge authorization from the OmniSight QA dashboard',
        'Automated branch cleanup and rejection handling',
      ],
    },
    {
      badge: 'ENTERPRISE RBAC',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      title: 'Role-Based QA Workflows',
      description: 'Collaborate securely with your team. QA Managers retain full control over merging and audit decisions, while Designers and Product Managers inspect runs in a read-only viewer mode.',
      details: [
        'QA Manager: Full audit trigger and GitHub merge authority',
        'Viewer: Interactive multi-device inspection for design review',
        'Audit trail logging with detailed decision history',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1A1A] font-sans antialiased selection:bg-[#016464] selection:text-white">
      <PublicNav />

      {/* Hero Header */}
      <section className="pt-16 pb-12 px-6 sm:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#016464] text-xs font-bold uppercase tracking-wider mb-4 border border-teal-200/60">
          <span>DEEP DIVE ARCHITECTURE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight">
          Engineered for autonomous visual reliability.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Explore the multimodal AI, headless browser orchestration, and self-healing agent loop that powers OmniSight.
        </p>
      </section>

      {/* Features Grid */}
      <section className="pb-24 px-6 sm:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="bg-white rounded-3xl p-8 border border-[#E8E6E1] shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border mb-4 ${feat.badgeColor}`}>
                  {feat.badge}
                </span>
                <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                {feat.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                    <svg className="w-4 h-4 text-[#016464] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-[#016464] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to automate your frontend QA?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-teal-100 font-medium leading-relaxed">
              Start auditing your live website in seconds with zero code configuration.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to={isAuthenticated ? '/app' : '/login'}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-[#016464] font-bold text-sm rounded-xl shadow transition"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Get Started Now'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
