import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Search, Filter, Clock, Camera } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, SeverityBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type IssueStatus = Database["public"]["Enums"]["issue_status"];
type IssueSeverity = Database["public"]["Enums"]["issue_severity"];

export default function Issues() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | "all">("all");
  const { isAdmin } = useAuth();

  const { data: issues, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("*, trikes(name, asset_tag), courses(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const [courseFilter, setCourseFilter] = useState<string>("all");

  const filteredIssues = issues?.filter((issue) => {
    const matchesSearch =
      issue.description.toLowerCase().includes(search.toLowerCase()) ||
      issue.trikes?.name.toLowerCase().includes(search.toLowerCase()) ||
      issue.courses?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter;
    const matchesCourse = courseFilter === "all" || issue.course_id === courseFilter;
    return matchesSearch && matchesStatus && matchesSeverity && matchesCourse;
  });

  const statusCounts = {
    reported: issues?.filter((i) => i.status === "reported").length || 0,
    acknowledged: issues?.filter((i) => i.status === "acknowledged").length || 0,
    in_repair: issues?.filter((i) => i.status === "in_repair").length || 0,
    resolved: issues?.filter((i) => i.status === "resolved").length || 0,
  };

  return (
    <AppLayout title="Issues">
      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter("reported")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Reported</p>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.reported}</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter("acknowledged")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Acknowledged</p>
            <p className="text-2xl font-bold text-amber-600">{statusCounts.acknowledged}</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter("in_repair")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In Repair</p>
            <p className="text-2xl font-bold text-orange-600">{statusCounts.in_repair}</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setStatusFilter("resolved")}
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600">{statusCounts.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IssueStatus | "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="reported">Reported</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="in_repair">In Repair</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as IssueSeverity | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && courses && (
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Issue List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredIssues?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No issues found</h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all" || severityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No issues have been reported yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIssues?.map((issue) => (
            <Link key={issue.id} to={`/issues/${issue.id}`}>
              <Card className="hover:shadow-card transition-all hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold capitalize">
                          {issue.issue_type.replace("_", " ")}
                        </span>
                        <SeverityBadge severity={issue.severity} />
                        <StatusBadge status={issue.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {issue.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {issue.trikes?.name}
                        </span>
                        <span>{issue.courses?.name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(issue.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        <span>By {issue.reported_by_name || "Unknown"}</span>
                      </div>
                    </div>

                    {/* Photo thumbnails */}
                    {issue.photos && issue.photos.length > 0 && (
                      <div className="flex gap-2 flex-shrink-0">
                        {issue.photos.slice(0, 3).map((photo, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted"
                          >
                            <img
                              src={photo}
                              alt={`Issue photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {issue.photos.length > 3 && (
                          <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{issue.photos.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
