import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Users,
  Send,
  Search,
  Filter,
  Download,
  MoreVertical,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Target
} from "lucide-react";
import { useStorytellers, useAddStoryteller, useUpdateStoryteller } from "@/hooks/useStorytellers";
import { useProfile, useStoryCount } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { 
  useSendStorytellerInvitation, 
  useSendStorytellerReminder, 
  useBulkSendInvitations,
  getInvitationStatusDisplay 
} from "@/hooks/useMagicLinkInvitations";
import { formatDistanceToNow } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type Storyteller = Database["public"]["Tables"]["storytellers"]["Row"];

interface StorytellerFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const InviteTrack = () => {
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: storyCount = 0, isLoading: storyCountLoading } = useStoryCount();
  const { data: storytellers = [], isLoading: storytellersLoading } = useStorytellers();
  const addStoryteller = useAddStoryteller();
  const updateStoryteller = useUpdateStoryteller();
  
  // Magic link invitation hooks
  const sendInvitation = useSendStorytellerInvitation();
  const sendReminder = useSendStorytellerReminder();
  const bulkSendInvitations = useBulkSendInvitations();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStoryteller, setEditingStoryteller] = useState<Storyteller | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [formData, setFormData] = useState<StorytellerFormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const isLoading = profileLoading || storyCountLoading || storytellersLoading;

  const collectionGoal = profile?.collection_goal ?? 10;
  const progressPercentage = Math.min((storyCount / collectionGoal) * 100, 100);

  // Filter storytellers based on search and status
  const filteredStorytellers = storytellers.filter((storyteller) => {
    const matchesSearch = 
      storyteller.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      storyteller.email.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || storyteller.invitation_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addStoryteller.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        notes: formData.notes.trim() || null,
      });

      setFormData({ name: "", email: "", phone: "", notes: "" });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Storyteller Added",
        description: `${formData.name} has been added to your list.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add storyteller. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (storyteller: Storyteller) => {
    setEditingStoryteller(storyteller);
    setFormData({
      name: storyteller.name,
      email: storyteller.email,
      phone: storyteller.phone || "",
      notes: storyteller.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStoryteller) return;
    
    try {
      await updateStoryteller.mutateAsync({
        id: editingStoryteller.id,
        updates: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          notes: formData.notes.trim() || null,
        },
      });

      setIsEditDialogOpen(false);
      setEditingStoryteller(null);
      setFormData({ name: "", email: "", phone: "", notes: "" });
      
      toast({
        title: "Updated",
        description: "Storyteller information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update storyteller. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkInvited = async (storyteller: Storyteller) => {
    try {
      await updateStoryteller.mutateAsync({
        id: storyteller.id,
        updates: {
          invitation_status: 'sent',
          invited_at: new Date().toISOString(),
          last_contacted_at: new Date().toISOString(),
        },
      });
      
      toast({
        title: "Marked as Invited",
        description: `${storyteller.name} has been marked as invited.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle sending magic link invitation
  const handleSendInvitation = async (storyteller: Storyteller) => {
    try {
      await sendInvitation.mutateAsync({
        storytellerId: storyteller.id,
        storytellerEmail: storyteller.email,
        storytellerName: storyteller.name,
      });
      
      toast({
        title: "Invitation sent!",
        description: `Magic link invitation sent to ${storyteller.name}`,
      });
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast({
        title: "Failed to send invitation",
        description: "There was an error sending the invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle sending reminder
  const handleSendReminder = async (storyteller: Storyteller) => {
    try {
      await sendReminder.mutateAsync({
        storytellerId: storyteller.id,
        storytellerEmail: storyteller.email,
        storytellerName: storyteller.name,
      });
      
      toast({
        title: "Reminder sent!",
        description: `Follow-up invitation sent to ${storyteller.name}`,
      });
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast({
        title: "Failed to send reminder",
        description: "There was an error sending the reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk send invitations
  const handleBulkSendInvitations = async () => {
    const pendingStorytellers = filteredStorytellers.filter(
      s => s.invitation_status === 'pending'
    );
    
    if (pendingStorytellers.length === 0) {
      toast({
        title: "No pending invitations",
        description: "All storytellers have already been invited.",
      });
      return;
    }

    try {
      const results = await bulkSendInvitations.mutateAsync(
        pendingStorytellers.map(s => ({
          storytellerId: s.id,
          storytellerEmail: s.email,
          storytellerName: s.name,
        }))
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      toast({
        title: "Bulk invitations sent",
        description: `${successCount} invitations sent successfully${
          failureCount > 0 ? `, ${failureCount} failed` : ''
        }`,
        variant: failureCount > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Bulk send failed:", error);
      toast({
        title: "Bulk send failed",
        description: "There was an error sending bulk invitations.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null, lastContacted?: string | null) => {
    const statusDisplay = getInvitationStatusDisplay(status, lastContacted);
    
    return (
      <Badge variant={statusDisplay.variant} className="gap-1" title={statusDisplay.description}>
        {status === 'pending' && <Clock className="h-3 w-3" />}
        {status === 'sent' && <Send className="h-3 w-3" />}
        {status === 'reminded' && <AlertCircle className="h-3 w-3" />}
        {status === 'opened' && <Mail className="h-3 w-3" />}
        {status === 'submitted' && <CheckCircle2 className="h-3 w-3" />}
        {statusDisplay.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvData = storytellers.map(s => ({
      Name: s.name,
      Email: s.email,
      Phone: s.phone || '',
      Status: s.invitation_status,
      'Invited At': s.invited_at ? new Date(s.invited_at).toLocaleDateString() : '',
      'Last Contact': s.last_contacted_at ? new Date(s.last_contacted_at).toLocaleDateString() : '',
      Notes: s.notes || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storytellers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Invite & Track Stories
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your storytellers and track the collection of your strengths stories.
        </p>
      </div>

      {/* Progress Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Collection Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {storyCount} of {collectionGoal} stories collected
              </p>
            </div>
            <Badge variant={storyCount >= collectionGoal ? "default" : "secondary"} className="text-sm">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-3" />
          
          {storyCount >= collectionGoal && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Congratulations! You've reached your collection goal. Ready for self-reflection?
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stats and Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Storytellers</p>
                <p className="text-2xl font-bold">{storytellers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">
                  {storytellers.filter(s => s.invitation_status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stories Received</p>
                <p className="text-2xl font-bold">{storyCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {storytellers.length > 0 ? Math.round((storyCount / storytellers.length) * 100) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Storytellers</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track the people you've invited to share stories
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {storytellers.filter(s => s.invitation_status === 'pending').length > 0 && (
                <Button 
                  onClick={handleBulkSendInvitations} 
                  variant="outline" 
                  size="sm"
                  disabled={bulkSendInvitations.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {bulkSendInvitations.isPending ? 'Sending...' : 'Send All Invitations'}
                </Button>
              )}
              
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Storyteller
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Storyteller</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="How you know them, shared experiences, etc."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addStoryteller.isPending}>
                        {addStoryteller.isPending ? "Adding..." : "Add Storyteller"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search storytellers..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reminded">Reminded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredStorytellers.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStorytellers.map((storyteller) => (
                    <TableRow key={storyteller.id}>
                      <TableCell className="font-medium">{storyteller.name}</TableCell>
                      <TableCell>{storyteller.email}</TableCell>
                      <TableCell>{getStatusBadge(storyteller.invitation_status, storyteller.last_contacted_at)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {storyteller.last_contacted_at
                          ? formatDistanceToNow(new Date(storyteller.last_contacted_at), { addSuffix: true })
                          : "Never"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(storyteller)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {storyteller.invitation_status === 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => handleSendInvitation(storyteller)}
                                disabled={sendInvitation.isPending}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Invitation
                              </DropdownMenuItem>
                            )}
                            {storyteller.invitation_status === 'sent' && (
                              <DropdownMenuItem 
                                onClick={() => handleSendReminder(storyteller)}
                                disabled={sendReminder.isPending}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                            )}
                            {storyteller.invitation_status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleMarkInvited(storyteller)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Invited (Manual)
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No storytellers yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding people who know you well and can share meaningful stories about your strengths.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Storyteller
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Storyteller</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingStoryteller(null);
                  setFormData({ name: "", email: "", phone: "", notes: "" });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateStoryteller.isPending}>
                {updateStoryteller.isPending ? "Updating..." : "Update Storyteller"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InviteTrack;