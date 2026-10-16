// src/features/profile/pages/ProfilePage.jsx

import { useSelector } from 'react-redux';
import PageHeader from '@/components/layout/PageHeader';

import ProfileHeader from '../components/ProfileHeader';
import ProfileInfoCard from '../components/ProfileInfoCard';
import ChangePasswordCard from '../components/ChangePasswordCard';
import PreferencesCard from '../components/PreferencesCard';

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Manage your account settings and preferences."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header — Avatar + Name + Role */}
        <ProfileHeader user={user} />

        {/* Grid: Info + Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfoCard user={user} />
            <ChangePasswordCard />
          </div>
          <div className="lg:col-span-1">
            <PreferencesCard user={user} />
          </div>
        </div>
      </div>
    </>
  );
}