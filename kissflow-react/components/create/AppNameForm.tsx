'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Users,
  FileText,
  Folder,
  Calendar,
  CheckSquare,
  Package,
  ShoppingCart,
  DollarSign,
  Mail,
  Settings,
  Clock,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  Database,
  Layers,
  Grid,
  List,
  BarChart,
  Check,
  Pencil,
  Loader2,
} from 'lucide-react';
import { APP_COLORS, AppIconName, AppColor } from '@/lib/schema/types';
import { cn } from '@/lib/utils';

// Map icon names to components
const iconMap: Record<AppIconName, React.ComponentType<{ className?: string }>> = {
  Users,
  FileText,
  Folder,
  Calendar,
  CheckSquare,
  Package,
  ShoppingCart,
  DollarSign,
  Mail,
  Settings,
  Clock,
  Star,
  Heart,
  BookOpen,
  Briefcase,
  Database,
  Layers,
  Grid,
  List,
  BarChart,
};

interface AppNameFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; icon: string; iconBg: string; description?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function AppNameForm({ open, onOpenChange, onSubmit, isLoading = false }: AppNameFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<AppIconName>('Folder');
  const [selectedColor, setSelectedColor] = useState<AppColor>(APP_COLORS[0]);
  const [error, setError] = useState('');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('App name is required');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        icon: selectedIcon,
        iconBg: selectedColor.value,
        description: description.trim() || undefined,
      });

      // Only reset form after successful submission
      setName('');
      setDescription('');
      setSelectedIcon('Folder');
      setSelectedColor(APP_COLORS[0]);
      setError('');
    } catch (err) {
      setError('Failed to create app. Please try again.');
    }
  };

  const SelectedIconComponent = iconMap[selectedIcon];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create new app</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* 1. Icon Selector with Popover */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">App icon</Label>
            <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="group relative flex items-center gap-4 p-3 w-full rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-150"
                >
                  {/* Icon Preview */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-105"
                    style={{ backgroundColor: selectedColor.value }}
                  >
                    <SelectedIconComponent className="h-7 w-7 text-white" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedIcon}
                    </p>
                    <p className="text-xs text-gray-500">
                      Click to change icon & color
                    </p>
                  </div>

                  {/* Edit indicator */}
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors duration-150">
                    <Pencil className="h-4 w-4" />
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-80 p-4"
                align="start"
                sideOffset={8}
              >
                {/* Icon Grid */}
                <div className="space-y-3">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">
                    Choose icon
                  </Label>
                  <div className="grid grid-cols-10 gap-1">
                    {(Object.keys(iconMap) as AppIconName[]).map((iconName) => {
                      const IconComponent = iconMap[iconName];
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={cn(
                            'w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150',
                            isSelected
                              ? 'bg-blue-100 ring-1 ring-blue-500'
                              : 'hover:bg-gray-100'
                          )}
                          title={iconName}
                        >
                          <IconComponent
                            className={cn(
                              'h-4 w-4',
                              isSelected ? 'text-blue-600' : 'text-gray-500'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-gray-100" />

                {/* Color Picker */}
                <div className="space-y-3">
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">
                    Choose color
                  </Label>
                  <div className="flex gap-2">
                    {APP_COLORS.map((color) => {
                      const isSelected = selectedColor.value === color.value;
                      return (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
                            isSelected && 'ring-2 ring-offset-2'
                          )}
                          style={{
                            backgroundColor: color.value,
                            '--tw-ring-color': color.value,
                          } as React.CSSProperties}
                          title={color.name}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 2. App Name */}
          <div className="space-y-2">
            <Label htmlFor="app-name" className="text-sm text-gray-600">
              App name
            </Label>
            <Input
              id="app-name"
              placeholder="Enter app name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className={cn(
                'h-10',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* 3. Description */}
          <div className="space-y-2">
            <Label htmlFor="app-description" className="text-sm text-gray-600">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="app-description"
              placeholder="Describe what this app is for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create App'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
