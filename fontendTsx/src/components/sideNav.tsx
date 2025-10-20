import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import z from 'zod';
import FormFiled from './utils/form/formFiled';
import Button from './ui/button';
import Input from './ui/input';
import { Form } from 'react-hook-form';
import From from './form';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';

type SideNavProps = {
  open: boolean;
  children: React.ReactNode;
  width?: string; // width in rem
};
const userSettingsSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  city: z.string().optional(),
  date_of_birth: z.string().optional(),
});
export default function SideNav({ open, children, width = '16' }: SideNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { user ,updateProfile,logout} = useAuth();
  const navigate = useNavigate()
  // ✅ Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // ✅ Close settings popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowUserSettings(false);
      }
    }

    if (showUserSettings) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserSettings]);
     async function handleUpdate(values: any) {
    try {
      await updateProfile(values);
      setShowUserSettings(false); // close modal on success
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    }
  }
   

  return (
    <>
      <aside
        className={`fixed top-2 left-2 h-[calc(100%-1rem)] rounded-xl bg-[#F8F6F2] shadow-md text-gray-800 transition-all duration-300 overflow-hidden`}
        style={{ width: open ? `${width}rem` : '0rem' }}
      >
        <div
          className={`px-4 py-6 flex justify-between flex-col h-full transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div>{children}</div>

               
          {user && (
            <div className="relative flex items-center" ref={menuRef}>
              <button
                className="flex items-center  gap-1 w-full hover:bg-gray-100 px-2 py-2 rounded-md transition"
                onClick={() => navigate("/dashboard/profile-settings")}
              >
                
                <div className="w-10 h-10 cursor-pointer rounded-full border hover:scale-110 transition flex items-center justify-center bg-primary text-white border-gray-300 overflow-hidden">
                 {user.profile_picture ?  <img src={`http://localhost:8000/storage/${user.profile_picture}`} alt="" />:user.name[0].toUpperCase()}
                </div>
                <div>
            
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-sm">{user.name}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </div>
               
              </button>
              <LogOut onClick={() => logout()} className='hover:text-accent hover:scale-110 transition cursor-pointer' />
            </div>
          )}
        </div>
      </aside>

    
    </>
  );
}
