
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Shield,
  Package,
  Wheat,
  Store,
  Check,
  Star,
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Target,
  Sparkles,
  MessageCircle,
  Camera,
  ThumbsUp,
  Award,
  Leaf,
  Mail,
  KeyRound,
  Loader2,
  Phone,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Role } from "@/lib/types";
import { FirebaseError } from "firebase/app";

const roles: {id: Role, title: string, description: string, icon: React.ElementType, color: string, emoji: string}[] = [
  {
    id: "vendor",
    title: "Vendor",
    description: "Street-food vendor, restaurant",
    icon: Store,
    color: "from-orange-500/20 to-yellow-500/20",
    emoji: "🍜",
  },
  {
    id: "supplier",
    title: "Supplier",
    description: "Wholesale distribution network",
    icon: Package,
    color: "from-blue-500/20 to-cyan-500/20",
    emoji: "📦",
  },
  {
    id: "farmer",
    title: "Farmer",
    description: "Agricultural producer",
    icon: Wheat,
    color: "from-green-500/20 to-emerald-500/20",
    emoji: "🌾",
  },
];


const appFeatures = [
  {
    icon: Users,
    title: "Verified Community",
    description: "Thousands of verified vendors, wholesalers, and farmers you can trust.",
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Target,
    title: "Bid Board Matching",
    description: "Post your requirement and receive real-time bids instantly.",
    color: "from-emerald-500 to-teal-500",
    gradient: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Camera,
    title: "Order Lifecycle Tracking",
    description: "Every order has a pre- and post-delivery photo, timestamped for full transparency.",
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
  },
  {
    icon: Award,
    title: "Trust Badge System",
    description: "Automatically awarded badges for cleanliness, punctuality, and weight accuracy.",
    color: "from-yellow-500 to-orange-500",
    gradient: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Updates",
    description: "Free delivery updates right on WhatsApp.",
    color: "from-green-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
  },
  {
    icon: ThumbsUp,
    title: "Post-Delivery Ratings",
    description: "Rate every order on freshness, quantity accuracy, and delivery time.",
    color: "from-red-500 to-rose-500",
    gradient: "bg-gradient-to-br from-red-500/10 to-rose-500/10",
  },
]

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Street-Food Vendor",
    location: "Mexico City",
    image: "https://placehold.co/60x60.png",
    rating: 5,
    text: "Cut my supply costs by 35% and found reliable partners in just 2 weeks! The platform is incredibly intuitive.",
    savings: "$2,400/month",
  },
  {
    name: "Chen Wei",
    role: "Wholesale Distributor",
    location: "Shanghai",
    image: "https://placehold.co/60x60.png",
    rating: 5,
    text: "Expanded my network to 200+ vendors across Asia. The verification process gives me complete confidence.",
    growth: "300% increase",
  },
  {
    name: "Ahmed Hassan",
    role: "Food Producer",
    location: "Cairo",
    image: "https://placehold.co/60x60.png",
    rating: 5,
    text: "Direct connections eliminated middlemen. My profit margins increased by 40% in the first quarter.",
    profit: "40% increase",
  },
]

