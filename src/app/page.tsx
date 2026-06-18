
'use client';

import Link from "next/link";
import Image from "next/image"; 
import { GraduationCap, ArrowRight, BookOpen, Award, Heart, Briefcase, UserCheck } from "lucide-react";

export default function Home() {
  const sellingPoints = [
    { 
      icon: Award, 
      title: "Academic Excellence", 
      desc: "We provide quality education with experienced teachers and excellent learning resources." 
    },
    { 
      icon: Heart, 
      title: "Moral & Character Development", 
      desc: "We nurture disciplined, responsible, and confident students through strong moral values and character-building programs." 
    },
    { 
      icon: BookOpen, 
      title: "Modern Learning Environment", 
      desc: "Our school offers well-equipped classrooms, science laboratories, ICT facilities, and a conducive environment for effective learning." 
    },
    { 
      icon: Briefcase, 
      title: "Extracurricular & Vocational", 
      desc: "Develop talents and leadership through sports, debates, and entrepreneurship training (Garment making, Catering, Cosmetology, Phone repair, Coding, etc)." 
    },
    { 
      icon: UserCheck, 
      title: "Secure Learning Environment", 
      desc: "We maintain a safe campus and provide personalized attention to help every student reach their full potential." 
    }
  ];

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
          
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/img/banner2.jpg" 
              alt="Yosola School Building Campus" 
              fill
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-900/95"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
            
            <span className="inline-block py-1.5 px-4 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-lg animate-fade-in-up">
              Welcome to the Digital Campus
            </span>
            
            {/* Slogan Integrated Here */}
            <h1 className="text-5xl md:text-7xl font-bold text-white font-serif mb-6 leading-tight drop-shadow-lg">
              Where We Are <br/> Building Geniuses
            </h1>
            
            <p className="text-xl text-slate-200 mb-10 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Manage academic progress, check results, and stay connected with our community—all in one secure place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/login"
                className="group px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Enter Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- Mission, Vision & Identity Section --- */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              
              {/* Text Content */}
              <div>
                <div className="mb-10">
                  <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">Our Vision</h2>
                  <h3 className="text-3xl font-bold text-slate-900 font-serif leading-tight">
                    To lead holistic, inclusive, innovative world-class education.
                  </h3>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">Our Mission</h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Our mission is to promote lifelong learning in an open and caring atmosphere that motivates students to be confident and responsible global citizens.
                  </p>
                </div>
              </div>

              {/* Decorative Image Grid (Kept intact from your original code) */}
              <div className="grid grid-cols-2 gap-4 relative">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                 <div className="space-y-4 mt-12">
                    <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden relative shadow-lg group">
                       <Image 
                         src="/img/yosola-primary.jpg"  
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
                         src="/img/Yosola prefects.jpg" 
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

        {/* --- The Yosola Selling Points Grid --- */}
        <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 font-serif mb-4">The Yosola Advantage</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Discover what makes our educational approach unique and why we are the best choice for your child's future.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sellingPoints.map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                  <div className="bg-amber-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                    <item.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h4 className="text-xl text-slate-900 font-bold mb-3">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- Simple Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
             <GraduationCap className="w-5 h-5 text-amber-500" />
             <span className="text-slate-200 font-semibold font-serif">Yosola Schools</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Yosola Educational Services. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
             <Link href="#" className="hover:text-white transition-colors">Support</Link>
             <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


