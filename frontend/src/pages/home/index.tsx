import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, CheckCircle, ArrowRight, Youtube, Instagram, Zap, Shield, Play, BarChart2, TrendingUp, Award, Globe, BarChart as ChartBar, Target } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-grid-blue-100/25" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
                <Award className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">
                  Trusted by Fortune 500 Companies
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Enterprise Social Media
                <span className="block text-blue-600">Management Platform</span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
                Streamline your social media operations with enterprise-grade automation and analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
                <button
                  onClick={() => navigate('/register')}
                  className="enterprise-button"
                >
                  <span className="flex items-center justify-center">
                    Schedule Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </button>
                <button className="enterprise-button-outline">
                  <span className="flex items-center justify-center">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Overview
                  </span>
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center opacity-75">
                {['Forbes', 'TechCrunch', 'Bloomberg', 'Reuters'].map((brand) => (
                  <div key={brand} className="text-gray-400 font-semibold">
                    {brand}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Stats Dashboard */}
            <div className="relative hidden lg:block">
              <div className="enterprise-glass rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: BarChart2, label: 'Performance Analytics', value: '+45%' },
                    { icon: Users, label: 'Audience Growth', value: '+2.5M' },
                    { icon: Globe, label: 'Global Reach', value: '150+' },
                    { icon: CheckCircle, label: 'Tasks Automated', value: '10K+' }
                  ].map((stat, index) => (
                    <div key={index} 
                      className="p-6 rounded-xl bg-white enterprise-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-50">
                          <stat.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Growth Chart */}
                <div className="mt-8 p-6 rounded-xl bg-white enterprise-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Growth Overview</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                      +28% vs Last Month
                    </span>
                  </div>
                  <div className="h-48 bg-gradient-to-b from-blue-50 to-transparent rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Solutions
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for modern social media management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Advanced Targeting",
                description: "AI-powered audience segmentation and targeting",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SOC 2 Type II certified infrastructure",
              },
              {
                icon: ChartBar,
                title: "Analytics Suite",
                description: "Comprehensive performance tracking and insights",
              },
              {
                icon: Globe,
                title: "Global Scale",
                description: "Multi-market campaign management",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Role-based access control and workflows",
              },
              {
                icon: Zap,
                title: "Automation",
                description: "Intelligent process automation and scheduling",
              }
            ].map((feature, index) => (
              <div key={index} 
                className="enterprise-card p-8"
              >
                <div className="p-3 rounded-lg bg-blue-50 w-fit">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-12 md:p-16 enterprise-shadow text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Social Media Strategy?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join leading enterprises already using our platform to drive results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="enterprise-button"
              >
                <span className="flex items-center justify-center">
                  Request Enterprise Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </button>
              <button className="enterprise-button-outline">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}