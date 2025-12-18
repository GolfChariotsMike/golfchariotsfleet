import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bike, MapPin, AlertTriangle, Clock, Plus, CheckCircle, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, SeverityBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type TrikeStatus = Database["public"]["Enums"]["trike_status"];
type IssueStatus = Database["public"]["Enums"]["issue_status"];

export default function TrikeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [issueFilter, setIssueFilter] = useState<"all" | "open">("open");

  const { data: trike, isLoading: trikeLoading } = useQuery({
    queryKey: ["trike", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trikes")
        .select("*, courses(name, contact_name, phone, email)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["trike-issues", id, issueFilter],
    queryFn: async () => {
      let query = supabase
        .from("issues")
        .select("*")
        .eq("trike_id", id!)
        .order("created_at", { ascending: false });

      if (issueFilter === "open") {
        query = query.neq("status", "resolved");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: TrikeStatus) => {
      const { error } = await supabase
        .from("trikes")
        .update({ status: newStatus })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trike", id] });
      queryClient.invalidateQueries({ queryKey: ["trikes"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update status" });
    },
  });

  if (trikeLoading) {
    return (
      <AppLayout title="Trike Details">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!trike) {
    return (
      <AppLayout title="Trike Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <p>This trike could not be found.</p>
            <Button onClick={() => navigate("/trikes")} className="mt-4">
              Back to Trikes
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const openIssueCount = issues?.filter((i) => i.status !== "resolved").length || 0;

  return (
    <AppLayout
      title={trike.name}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/report">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </Link>
        </div>
      }
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/trikes")}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Trikes
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bike className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{trike.name}</CardTitle>
                    <CardDescription>
                      {trike.asset_tag && `Asset Tag: ${trike.asset_tag}`}
                    </CardDescription>
                  </div>
                </div>
                <StatusBadge status={trike.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{trike.courses?.name || "Unassigned"}</span>
              </div>
              {trike.notes && (
                <p className="text-sm text-muted-foreground">{trike.notes}</p>
              )}

              {/* Quick Actions */}
              {isAdmin && (
                <div className="pt-4 border-t flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={trike.status === "available" ? "default" : "outline"}
                    onClick={() => updateStatusMutation.mutate("available")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Available
                  </Button>
                  <Button
                    size="sm"
                    variant={trike.status === "out_of_service" ? "destructive" : "outline"}
                    onClick={() => updateStatusMutation.mutate("out_of_service")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark Out of Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issue History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Issue History</CardTitle>
                <Select value={issueFilter} onValueChange={(v) => setIssueFilter(v as "all" | "open")}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open Issues ({openIssueCount})</SelectItem>
                    <SelectItem value="all">All Issues ({issues?.length || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-24 bg-muted rounded" />
                  ))}
                </div>
              ) : issues?.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {issueFilter === "open" ? "No open issues" : "No issues reported"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {issues?.map((issue) => (
                    <Link key={issue.id} to={`/issues/${issue.id}`}>
                      <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {issue.issue_type.replace("_", " ")}
                            </span>
                            <SeverityBadge severity={issue.severity} />
                          </div>
                          <StatusBadge status={issue.status} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(issue.created_at), "MMM d, yyyy")}
                          </span>
                          <span>By {issue.reported_by_name || "Unknown"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info */}
          {trike.courses && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Course Name</p>
                  <p className="font-medium">{trike.courses.name}</p>
                </div>
                {trike.courses.contact_name && (
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{trike.courses.contact_name}</p>
                  </div>
                )}
                {trike.courses.phone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <a href={`tel:${trike.courses.phone}`} className="font-medium text-primary hover:underline">
                      {trike.courses.phone}
                    </a>
                  </div>
                )}
                {trike.courses.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a href={`mailto:${trike.courses.email}`} className="font-medium text-primary hover:underline">
                      {trike.courses.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Issues</span>
                <span className="font-semibold">{issues?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open Issues</span>
                <span className="font-semibold text-status-in-repair">{openIssueCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Resolved</span>
                <span className="font-semibold text-status-available">
                  {(issues?.length || 0) - openIssueCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
