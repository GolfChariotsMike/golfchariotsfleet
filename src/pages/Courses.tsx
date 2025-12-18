import { useState } from "react";
import { MapPin, Plus, Search, Phone, Mail, Users, Bike, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
  });

  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate("/report");
    }
  }, [isAdmin, navigate]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: trikes } = useQuery({
    queryKey: ["trikes-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trikes")
        .select("id, course_id");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: users } = useQuery({
    queryKey: ["users-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, course_id");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const addCourseMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").insert({
        name: newCourse.name.trim(),
        contact_name: newCourse.contact_name.trim() || null,
        phone: newCourse.phone.trim() || null,
        email: newCourse.email.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course added successfully" });
      setIsAddDialogOpen(false);
      setNewCourse({ name: "", contact_name: "", phone: "", email: "" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add course", description: error.message });
    },
  });

  const filteredCourses = courses?.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getTrikeCount = (courseId: string) =>
    trikes?.filter((t) => t.course_id === courseId).length || 0;

  const getUserCount = (courseId: string) =>
    users?.filter((u) => u.course_id === courseId).length || 0;

  if (!isAdmin) return null;

  return (
    <AppLayout
      title="Golf Courses"
      actions={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCourse.name.trim()) return;
                addCourseMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="e.g. Royal Melbourne Golf Club"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Name</Label>
                <Input
                  id="contact"
                  value={newCourse.contact_name}
                  onChange={(e) => setNewCourse({ ...newCourse, contact_name: e.target.value })}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newCourse.phone}
                  onChange={(e) => setNewCourse({ ...newCourse, phone: e.target.value })}
                  placeholder="e.g. 03 9876 5432"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCourse.email}
                  onChange={(e) => setNewCourse({ ...newCourse, email: e.target.value })}
                  placeholder="e.g. manager@golfclub.com.au"
                />
              </div>
              <Button type="submit" className="w-full" disabled={addCourseMutation.isPending}>
                {addCourseMutation.isPending ? "Adding..." : "Add Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No courses found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? "Try adjusting your search" : "Add your first golf course to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses?.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <Card className="hover:shadow-card transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{course.name}</CardTitle>
                      {course.contact_name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {course.contact_name}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Bike className="w-4 h-4" />
                      <span>{getTrikeCount(course.id)} trikes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{getUserCount(course.id)} users</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {course.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {course.phone}
                      </div>
                    )}
                    {course.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{course.email}</span>
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
