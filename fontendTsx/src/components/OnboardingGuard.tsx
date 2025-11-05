import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import OnBoarding from "./OnBoarding";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  console.log(user)
  useEffect(() => {
    if (
      user &&
      !(user.auth_info?.onboarding_completed ?? false) &&
      !(user.auth_info?.onboarding_skipped ?? false)
    ) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (showOnboarding) {
    return <OnBoarding onComplete={() => setShowOnboarding(false)} />;
  }

  return <>{children}</>;
}