// src/features/settings/pages/SettingsPage.jsx

import { useState } from 'react';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import SettingsTabs from '../components/SettingsTabs';
import SettingGroup from '../components/SettingGroup';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import {
  useGetSettingsByCategoryQuery,
  useBulkUpdateSettingsMutation
} from '../settingsApi';
// eslint-disable-next-line no-unused-vars
import { SETTINGS_TABS } from '../settingsTypes';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [dirtyValues, setDirtyValues] = useState({});
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const {
    data: res,
    isLoading,
    isFetching,
    refetch
  } = useGetSettingsByCategoryQuery(activeTab, {
    refetchOnMountOrArgChange: true
  });

  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateSettingsMutation();

  const settings = res?.data?.settings || [];

  const hasChanges = Object.keys(dirtyValues).length > 0;

  // ✅ Handle value change (local state)
  const handleChange = (key, value) => {
    setDirtyValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // ✅ Save changes
  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      // Build updates array
      const updates = Object.entries(dirtyValues).map(([key, value]) => ({
        key,
        value
      }));

      await bulkUpdate({ updates }).unwrap();
      toast.success(`${updates.length} setting(s) updated`);
      setDirtyValues({});
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save settings');
    }
  };

  // ✅ Reset changes
  const handleReset = () => {
    setDirtyValues({});
    setResetConfirmOpen(false);
    toast.success('Changes discarded');
  };

  // ✅ Tab change (with unsaved warning)
  const handleTabChange = (newTab) => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Discard them?')) {
        return;
      }
      setDirtyValues({});
    }
    setActiveTab(newTab);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage system configuration and business preferences."
        actions={
          <>
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetConfirmOpen(true)}
                disabled={isSaving}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Discard</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                  {hasChanges && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                      {Object.keys(dirtyValues).length}
                    </span>
                  )}
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {/* Tabs */}
        <SettingsTabs value={activeTab} onChange={handleTabChange} />

        {/* Settings groups */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : settings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No settings found for this category
              </p>
            </div>
          ) : (
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <SettingGroup
                settings={settings}
                dirtyValues={dirtyValues}
                onChange={handleChange}
              />
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Discard changes?"
        description="All unsaved changes will be lost."
        confirmText="Discard"
        variant="destructive"
        onConfirm={handleReset}
      />
    </>
  );
}