export default function SupplyChainConnect() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | ''>("vendor");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, successRate: 0, volume: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const router = useRouter();
  const { user, signupWithPhone, loginWithPhone } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        if(user.role === 'supplier') {
            router.replace('/supplier-dashboard');
        } else {
            router.replace('/dashboard');
        }
    }
  }, [user, router]);


  useEffect(() => {
    const animateStats = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setStats({
          users: Math.floor(15847 * progress),
          successRate: Math.floor(989 * progress) / 10,
          volume: Math.floor(24 * progress) / 10,
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setStats({ users: 15847, successRate: 98.9, volume: 2.4 })
        }
      }, stepDuration)
    }

    const timer = setTimeout(animateStats, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAuthSubmit = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    if (!phoneNumber || !password || (type === 'signup' && (!businessName || !selectedRole))) {
      toast({ variant: 'destructive', title: "Missing Information", description: "Please fill out all required fields." });
      return;
    }

    setIsLoading(true);
    try {
      if (type === 'signup') {
        await signupWithPhone(phoneNumber, password, { role: selectedRole as Role, businessName });
        toast({ title: "Welcome!", description: "Your account has been created successfully." });
      } else {
        await loginWithPhone(phoneNumber, password);
        toast({ title: "Welcome Back!", description: "You have successfully logged in." });
      }
    } catch (error) {
      let message = "An unknown error occurred.";
      if (error instanceof FirebaseError) {
          switch (error.code) {
              case 'auth/email-already-in-use':
                  message = 'This phone number is already registered. Please log in.';
                  break;
              case 'auth/invalid-email':
                  message = 'Please enter a valid phone number.';
                  break;
              case 'auth/weak-password':
                  message = 'Password should be at least 6 characters.';
                  break;
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  message = 'Invalid phone number or password.';
                  break;
              default:
                  message = `An error occurred: ${error.message}`;
          }
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast({ variant: "destructive", title: "Authentication Failed", description: message });
    } finally {
      setIsLoading(false);
    }
  }

  const handleStartForFree = () => {
    const formSection = document.getElementById('signup-form');
    formSection?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="premium-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" />
                </pattern>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{ stopColor: "#5B758C", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#5B758C", stopOpacity: 0 }} />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#premium-grid)" />
              <circle cx="50" cy="50" r="30" fill="url(#glow)" />
            </svg>
          </div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-slate-500/10 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      <div className="relative z-10">
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-4">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-5">
                <div className="flex justify-center lg:justify-start">
                  <Badge
                    variant="outline"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-blue-500/30 text-blue-400 hover:bg-slate-700/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Revolutionizing Street-Food Supply
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                      Secure.
                    </div>
                    <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                      Fast.
                    </div>
                    <div className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Fair.
                    </div>
                  </h1>
                </div>

                <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  Connect directly with verified suppliers, eliminate middlemen, and transform your street-food business
                  with our secure authentication platform.
                </p>

                <Card className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center group cursor-pointer">
                        <div className="flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-5 h-5 text-emerald-400 mr-2" />
                          <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                            {stats.users.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">Verified Users</div>
                      </div>
                      <div className="text-center group cursor-pointer">
                        <div className="flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                          <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                          <div className="text-2xl md:text-3xl font-bold text-blue-400">{stats.successRate}%</div>
                        </div>
                        <div className="text-sm text-slate-400">Success Rate</div>
                      </div>
                      <div className="text-center group cursor-pointer">
                        <div className="flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                          <DollarSign className="w-5 h-5 text-purple-400 mr-2" />
                          <div className="text-2xl md:text-3xl font-bold text-purple-400">${stats.volume}M+</div>
                        </div>
                        <div className="text-sm text-slate-400">Monthly Volume</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={handleStartForFree}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start for Free
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800/50 px-8 py-4 rounded-xl backdrop-blur-sm bg-transparent"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    View Demo
                  </Button>
                </div>
              </div>

              <div className="mx-auto w-full max-w-md" id="signup-form">
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-2xl border border-slate-600/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                  <CardContent className="p-8">
                    <Tabs defaultValue="signup" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border-slate-600">
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            <TabsTrigger value="login">Log In</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signup" className="space-y-6 pt-6">
                            <form onSubmit={(e) => handleAuthSubmit(e, 'signup')} className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="signup-phone" className="text-sm font-semibold text-white flex items-center"><Phone className="w-4 h-4 mr-2" />Phone Number</Label>
                                    <Input id="signup-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 123-456-7890" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-0" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="text-sm font-semibold text-white flex items-center"><KeyRound className="w-4 h-4 mr-2" />Password</Label>
                                    <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-0" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessName" className="text-sm font-semibold text-white flex items-center"><Store className="w-4 h-4 mr-2" />Business Name</Label>
                                    <Input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., Acme Fresh Produce" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-0" required />
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-sm font-semibold text-white flex items-center"><Target className="w-4 h-4 mr-2" />Select Your Role</Label>
                                  <div className="space-y-3">
                                    {roles.map((role) => (
                                      <div key={role.id} onClick={() => setSelectedRole(role.id)} className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] group ${selectedRole === role.id ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/25" : "bg-slate-700/30 border border-slate-600 hover:border-slate-500 hover:bg-slate-600/30"}`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 text-2xl bg-gradient-to-br ${role.color} group-hover:scale-110 transition-transform duration-300`}>{role.emoji}</div>
                                        <div className="flex-1">
                                          <div className="font-semibold text-white">{role.title}</div>
                                          <div className="text-sm text-slate-400">{role.description}</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 transition-all ${selectedRole === role.id ? "border-blue-500 bg-blue-500 shadow-lg" : "border-slate-500"}`}>{selectedRole === role.id && (<div className="w-2 h-2 bg-white rounded-full m-auto mt-1" />)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                                  {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                                </Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="login" className="space-y-6 pt-6">
                            <form onSubmit={(e) => handleAuthSubmit(e, 'login')} className="space-y-4">
                               <div className="space-y-2">
                                    <Label htmlFor="login-phone" className="text-sm font-semibold text-white flex items-center"><Phone className="w-4 h-4 mr-2" />Phone Number</Label>
                                    <Input id="login-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1 123-456-7890" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-0" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="text-sm font-semibold text-white flex items-center"><KeyRound className="w-4 h-4 mr-2" />Password</Label>
                                    <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-0" required />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                    <p className="text-xs text-slate-400 text-center leading-relaxed bg-slate-800/20 p-3 rounded-lg mt-6">
                          By continuing, you agree to our{" "}
                          <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                            Privacy Policy
                          </a>
                    </p>
                  </CardContent>
                </Card>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400 mb-4">Trusted by industry leaders worldwide</p>
                  <div className="flex justify-center space-x-8 opacity-60">
                    <div
                      className="text-2xl animate-bounce hover:scale-125 transition-transform cursor-pointer"
                      style={{ animationDelay: "0s" }}
                    >
                      🏪
                    </div>
                    <div
                      className="text-2xl animate-bounce hover:scale-125 transition-transform cursor-pointer"
                      style={{ animationDelay: "0.2s" }}
                    >
                      🚚
                    </div>
                    <div
                      className="text-2xl animate-bounce hover:scale-125 transition-transform cursor-pointer"
                      style={{ animationDelay: "0.4s" }}
                    >
                      🌾
                    </div>
                    <div
                      className="text-2xl animate-bounce hover:scale-125 transition-transform cursor-pointer"
                      style={{ animationDelay: "0.6s" }}
                    >
                      📱
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30">
                Core App Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
                Built for your success
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Discover the powerful features that make our platform the preferred choice for supply chain
                professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {appFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 hover:scale-105 group cursor-pointer overflow-hidden"
                >
                  <CardContent className="p-8 relative">
                    <div
                      className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <div className="relative z-10">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                      >
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30">
                Success Stories
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
                Loved by thousands worldwide
              </h2>
            </div>

            <div className="relative">
              <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <Image
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      width={60}
                      height={60}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/30"
                      data-ai-hint="person portrait"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex justify-center md:justify-start text-yellow-400 mb-4">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xl md:text-2xl text-slate-300 italic mb-6 leading-relaxed">
                        "{testimonials[currentTestimonial].text}"
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-bold text-white text-lg">{testimonials[currentTestimonial].name}</div>
                          <div className="text-slate-400">
                            {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                          </div>
                        </div>
                        <Badge className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30">
                          {testimonials[currentTestimonial].savings ||
                            testimonials[currentTestimonial].growth ||
                            testimonials[currentTestimonial].profit}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center mt-8 space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
                  }
                  className="border-slate-600 text-slate-400 hover:bg-slate-800/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex space-x-2 items-center">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTestimonial ? "bg-blue-500 w-8" : "bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="border-slate-600 text-slate-400 hover:bg-slate-800/50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/50 shadow-2xl">
              <CardContent className="p-12">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6">
                  Ready to transform your supply chain?
                </h2>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of successful vendors, wholesalers, and producers who have revolutionized their
                  business with our platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleStartForFree}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start for Free
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800/50 px-8 py-4 rounded-xl backdrop-blur-sm bg-transparent"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Schedule Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
