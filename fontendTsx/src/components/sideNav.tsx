import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import z from 'zod';
import FormFiled from './utils/form/formFiled';
import Button from './ui/button';
import Input from './ui/input';
import { Form } from 'react-hook-form';
import From from './form';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Star } from 'lucide-react';
import Abonnement from '@/page/Abonnement';
import { useTranslation } from 'react-i18next';


type SideNavProps = {
  open: boolean;
  children: React.ReactNode;
  width?: string; // width in rem
};

export default function SideNav({ open, children, width = '16' }: SideNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showAbonemment, setShowAbonemment] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { user ,hasProPlus} = useAuth();
  const navigate = useNavigate()
  const { t } = useTranslation();
 
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
                 {user.profile.profile_picture ?  <img src={user.profile.profile_picture} alt="" />:"d"}
                </div>
                <div>
            
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-sm">{user.profile.name}</span>
                  {user.roles[0].role === "professionnel"?<span className="text-xs text-gray-500 truncate">{hasProPlus?'Pro+': t('common.freeAccount')}</span>:<span></span>}
                </div>
             
               
              </button>
              {
                user.roles[0].role === "professionnel" && (
                  !hasProPlus ? (
                    <div className='w-full' onClick={() => setShowAbonemment(true)}>
                      <button className='my-0 me-0 cursor-default hover:cursor-pointer text-xs p-1 rounded-full border-[1px]'>
                        {t('common.upgradeAccount')}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-2 m-2 shadow-lg">
                      <Star size={16} fill="currentColor" />
                    </div>
                  )
                )
              }
              
             
            </div>
          )}
        </div>
      </aside>
      {
        showAbonemment&&
         <div className="fixed z-999  w-full inset-0 min-h-screen bg-black/5 backdrop-blur-3xl overflow-y-auto ">
                        <Abonnement handelClose={()=>setShowAbonemment(false)}/>
          </div>

      }

    
    </>
  );
}
