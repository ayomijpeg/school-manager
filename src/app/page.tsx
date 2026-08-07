'use client';

import Link from "next/link";
import Image from "next/image"; 
import { 
  GraduationCap, ArrowRight, BookOpen, Award, Heart, 
  Briefcase, UserCheck, LayoutDashboard, FileText, 
  CreditCard, Bell 
} from "lucide-react";

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

  const portalFeatures = [
    {
      icon: FileText,
      title: "Academic Records",
      desc: "Instantly access termly results, continuous assessments, and historical academic data."
    },
    {
      icon: CreditCard,
      title: "Fee Management",
      desc: "View fee structures, track payment status, and securely process tuition digitally."
    },
    {
      icon: LayoutDashboard,
      title: "Student Dashboard",
      desc: "A personalized view of timetables, upcoming assignments, and daily attendance."
    },
    {
      icon: Bell,
      title: "Instant Updates",
      desc: "Receive real-time notifications about school announcements, holidays, and PTA meetings."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* --- Portal Header --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 py-4 fixed w-full top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 p-2 rounded-lg">
               <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-serif text-slate-900 tracking-tight">
              Yosola Schools
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="#features" className="hidden md:block text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors">
              Portal Features
            </Link>
            <Link 
              href="/auth/login" 
              className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-slate-800 hover:shadow-lg transition-all flex items-center gap-2"
            >
              Secure Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* --- Main Hero Section --- */}
      <main className="grow pt-20">
        <div className="relative min-h-[700px] flex items-center justify-center bg-slate-900 overflow-hidden">
          
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/img/banner2.jpg" 
              alt="Yosola School Building Campus" 
              fill
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-10 grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Text */}
            <div className="text-left">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Yosola Campus Portal v2.0
              </span>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white font-serif mb-6 leading-tight drop-shadow-lg">
                Where We Are <br/> Building <span className="text-amber-500">Geniuses</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 mb-10 font-light leading-relaxed max-w-lg drop-shadow-md">
                Your centralized gateway for academic tracking, administrative management, and staying connected with the Yosola community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/login"
                  className="group px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2"
                >
                  Access Dashboard
                  <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
                <Link 
                  href="#features"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl font-medium text-lg transition-all flex items-center justify-center"
                >
                  View Features
                </Link>
              </div>
            </div>

            {/* Right Side: Mock Portal UI Element to make it feel like a software gateway */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">portal.yosolaschools.com</div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-1/3 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse delay-75"></div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="h-24 bg-slate-700/50 rounded-xl border border-slate-600"></div>
                    <div className="h-24 bg-slate-700/50 rounded-xl border border-slate-600"></div>
                  </div>
                  <div className="h-12 w-full bg-amber-500/20 border border-amber-500/50 rounded-xl mt-4 flex items-center justify-center text-amber-500 text-sm font-medium">
                    Secure Connection Established
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- NEW: Portal Capabilities Section --- */}
        <section id="features" className="py-20 px-6 bg-slate-900 border-t border-slate-800 text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full bg-amber-500/10 blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-serif mb-4">Everything You Need in One Place</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Our digital platform bridges the gap between the classroom and home, providing transparency and seamless management.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {portalFeatures.map((feature, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl hover:bg-slate-800 transition-colors">
                  <feature.icon className="w-10 h-10 text-amber-400 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Mission, Vision & Identity Section --- */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              
              <div>
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-amber-600 font-serif uppercase tracking-widest mb-4">Our Vision</h2>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif leading-tight">
                    To lead holistic, inclusive, innovative world-class education.
                  </h3>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-amber-600 font-serif uppercase tracking-widest mb-4">Our Mission</h2>
                  <p className="text-xl md:text-2xl text-slate-700 font-serif leading-relaxed mb-6">
                    Our mission is to promote lifelong learning in an open and caring atmosphere that motivates students to be confident and responsible global citizens.
                  </p>
                  <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-900 text-sm font-medium">
                    This portal is designed to digitally support this mission, ensuring parents and educators remain aligned in every student's journey.
                  </div>
                </div>
              </div>

              {/* Decorative Image Grid */}
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
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="bg-amber-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                    <item.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h4 className="text-xl text-slate-900 font-bold mb-3">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-sm flex-grow">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
             <GraduationCap className="w-5 h-5 text-amber-500" />
             <span className="text-slate-200 font-semibold font-serif">Yosola Schools</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Yosola Educational Services. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
             <Link href="#" className="hover:text-white transition-colors">Portal Help</Link>
             <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
