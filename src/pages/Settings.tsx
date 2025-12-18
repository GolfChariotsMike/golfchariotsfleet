import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Settings as SettingsIcon, Users, Shield, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export default function Settings() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate("/report");
    }
  }, [isAdmin, navigate]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, course_id, courses(name)")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      return profiles.map((profile) => ({
        ...profile,
        role: roles.find((r) => r.user_id === profile.id)?.role || "course_user",
      }));
    },
    enabled: isAdmin,
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

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      courseId,
      role,
    }: {
      userId: string;
      courseId?: string | null;
      role?: AppRole;
    }) => {
      if (courseId !== undefined) {
        const { error } = await supabase
          .from("profiles")
          .update({ course_id: courseId })
          .eq("id", userId);
        if (error) throw error;
      }

      if (role) {
        // First delete existing role
        await supabase.from("user_roles").delete().eq("user_id", userId);

        // Then insert new role
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to update user" });
    },
  });

  if (!isAdmin) return null;

  return (
    <AppLayout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Assign users to courses and manage roles
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : users?.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No users found</p>
            ) : (
              <div className="space-y-4">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium">{user.full_name || "Unnamed User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select
                        value={user.course_id || "none"}
                        onValueChange={(value) =>
                          updateUserMutation.mutate({
                            userId: user.id,
                            courseId: value === "none" ? null : value,
                          })
                        }
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Assign to course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Course</SelectItem>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          updateUserMutation.mutate({
                            userId: user.id,
                            role: value as AppRole,
                          })
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="course_user">Course User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Security & Permissions</CardTitle>
                <CardDescription>
                  Understanding role-based access
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Admin Role</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full access to all courses, trikes, and issues</li>
                <li>• Can manage users and assign them to courses</li>
                <li>• Can update issue statuses and add admin notes</li>
                <li>• Access to Courses and Settings pages</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Course User Role</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Can only see trikes assigned to their course</li>
                <li>• Can report and view issues for their course only</li>
                <li>• Cannot access Courses or Settings pages</li>
                <li>• Cannot change issue statuses or add admin notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
