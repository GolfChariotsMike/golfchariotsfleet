import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bike, Phone, Mail, User, AlertTriangle } from "lucide-react";
import { TrikeIcon } from "@/components/icons/TrikeIcon";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type AssetType = Database["public"]["Enums"]["asset_type"];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/report");
    }
  }, [isAdmin, navigate]);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && isAdmin,
  });

  const { data: trikes, isLoading: trikesLoading } = useQuery({
    queryKey: ["course-trikes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trikes")
        .select("*")
        .eq("course_id", id!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!id && isAdmin,
  });

  const { data: users } = useQuery({
    queryKey: ["course-users", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("course_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id && isAdmin,
  });

  const { data: openIssues } = useQuery({
    queryKey: ["course-open-issues", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issues")
        .select("id, trike_id, severity, status")
        .eq("course_id", id!)
        .neq("status", "resolved");
      if (error) throw error;
      return data;
    },
    enabled: !!id && isAdmin,
  });

  const getOpenIssuesForTrike = (trikeId: string) =>
    openIssues?.filter((i) => i.trike_id === trikeId) || [];

  const statusCounts = {
    available: trikes?.filter((t) => t.status === "available").length || 0,
    in_repair: trikes?.filter((t) => t.status === "in_repair").length || 0,
    out_of_service: trikes?.filter((t) => t.status === "out_of_service").length || 0,
  };

  if (!isAdmin) return null;

  const isLoading = courseLoading || trikesLoading;

  if (isLoading) {
    return (
      <AppLayout title="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout title="Course Not Found">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">This course could not be found.</p>
            <Button onClick={() => navigate("/courses")}>Back to Courses</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={course.name}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      }
    >
      {/* Course Info */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-4 text-sm">
            {course.contact_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                {course.contact_name}
              </div>
            )}
            {course.phone && (
              <a
                href={`tel:${course.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Phone className="w-4 h-4" />
                {course.phone}
              </a>
            )}
            {course.email && (
              <a
                href={`mailto:${course.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="w-4 h-4" />
                {course.email}
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-status-available/10 border-status-available/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-status-available">{statusCounts.available}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-status-in-repair/10 border-status-in-repair/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-status-in-repair">{statusCounts.in_repair}</p>
            <p className="text-xs text-muted-foreground">In Repair</p>
          </CardContent>
        </Card>
        <Card className="bg-status-out-of-service/10 border-status-out-of-service/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-status-out-of-service">{statusCounts.out_of_service}</p>
            <p className="text-xs text-muted-foreground">Out of Service</p>
          </CardContent>
        </Card>
      </div>

      {/* Trikes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="w-5 h-5" />
            Assets ({trikes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trikes?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No assets assigned to this course yet.
            </p>
          ) : (
            <div className="space-y-3">
              {trikes?.map((trike) => {
                const trikeIssues = getOpenIssuesForTrike(trike.id);
                const hasHighSeverity = trikeIssues.some((i) => i.severity === "high");

                return (
                  <Link
                    key={trike.id}
                    to={`/trikes/${trike.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {trike.asset_type === "scooter" ? (
                          <Bike className="w-5 h-5 text-primary" />
                        ) : (
                          <TrikeIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trike.name}</p>
                        {trike.asset_tag && (
                          <p className="text-xs text-muted-foreground">
                            {trike.asset_tag}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trikeIssues.length > 0 && (
                        <div
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            hasHighSeverity
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {trikeIssues.length}
                        </div>
                      )}
                      <StatusBadge status={trike.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      {users && users.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Course Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{user.full_name || "Unnamed User"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
