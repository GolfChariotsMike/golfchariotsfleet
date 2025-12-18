import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Users, Shield, Loader2, Plus, UserPlus, Mail, Lock, User } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    courseId: "",
    role: "course_user" as AppRole,
  });

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

  const createUserMutation = useMutation({
    mutationFn: async () => {
      // Create user via Supabase Auth admin API (using signUp as workaround)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Update profile with course assignment
      if (newUser.courseId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ course_id: newUser.courseId })
          .eq("id", authData.user.id);

        if (profileError) throw profileError;
      }

      // Update role if admin
      if (newUser.role === "admin") {
        // Delete default role and add admin
        await supabase.from("user_roles").delete().eq("user_id", authData.user.id);
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "admin",
        });
        if (roleError) throw roleError;
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "User created",
        description: `Account created for ${newUser.email}`,
      });
      setIsCreateUserOpen(false);
      setNewUser({
        email: "",
        password: "",
        fullName: "",
        courseId: "",
        role: "course_user",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message.includes("already registered")
          ? "This email is already registered"
          : error.message,
      });
    },
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
    <AppLayout
      title="Settings"
      actions={
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a login for a course staff member or admin
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUser.email || !newUser.password) return;
                createUserMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="newUserName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newUserName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="John Smith"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUserEmail">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newUserEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@golfcourse.com.au"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUserPassword">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newUserPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUserCourse">Assign to Course</Label>
                <Select
                  value={newUser.courseId}
                  onValueChange={(v) => setNewUser({ ...newUser, courseId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUserRole">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) => setNewUser({ ...newUser, role: v as AppRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course_user">Course User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
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
                  Manage user accounts and course assignments
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
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No users yet</p>
                <Button onClick={() => setIsCreateUserOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create First User
                </Button>
              </div>
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
                      {user.courses?.name && (
                        <p className="text-xs text-primary mt-1">{user.courses.name}</p>
                      )}
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
                <li>• Can create and manage user accounts</li>
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
