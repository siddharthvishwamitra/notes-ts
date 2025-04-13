import { 
  LightbulbIcon, 
  BellIcon, 
  PencilIcon, 
  ArchiveIcon, 
  TrashIcon, 
  SettingsIcon, 
  HelpCircleIcon,
  CloudIcon
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

export default function Sidebar({ isOpen, selectedSection, onSelectSection }: SidebarProps) {
  const sidebarItems = [
    { id: 'notes', label: 'Notes', icon: <LightbulbIcon className="mr-4 h-5 w-5" /> },
    { id: 'reminders', label: 'Reminders', icon: <BellIcon className="mr-4 h-5 w-5" /> },
    { id: 'labels', label: 'Edit labels', icon: <PencilIcon className="mr-4 h-5 w-5" /> },
    { id: 'archive', label: 'Archive', icon: <ArchiveIcon className="mr-4 h-5 w-5" /> },
    { id: 'trash', label: 'Trash', icon: <TrashIcon className="mr-4 h-5 w-5" /> },
  ];

  return (
    <div 
      className={`fixed left-0 top-[57px] bottom-0 w-64 bg-background border-r border-border shadow-md transform transition-transform duration-300 ease-in-out z-10 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0'
      } overflow-y-auto`}
    >
      <nav className="py-4">
        {sidebarItems.map(item => (
          <a
            key={item.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectSection(item.id);
            }}
            className={`flex items-center px-6 py-3 hover:bg-muted/50 ${
              selectedSection === item.id ? 'bg-muted font-medium' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
        
        <div className="border-t border-border my-2"></div>
        
        <a 
          href="#" 
          className="flex items-center px-6 py-3 hover:bg-muted/50"
          onClick={(e) => {
            e.preventDefault();
            // This would open settings in a real app
          }}
        >
          <SettingsIcon className="mr-4 h-5 w-5" />
          <span>Settings</span>
        </a>
        
        <a 
          href="#" 
          className="flex items-center px-6 py-3 hover:bg-muted/50"
          onClick={(e) => {
            e.preventDefault();
            // This would open help in a real app
          }}
        >
          <HelpCircleIcon className="mr-4 h-5 w-5" />
          <span>Help & feedback</span>
        </a>
        
        <div className="px-6 py-4">
          <div className="flex items-center">
            <CloudIcon className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Storage synced</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
