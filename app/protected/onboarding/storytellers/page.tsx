"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus,
  Users,
  Mail,
  Phone,
  Trash2,
  Edit,
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Storyteller } from "@/lib/supabase/types";

export default function StorytellersPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStoryteller, setEditingStoryteller] = useState<Storyteller | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const supabase = createClient();

  useEffect(() => {
    fetchStorytellers();
  }, [fetchStorytellers]);

  const fetchStorytellers = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("storytellers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStorytellers(data || []);
    } catch (error) {
      console.error("Error fetching storytellers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const generateInviteToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const storytellerData = {
        user_id: user.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        invite_token: generateInviteToken(),
      };

      if (editingStoryteller) {
        const { error } = await supabase
          .from("storytellers")
          .update(storytellerData)
          .eq("id", editingStoryteller.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("storytellers")
          .insert(storytellerData);

        if (error) throw error;
      }

      setFormData({ name: "", email: "", phone: "" });
      setEditingStoryteller(null);
      setIsDialogOpen(false);
      await fetchStorytellers();
    } catch (error) {
      console.error("Error saving storyteller:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (storyteller: Storyteller) => {
    setEditingStoryteller(storyteller);
    setFormData({
      name: storyteller.name,
      email: storyteller.email,
      phone: storyteller.phone || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("storytellers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchStorytellers();
    } catch (error) {
      console.error("Error deleting storyteller:", error);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStoryteller(null);
    setFormData({ name: "", email: "", phone: "" });
  };

  if (isLoading) {
    return (
      <div className="container-sare section-spacing">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-teal mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading storytellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sare section-spacing">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-xl text-primary-teal mb-2">
          Choose Your Storytellers
        </h1>
        <p className="body-lg text-muted-foreground">
          Select 3-10 people who know you well and have seen you at your best. 
          They&apos;ll be invited to share stories about your strengths.
        </p>
      </div>

      {/* Storytellers Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-teal">
            <Users className="h-5 w-5" />
            Your Storytellers ({storytellers.length})
          </CardTitle>
          <CardDescription>
            Manage the people who will share stories about your strengths
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storytellers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No storytellers yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first storyteller to get started with collecting stories.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary-teal hover:bg-primary-teal/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Storyteller
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Storyteller</DialogTitle>
                    <DialogDescription>
                      Add someone who knows you well and has seen you at your best.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={closeDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Storyteller"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  Recommended: 3-10 storytellers for best results
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary-teal hover:bg-primary-teal/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Storyteller
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingStoryteller ? "Edit Storyteller" : "Add Storyteller"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStoryteller 
                          ? "Update the storyteller&apos;s information."
                          : "Add someone who knows you well and has seen you at your best."
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeDialog}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting 
                            ? (editingStoryteller ? "Updating..." : "Adding...") 
                            : (editingStoryteller ? "Update Storyteller" : "Add Storyteller")
                          }
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storytellers.map((storyteller) => (
                    <TableRow key={storyteller.id}>
                      <TableCell className="font-medium">{storyteller.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {storyteller.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {storyteller.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {storyteller.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {storyteller.story_submitted_at ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Story received
                          </div>
                        ) : storyteller.invite_sent_at ? (
                          <div className="flex items-center gap-2 text-amber-600">
                            <Clock className="h-4 w-4" />
                            Invite sent
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="h-4 w-4" />
                            Ready to invite
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(storyteller)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(storyteller.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {storytellers.length > 0 && (
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Great! You&apos;ve added {storytellers.length} storyteller{storytellers.length === 1 ? '' : 's'}
            </h3>
            <p className="text-green-700">
              You can add more storytellers anytime, or continue to the next step to send invitations.
            </p>
          </div>
          
          <Button 
            asChild 
            size="lg" 
            className="bg-accent-coral hover:bg-accent-coral/90 px-8"
          >
            <Link href="/protected/onboarding/send_collect">
              Continue to Send Invitations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}