import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import z from 'zod';
import FormFiled from './utils/form/formFiled';
import Button from './ui/button';
import Input from './ui/input';
import { Form } from 'react-hook-form';
import From from './From';

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
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-3 w-full hover:bg-gray-100 px-2 py-2 rounded-md transition"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-primary text-white border-gray-300">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-sm">{user.name}</span>
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute bottom-[120%] left-0 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 p-2 flex flex-col gap-1">
                  <button
                    className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1"
                    onClick={() => {
                      setShowUserSettings(true);
                      setShowUserMenu(false);
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1 text-red-500"
                    onClick={() => logout()}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Settings popup card */}
      {showUserSettings && (
         <div className="fixed inset-0 backdrop-blur-lg z-999  bg-black/30 flex justify-center items-center">
          <div
            ref={settingsRef}
            className="bg-white rounded-xl shadow-lg p-6 w-[400px] max-w-[90%] animate-fadeIn"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Modifier votre profil</h2>
              <button
                onClick={() => setShowUserSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <From
              schema={userSettingsSchema}
              defaultValues={{
                name: user?.name,
                email: user?.email,
                city: user?.city || '',
                date_of_birth: user?.date_of_birth || '',
              }}
              onSubmit={handleUpdate}
            >
              <FormFiled label="Nom">
                <Input name="name" placeholder="Nom complet" />
              </FormFiled>

              <FormFiled label="Email">
                <Input name="email" placeholder="Adresse e-mail" type="email" />
              </FormFiled>

              <FormFiled label="Ville">
                <Input name="city" placeholder="Votre ville" />
              </FormFiled>

              <FormFiled label="Date de naissance">
                <Input name="date_of_birth" type="date" />
              </FormFiled>

              <Button type="submit" variant="primary">
                Sauvegarder
              </Button>
            </From>
          </div>
        </div>
      )}
    </>
  );
}
