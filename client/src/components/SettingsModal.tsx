import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { initAutoSync, isSignedIn, signIn, signOut } from '@/lib/googleDriveSync';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [listView, setListView] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState('realtime');
  const [userSignedIn, setUserSignedIn] = useState(false);
  
  // Check if user is signed in on mount
  useState(() => {
    isSignedIn().then(setUserSignedIn).catch(console.error);
  });
  
  const handleSyncToggle = async (checked: boolean) => {
    setSyncEnabled(checked);
    
    if (checked && !userSignedIn) {
      try {
        await signIn();
        setUserSignedIn(true);
        initAutoSync();
      } catch (error) {
        console.error('Failed to sign in:', error);
        setSyncEnabled(false);
      }
    } else if (!checked && userSignedIn) {
      try {
        await signOut();
        setUserSignedIn(false);
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    }
  };
  
  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Settings</DialogTitle>
          <DialogDescription>
            Customize your notes experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <h3 className="font-medium mb-3">Display</h3>
            <div className="flex items-center justify-between py-2">
              <span>Theme</span>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System default</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span>Note density</span>
              <Select defaultValue="default">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="list-view">List view</Label>
              <Switch
                id="list-view"
                checked={listView}
                onCheckedChange={setListView}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3">Sync</h3>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="sync-drive">Sync to Google Drive</Label>
              <Switch
                id="sync-drive"
                checked={syncEnabled}
                onCheckedChange={handleSyncToggle}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span>Sync frequency</span>
              <Select
                value={syncFrequency}
                onValueChange={setSyncFrequency}
                disabled={!syncEnabled}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="hour">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Encryption</h3>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="encryption">Client-side encryption</Label>
              <Switch
                id="encryption"
                checked={encryptionEnabled}
                onCheckedChange={setEncryptionEnabled}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Data is encrypted on your device before syncing to cloud storage
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
