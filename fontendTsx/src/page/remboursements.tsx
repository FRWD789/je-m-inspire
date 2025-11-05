import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CreateRemboursementForm } from '../components/remboursements/CreateRemboursementForm';
import { AdminRemboursements } from '../components/remboursements/AdminRemboursements';
import { MesRemboursements } from '../components/remboursements/MesRemboursements';
import { AlertCircle } from 'lucide-react';

export default function RemboursementsPage() {
  const { user } = useAuth();

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.roles?.some((role: any) => role.role === 'admin');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isAdmin ? 'Gestion des remboursements' : 'Mes remboursements'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Gérez toutes les demandes de remboursement de la plateforme' 
              : 'Consultez vos demandes de remboursement et créez-en de nouvelles'}
          </p>
        </div>

        {/* Contenu selon le rôle */}
        {isAdmin ? (
          <AdminRemboursements />
        ) : (
          <div className="grid gap-8">
            {/* Formulaire de création */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Nouvelle demande de remboursement
              </h2>
              <CreateRemboursementForm />
            </div>

            {/* Liste des demandes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Historique de mes demandes
              </h2>
              <MesRemboursements />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
