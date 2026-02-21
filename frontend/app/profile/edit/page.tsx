'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  X, 
  User, 
  Building2, 
  GraduationCap, 
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    education: '',
    experience: '',
    portfolio: '',
    github: '',
    linkedin: '',
    twitter: '',
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?._id) {
        router.push('/login');
        return;
      }

      try {
        const response = await userAPI.getProfile(currentUser._id);
        const profile = response.data;
        
        setFormData({
          name: profile.name || '',
          username: profile.username || '',
          education: profile.education || '',
          experience: profile.experience || '',
          portfolio: profile.social?.portfolio || '',
          github: profile.social?.github || '',
          linkedin: profile.social?.linkedin || '',
          twitter: profile.social?.twitter || '',
          skills: profile.skills || [],
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?._id) return;

    setSaving(true);
    try {
      await userAPI.updateProfile(currentUser._id, {
        name: formData.name,
        username: formData.username,
        education: formData.education,
        experience: formData.experience,
        social: {
          portfolio: formData.portfolio,
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
        },
        skills: formData.skills,
      });

      router.push(`/profile/${currentUser._id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-8 relative">
          {/* Background Gradient Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-green-600/10 via-blue-600/10 to-purple-600/10 blur-3xl -z-10"></div>
          
          <div className="flex items-center gap-4 mb-3">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  Edit Profile
                  <Sparkles className="w-8 h-8 text-green-500 animate-pulse" />
                </h1>
              </div>
              <p className="text-gray-400 text-sm mt-2">Update your profile information and settings</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {/* Personal Information */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] shadow-2xl p-6 md:p-8 hover-lift transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                <p className="text-sm text-gray-400">Tell us about yourself</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#252525] border-[#3a3a3a] text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all h-12 text-lg"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Username
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-[#252525] border-[#3a3a3a] text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-12 text-lg"
                  placeholder="johndoe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  Education
                </label>
                <Input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="bg-[#252525] border-[#3a3a3a] text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all h-12 text-lg"
                  placeholder="MIT, Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-500" />
                  Experience
                </label>
                <Input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="bg-[#252525] border-[#3a3a3a] text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all h-12 text-lg"
                  placeholder="Software Engineer at Google"
                />
              </div>
            </div>
          </div>

          {/* Social Presence */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] shadow-2xl p-6 md:p-8 hover-lift transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Social Presence</h2>
                <p className="text-sm text-gray-400">Connect your online profiles</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Portfolio Website
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    className="bg-[#252525] border-[#3a3a3a] text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all h-12 text-lg pl-4"
                    placeholder="https://yourportfolio.com"
                  />
                  {formData.portfolio && <CheckCircle2 className="absolute right-3 top-3 w-6 h-6 text-green-500" />}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-400" />
                  GitHub Profile
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="bg-[#252525] border-[#3a3a3a] text-white focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all h-12 text-lg pl-4"
                    placeholder="https://github.com/username"
                  />
                  {formData.github && <CheckCircle2 className="absolute right-3 top-3 w-6 h-6 text-green-500" />}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="bg-[#252525] border-[#3a3a3a] text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all h-12 text-lg pl-4"
                    placeholder="https://linkedin.com/in/username"
                  />
                  {formData.linkedin && <CheckCircle2 className="absolute right-3 top-3 w-6 h-6 text-green-500" />}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-300" />
                  Twitter Profile
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="bg-[#252525] border-[#3a3a3a] text-white focus:border-blue-300 focus:ring-2 focus:ring-blue-300/20 transition-all h-12 text-lg pl-4"
                    placeholder="https://twitter.com/username"
                  />
                  {formData.twitter && <CheckCircle2 className="absolute right-3 top-3 w-6 h-6 text-green-500" />}
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] shadow-2xl p-6 md:p-8 hover-lift transition-all group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Skills & Expertise</h2>
                <p className="text-sm text-gray-400">Showcase your technical skills</p>
              </div>
            </div>
            
            <div className="flex gap-2 mb-6">
              <Input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="bg-[#252525] border-[#3a3a3a] text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all h-12 text-lg"
                placeholder="Add a skill (e.g., JavaScript, Python, React...)"
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                className="bg-linear-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 h-12 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <Award className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {formData.skills.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#2a2a2a] rounded-xl">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No skills added yet</p>
                <p className="text-gray-500 text-sm mt-2">Add your first skill to get started!</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-[#2a2a2a] border border-[#3a3a3a] text-gray-200 px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#333333] transition-all shadow-md"
                  >
                    <Award className="w-4 h-4 text-yellow-500" />
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-[#2a2a2a] -mx-4 md:-mx-6 px-4 md:px-6 py-6 mt-8">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-center sm:text-left">
                <p className="text-gray-400 text-sm">
                  💡 Make sure all information is accurate before saving
                </p>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1 sm:flex-none border-2 border-[#3a3a3a] text-gray-300 hover:text-white hover:bg-[#2a2a2a] h-12 px-8 transition-all font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12 px-8 transition-all font-semibold shadow-2xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
