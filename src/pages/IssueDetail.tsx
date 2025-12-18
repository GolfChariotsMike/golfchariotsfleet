import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bike, Clock, User, DollarSign, MessageSquare, Loader2, Image } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, SeverityBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type IssueStatus = Database["public"]["Enums"]["issue_status"];

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [adminNotes, setAdminNotes] = useState("");
  const [costEstimate, setCostEstimate] = useState("");
  const [costFinal, setCostFinal] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: issue, isLoading } = useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("*, trikes(id, name, asset_tag, status), courses(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      // Set initial values for admin fields
      setAdminNotes(data.admin_notes || "");
      setCostEstimate(data.cost_estimate?.toString() || "");
      setCostFinal(data.cost_final?.toString() || "");
      return data;
    },
    enabled: !!id,
  });

  const updateIssueMutation = useMutation({
    mutationFn: async (updates: Partial<Database["public"]["Tables"]["issues"]["Update"]>) => {
      const { error } = await supabase.from("issues").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast({ title: "Issue updated" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update issue" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: IssueStatus) => {
      const updates: Partial<Database["public"]["Tables"]["issues"]["Update"]> = {
        status: newStatus,
      };

      // If resolving, set resolved_at and update trike status
      if (newStatus === "resolved") {
        updates.resolved_at = new Date().toISOString();

        // Update trike status to available
        if (issue?.trike_id) {
          await supabase.from("trikes").update({ status: "available" }).eq("id", issue.trike_id);
        }
      }

      const { error } = await supabase.from("issues").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["trikes"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update status" });
    },
  });

  const handleSaveAdminDetails = () => {
    updateIssueMutation.mutate({
      admin_notes: adminNotes || null,
      cost_estimate: costEstimate ? parseFloat(costEstimate) : null,
      cost_final: costFinal ? parseFloat(costFinal) : null,
    });
  };

  if (isLoading) {
    return (
      <AppLayout title="Issue Details">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-60 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout title="Issue Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <p>This issue could not be found.</p>
            <Button onClick={() => navigate("/issues")} className="mt-4">
              Back to Issues
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`${issue.issue_type.replace("_", " ")} Issue`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/issues")}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Issues
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xl font-semibold capitalize">
                  {issue.issue_type.replace("_", " ")}
                </span>
                <SeverityBadge severity={issue.severity} />
                <StatusBadge status={issue.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(issue.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {issue.reported_by_name || "Unknown"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
              </div>

              {/* Photos */}
              {issue.photos && issue.photos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Photos</h4>
                  <div className="flex flex-wrap gap-3">
                    {issue.photos.map((photo, idx) => (
                      <Dialog key={idx}>
                        <DialogTrigger asChild>
                          <button className="w-24 h-24 rounded-lg overflow-hidden border border-border hover:ring-2 ring-primary transition-all">
                            <img
                              src={photo}
                              alt={`Issue photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-0 overflow-hidden">
                          <img
                            src={photo}
                            alt={`Issue photo ${idx + 1}`}
                            className="w-full h-auto"
                          />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update (Admin only) */}
              {isAdmin && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(["reported", "acknowledged", "in_repair", "resolved"] as IssueStatus[]).map(
                      (status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={issue.status === status ? "default" : "outline"}
                          onClick={() => updateStatusMutation.mutate(status)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes & Costs (Admin only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add internal notes about this issue..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costEstimate">Cost Estimate ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="costEstimate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={costEstimate}
                        onChange={(e) => setCostEstimate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costFinal">Final Cost ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="costFinal"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={costFinal}
                        onChange={(e) => setCostFinal(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSaveAdminDetails}
                  disabled={updateIssueMutation.isPending}
                >
                  {updateIssueMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trike Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trike Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={`/trikes/${issue.trikes?.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bike className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{issue.trikes?.name}</p>
                  {issue.trikes?.asset_tag && (
                    <p className="text-sm text-muted-foreground">{issue.trikes.asset_tag}</p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{issue.courses?.name}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="text-sm font-medium">Reported</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(issue.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              {issue.resolved_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-status-available mt-2" />
                  <div>
                    <p className="text-sm font-medium">Resolved</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(issue.resolved_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Costs Summary */}
          {(issue.cost_estimate || issue.cost_final) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {issue.cost_estimate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimate</span>
                    <span className="font-medium">${issue.cost_estimate.toFixed(2)}</span>
                  </div>
                )}
                {issue.cost_final && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Final</span>
                    <span className="font-semibold text-primary">${issue.cost_final.toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
