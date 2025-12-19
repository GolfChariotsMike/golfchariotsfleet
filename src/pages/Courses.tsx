import { useState } from "react";
import { MapPin, Plus, Search, Phone, Mail, Users, Bike, ChevronRight, Warehouse, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddOffsiteDialogOpen, setIsAddOffsiteDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
  });
  const [newOffsiteLocation, setNewOffsiteLocation] = useState("");

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

  const { data: assets } = useQuery({
    queryKey: ["assets-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trikes")
        .select("id, course_id, location, asset_type");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: offsiteLocations, isLoading: offsiteLoading } = useQuery({
    queryKey: ["offsite-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offsite_locations")
        .select("*")
        .order("name");
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

  const addOffsiteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("offsite_locations").insert({
        name: newOffsiteLocation.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offsite-locations"] });
      toast({ title: "Location added successfully" });
      setIsAddOffsiteDialogOpen(false);
      setNewOffsiteLocation("");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add location", description: error.message });
    },
  });

  const deleteOffsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offsite_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offsite-locations"] });
      toast({ title: "Location deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to delete location", description: error.message });
    },
  });

  const filteredCourses = courses?.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOffsiteLocations = offsiteLocations?.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  const getAssetCount = (courseId: string) =>
    assets?.filter((a) => a.course_id === courseId).length || 0;

  const getOffsiteAssetCount = (locationName: string) =>
    assets?.filter((a) => a.location === locationName).length || 0;

  const getUserCount = (courseId: string) =>
    users?.filter((u) => u.course_id === courseId).length || 0;

  if (!isAdmin) return null;

  return (
    <AppLayout
      title="Locations"
      actions={
        activeTab === "courses" ? (
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
        ) : (
          <Dialog open={isAddOffsiteDialogOpen} onOpenChange={setIsAddOffsiteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Off-site Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Off-site Location</DialogTitle>
                <DialogDescription>
                  Add a workshop or storage location for assets not at a course.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newOffsiteLocation.trim()) return;
                  addOffsiteMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="location-name">Location Name *</Label>
                  <Input
                    id="location-name"
                    value={newOffsiteLocation}
                    onChange={(e) => setNewOffsiteLocation(e.target.value)}
                    placeholder="e.g. Wangara Workshop"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addOffsiteMutation.isPending}>
                    {addOffsiteMutation.isPending ? "Adding..." : "Add Location"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )
      }
    >
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="courses" className="gap-2">
            <MapPin className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="offsite" className="gap-2">
            <Warehouse className="w-4 h-4" />
            Off-site
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={activeTab === "courses" ? "Search courses..." : "Search off-site locations..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Course List */}
      {activeTab === "courses" && (
        <>
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
                          <span>{getAssetCount(course.id)} vehicles</span>
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
        </>
      )}

      {/* Off-site Locations List */}
      {activeTab === "offsite" && (
        <>
          {offsiteLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOffsiteLocations?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Warehouse className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No off-site locations found</h3>
                <p className="text-sm text-muted-foreground">
                  {search ? "Try adjusting your search" : "Add your first off-site location to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOffsiteLocations?.map((location) => (
                <Card key={location.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Warehouse className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{location.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Workshop / Storage</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Bike className="w-4 h-4" />
                        <span>{getOffsiteAssetCount(location.name)} vehicles</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            disabled={getOffsiteAssetCount(location.name) > 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Location</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{location.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOffsiteMutation.mutate(location.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {getOffsiteAssetCount(location.name) > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Move all vehicles before deleting
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
