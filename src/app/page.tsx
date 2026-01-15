'use client';

import Link from "next/link";
import Image from "next/image"; // 🟢 Import Next.js Image component
import { GraduationCap, ArrowRight, ShieldCheck, BookOpen, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* --- Simple Portal Header --- */}
      <header className="bg-white border-b border-slate-200 py-4 fixed w-full top-0 z-50">
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
            className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* --- Main Hero Section --- */}
      <main className="grow pt-20"> {/* 🟢 Fixed 'flex-grow' to 'grow' */}
        <div className="relative h-[600px] flex items-center justify-center bg-slate-900 overflow-hidden">
          
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {/* 🟢 Replaced <img> with <Image> for performance */}
            <Image 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
              alt="Yosola School Building Campus" 
              fill
              className="object-cover opacity-40"
              priority // Loads this image first
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/95"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto mt-10">
            <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6 border border-amber-500/30">
              Welcome to the Digital Campus
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white font-serif mb-6 leading-tight">
              Excellence in <br/> Every Endeavor
            </h1>
            <p className="text-lg text-slate-300 mb-10 font-light leading-relaxed">
              Welcome to the official Yosola Schools portal. Manage academic progress, 
              check results, and stay connected with our community—all in one secure place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="group px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- About / Info Section --- */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Text Content */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 font-serif mb-6">
                  Nurturing Future Leaders
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  At Yosola Schools, we are committed to providing a holistic education that blends academic rigor with moral integrity. Our digital portal ensures that parents, teachers, and students stay perfectly aligned in this mission.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "Secure & Private Data Access" },
                    { icon: BookOpen, text: "Real-time Academic Reporting" },
                    { icon: Users, text: "Seamless Parent-Teacher Connection" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                      <item.icon className="w-5 h-5 text-amber-500" />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative Image Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4 mt-8">
                    <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden relative">
                       {/* 🟢 Updated Image 1: Banner */}
                       <Image 
                         src="/img/banner2.jpg" 
                         alt="Yosola Schools Students engaged in learning" 
                         fill
                         className="object-cover hover:scale-105 transition-transform duration-500"
                         sizes="(max-width: 768px) 100vw, 50vw"
                       />
                    </div>
                    <div className="h-32 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 p-6 text-center">
                       <div>
                          <div className="text-3xl font-serif font-bold">15+</div>
                          <div className="text-xs uppercase tracking-wide">Years of Excellence</div>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="h-32 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 p-6 text-center">
                       <div>
                          <div className="text-3xl font-serif font-bold">100%</div>
                          <div className="text-xs uppercase tracking-wide">Graduation Rate</div>
                       </div>
                    </div>
                    <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden relative">
                       {/* 🟢 Updated Image 2: Prefects */}
                       <Image 
                         src="/img/Yosola prefects.jpg" 
                         alt="Yosola Schools Prefects representing leadership" 
                         fill
                         className="object-cover hover:scale-105 transition-transform duration-500"
                         sizes="(max-width: 768px) 100vw, 50vw"
                       />
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* --- Simple Footer --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Yosola Educational Services.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <Link href="#" className="hover:text-slate-900 transition-colors">Contact Support</Link>
             <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
