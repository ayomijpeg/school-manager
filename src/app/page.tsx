'use client';

import Link from "next/link";
import Image from "next/image"; 
import { GraduationCap, ArrowRight, ShieldCheck, BookOpen, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* --- Simple Portal Header --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 py-4 fixed w-full top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-2 rounded-lg">
               <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-serif text-slate-900 tracking-tight">
              Yosola Schools
            </span>
          </div>

          {/* Action Button */}
          <Link 
            href="/auth/login" 
            className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-slate-800 hover:shadow-lg transition-all"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* --- Main Hero Section --- */}
      <main className="grow pt-20">
        <div className="relative h-[650px] flex items-center justify-center bg-slate-900 overflow-hidden">
          
          {/* Background Image with Lighter Overlay */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/img/banner2.jpg" // ✅ Corrected path with leading slash
              alt="Yosola School Building Campus" 
              fill
              className="object-cover" // ✅ Removed opacity-40 so image is clear
              priority 
            />
            {/* Improved Gradient: Clearer at top, darker at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/60 to-slate-900/90"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
            
            {/* Animated Badge */}
            <span className="inline-block py-1.5 px-4 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold tracking-widest uppercase mb-8 shadow-lg animate-fade-in-up">
              Welcome to the Digital Campus
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white font-serif mb-8 leading-tight drop-shadow-lg">
              Excellence in <br/> Every Endeavor
            </h1>
            
            <p className="text-xl text-slate-200 mb-10 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Welcome to the official Yosola Schools portal. Manage academic progress, 
              check results, and stay connected with our community—all in one secure place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="group px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- About / Info Section --- */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              
              {/* Text Content */}
              <div>
                <h2 className="text-4xl font-bold text-slate-900 font-serif mb-6 leading-tight">
                  Nurturing Future Leaders
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  At Yosola Schools, we are committed to providing a holistic education that blends academic rigor with moral integrity. Our digital portal ensures that parents, teachers, and students stay perfectly aligned in this mission.
                </p>
                <ul className="space-y-6">
                  {[
                    { icon: ShieldCheck, text: "Secure & Private Data Access", desc: "Your child's data is protected with enterprise-grade security." },
                    { icon: BookOpen, text: "Real-time Academic Reporting", desc: "Track grades, attendance, and performance instantly." },
                    { icon: Users, text: "Seamless Parent-Teacher Connection", desc: "Direct communication channels for better support." }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="bg-amber-50 p-3 rounded-xl shrink-0">
                        <item.icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold">{item.text}</h4>
                        <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative Image Grid */}
              <div className="grid grid-cols-2 gap-4 relative">
                 {/* Decor dots */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                 <div className="space-y-4 mt-12">
                    <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative shadow-lg group">
                       <Image 
                         src="/img/yosola-primary.jpg"  // ✅ Leading slash added
                         alt="Yosola Schools Students engaged in learning" 
                         fill
                         className="object-cover group-hover:scale-110 transition-transform duration-700"
                         sizes="(max-width: 768px) 100vw, 50vw"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    </div>
                    <div className="h-32 bg-amber-50 rounded-2xl flex flex-col items-center justify-center text-amber-600 p-6 text-center border border-amber-100">
                       <div className="text-4xl font-serif font-bold mb-1">15+</div>
                       <div className="text-xs uppercase tracking-wide font-semibold opacity-80">Years of Excellence</div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="h-32 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center shadow-xl">
                       <div className="text-4xl font-serif font-bold mb-1 text-amber-400">100%</div>
                       <div className="text-xs uppercase tracking-wide font-semibold opacity-80">Graduation Rate</div>
                    </div>
                    <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative shadow-lg group">
                       <Image 
                         src="/img/Yosola prefects.jpg" // ✅ Leading slash added
                         alt="Yosola Schools Prefects representing leadership" 
                         fill
                         className="object-cover group-hover:scale-110 transition-transform duration-700"
                         sizes="(max-width: 768px) 100vw, 50vw"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* --- Simple Footer --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Yosola Educational Services. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0 font-medium">
             <Link href="#" className="hover:text-slate-900 transition-colors">Support</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
