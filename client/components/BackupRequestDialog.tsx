import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useDashboardIntegration } from '@/hooks/use-dashboard-integration';
import { Siren, Phone, Users } from 'lucide-react';

interface BackupRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId?: string;
  incidentTitle?: string;
}

export default function BackupRequestDialog({ 
  open, 
  onOpenChange, 
  incidentId, 
  incidentTitle 
}: BackupRequestDialogProps) {
  const { requestBackup, connectedUsers } = useDashboardIntegration();
  const [backupType, setBackupType] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  const backupOptions = [
    { 
      value: 'fire', 
      label: 'Fire Brigade', 
      description: 'Fire emergencies, rescue operations',
      icon: '🚒',
      available: connectedUsers?.usersByRole?.fire || 0
    },
    { 
      value: 'ambulance', 
      label: 'Ambulance Service', 
      description: 'Medical emergencies, patient transport',
      icon: '🚑',
      available: connectedUsers?.usersByRole?.ambulance || 0
    },
    { 
      value: 'hospital', 
      label: 'Hospital Support', 
      description: 'Medical supplies, equipment',
      icon: '🏥',
      available: connectedUsers?.usersByRole?.hospital || 0
    },
    { 
      value: 'police', 
      label: 'Police Backup', 
      description: 'Additional police units',
      icon: '🚔',
      available: connectedUsers?.usersByRole?.police || 0
    }
  ];

  const handleSubmit = () => {
    if (!backupType || !reason.trim()) return;

    requestBackup(
      backupType as any,
      reason,
      incidentId
    );

    // Reset form
    setBackupType('');
    setReason('');
    setPriority('high');
    onOpenChange(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Siren className="mr-2 h-5 w-5 text-red-500" />
            Request Emergency Backup
          </DialogTitle>
          <DialogDescription>
            Send a backup request to other emergency services
            {incidentTitle && (
              <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                <strong>For incident:</strong> {incidentTitle}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Backup Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="backup-type">Backup Type</Label>
            <Select value={backupType} onValueChange={setBackupType}>
              <SelectTrigger>
                <SelectValue placeholder="Select emergency service" />
              </SelectTrigger>
              <SelectContent>
                {backupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="mr-2">{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                      <Badge 
                        variant={option.available > 0 ? "default" : "secondary"}
                        className="ml-2"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {option.available}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor('critical')} mr-2`}></div>
                    Critical - Immediate response required
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor('high')} mr-2`}></div>
                    High - Urgent assistance needed
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor('medium')} mr-2`}></div>
                    Medium - Support requested
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor('low')} mr-2`}></div>
                    Low - Non-urgent assistance
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Backup</Label>
            <Textarea
              id="reason"
              placeholder="Describe the situation requiring backup assistance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* Connection Status */}
          {connectedUsers && (
            <div className="text-xs text-gray-500 bg-slate-50 p-2 rounded">
              <strong>Live Dashboard Status:</strong> {connectedUsers.connectedUsers} users connected
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleSubmit}
            disabled={!backupType || !reason.trim()}
            className="flex-1"
            variant="destructive"
          >
            <Phone className="mr-2 h-4 w-4" />
            Send Backup Request
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
