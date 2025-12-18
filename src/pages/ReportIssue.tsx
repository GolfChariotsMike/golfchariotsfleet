import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type IssueType = Database["public"]["Enums"]["issue_type"];
type IssueSeverity = Database["public"]["Enums"]["issue_severity"];

const issueTypes: { value: IssueType; label: string }[] = [
  { value: "damage", label: "Damage" },
  { value: "breakdown", label: "Breakdown" },
  { value: "battery", label: "Battery Issue" },
  { value: "tyres", label: "Tyres" },
  { value: "brakes", label: "Brakes" },
  { value: "other", label: "Other" },
];

const severityLevels: { value: IssueSeverity; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Minor issue, trike still operational" },
  { value: "medium", label: "Medium", description: "Needs attention soon" },
  { value: "high", label: "High", description: "Urgent, trike may be unsafe" },
];

export default function ReportIssue() {
  const [trikeId, setTrikeId] = useState("");
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [severity, setSeverity] = useState<IssueSeverity | "">("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch trikes (filtered by course for non-admins)
  const { data: trikes, isLoading: trikesLoading } = useQuery({
    queryKey: ["trikes", profile?.course_id],
    queryFn: async () => {
      const query = supabase
        .from("trikes")
        .select("id, name, asset_tag, status, course_id, courses(name)")
        .order("name");

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast({
        variant: "destructive",
        title: "Too many photos",
        description: "Maximum 5 photos allowed",
      });
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const photo of photos) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${photo.name}`;
      const { data, error } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, photo);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(data.path);

      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!trikeId || !issueType || !severity || !description.trim()) {
        throw new Error("Please fill in all required fields");
      }

      // Get the trike to find its course_id
      const selectedTrike = trikes?.find((t) => t.id === trikeId);
      if (!selectedTrike) throw new Error("Trike not found");

      // Upload photos
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }

      // Create the issue
      const { error: issueError } = await supabase.from("issues").insert({
        trike_id: trikeId,
        course_id: selectedTrike.course_id,
        issue_type: issueType as IssueType,
        severity: severity as IssueSeverity,
        description: description.trim(),
        photos: photoUrls,
        reported_by: user?.id,
        reported_by_name: profile?.full_name || profile?.email || "Unknown",
      });

      if (issueError) throw issueError;

      // If high severity or breakdown, set trike to out_of_service
      if (severity === "high" || issueType === "breakdown") {
        const { error: trikeError } = await supabase
          .from("trikes")
          .update({ status: "out_of_service" })
          .eq("id", trikeId);

        if (trikeError) throw trikeError;
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["trikes"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast({
        title: "Issue reported!",
        description: "Your issue has been submitted successfully.",
      });
      // Reset form after short delay
      setTimeout(() => {
        setTrikeId("");
        setIssueType("");
        setSeverity("");
        setDescription("");
        setPhotos([]);
        setIsSuccess(false);
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  if (isSuccess) {
    return (
      <AppLayout title="Report an Issue">
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-status-available-bg flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-status-available" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Issue Reported!</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Your issue has been submitted successfully. The team will review it shortly.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Report an Issue">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle>Report an Issue</CardTitle>
                <CardDescription>
                  Report damage or problems with a golf trike
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trike Selection */}
              <div className="space-y-2">
                <Label htmlFor="trike">Select Trike *</Label>
                <Select value={trikeId} onValueChange={setTrikeId}>
                  <SelectTrigger id="trike" className="w-full">
                    <SelectValue placeholder="Choose a trike..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trikesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      trikes?.map((trike) => (
                        <SelectItem key={trike.id} value={trike.id}>
                          <span className="font-medium">{trike.name}</span>
                          {trike.asset_tag && (
                            <span className="text-muted-foreground ml-2">
                              ({trike.asset_tag})
                            </span>
                          )}
                          {isAdmin && trike.courses && (
                            <span className="text-muted-foreground ml-2">
                              - {trike.courses.name}
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Issue Type */}
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
                  <SelectTrigger id="issueType">
                    <SelectValue placeholder="Select issue type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div className="space-y-3">
                <Label>Severity *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {severityLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setSeverity(level.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        severity === level.value
                          ? level.value === "low"
                            ? "border-emerald-500 bg-emerald-50"
                            : level.value === "medium"
                            ? "border-amber-500 bg-amber-50"
                            : "border-red-500 bg-red-50"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          level.value === "low"
                            ? "text-emerald-700"
                            : level.value === "medium"
                            ? "text-amber-700"
                            : "text-red-700"
                        }`}
                      >
                        {level.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-3">
                <Label>Photos (optional)</Label>
                <div className="flex flex-wrap gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-xs">Add</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Up to 5 photos. Tap to add.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Issue Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
