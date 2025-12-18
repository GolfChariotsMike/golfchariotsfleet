import { useState } from "react";
import { Bike, Loader2, MapPin, Warehouse } from "lucide-react";
import { TrikeIcon } from "@/components/icons/TrikeIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type AssetType = Database["public"]["Enums"]["asset_type"];

// Off-site locations (workshops/storage)
const OFF_SITE_LOCATIONS = ["Wangara", "Wembley Downs", "Greenwood"];

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const [name, setName] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("trike");
  const [locationType, setLocationType] = useState<"course" | "offsite">("course");
  const [courseId, setCourseId] = useState("");
  const [offsiteLocation, setOffsiteLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasValidLocation = locationType === "course" ? !!courseId : !!offsiteLocation;
    if (!name.trim() || !hasValidLocation) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("trikes").insert({
        name: name.trim(),
        asset_tag: assetTag.trim() || null,
        asset_type: assetType,
        course_id: locationType === "course" ? courseId : null,
        location: locationType === "offsite" ? offsiteLocation : null,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Asset created",
        description: `${assetType === "trike" ? "Trike" : "Scooter"} "${name}" has been added`,
      });

      queryClient.invalidateQueries({ queryKey: ["trikes"] });
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAssetTag("");
    setAssetType("trike");
    setLocationType("course");
    setCourseId("");
    setOffsiteLocation("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Add a new trike or scooter to the fleet
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assetType">Asset Type *</Label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trike">
                  <div className="flex items-center gap-2">
                    <TrikeIcon className="w-4 h-4" />
                    Trike
                  </div>
                </SelectItem>
                <SelectItem value="scooter">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4" />
                    Scooter
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Trike 001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetTag">Asset Tag</Label>
            <Input
              id="assetTag"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              placeholder="e.g., GCA-T-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Location Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={locationType === "course" ? "default" : "outline"}
                onClick={() => {
                  setLocationType("course");
                  setOffsiteLocation("");
                }}
                className="justify-start"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Course
              </Button>
              <Button
                type="button"
                variant={locationType === "offsite" ? "default" : "outline"}
                onClick={() => {
                  setLocationType("offsite");
                  setCourseId("");
                }}
                className="justify-start"
              >
                <Warehouse className="w-4 h-4 mr-2" />
                Off-site
              </Button>
            </div>
          </div>

          {locationType === "course" ? (
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
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
          ) : (
            <div className="space-y-2">
              <Label htmlFor="location">Off-site Location *</Label>
              <Select value={offsiteLocation} onValueChange={setOffsiteLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {OFF_SITE_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this asset"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
