import { useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Plus, Search, Filter, Warehouse } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AddAssetDialog } from "@/components/AddAssetDialog";
import { TrikeIcon } from "@/components/icons/TrikeIcon";
import type { Database } from "@/integrations/supabase/types";

type TrikeStatus = Database["public"]["Enums"]["trike_status"];
type AssetType = Database["public"]["Enums"]["asset_type"];

export default function Trikes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrikeStatus | "all">("all");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | "all">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isAdmin } = useAuth();

  const { data: trikes, isLoading } = useQuery({
    queryKey: ["trikes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trikes")
        .select("*, courses(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

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

  const filteredTrikes = trikes?.filter((trike) => {
    const matchesSearch =
      trike.name.toLowerCase().includes(search.toLowerCase()) ||
      trike.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
      trike.courses?.name?.toLowerCase().includes(search.toLowerCase()) ||
      trike.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || trike.status === statusFilter;
    const matchesAssetType = assetTypeFilter === "all" || trike.asset_type === assetTypeFilter;
    const matchesCourse = courseFilter === "all" || trike.course_id === courseFilter || 
      (courseFilter === "offsite" && trike.location);
    return matchesSearch && matchesStatus && matchesAssetType && matchesCourse;
  });

  const statusCounts = {
    all: trikes?.length || 0,
    available: trikes?.filter((t) => t.status === "available").length || 0,
    in_repair: trikes?.filter((t) => t.status === "in_repair").length || 0,
    out_of_service: trikes?.filter((t) => t.status === "out_of_service").length || 0,
  };

  const assetTypeCounts = {
    all: trikes?.length || 0,
    trike: trikes?.filter((t) => t.asset_type === "trike").length || 0,
    scooter: trikes?.filter((t) => t.asset_type === "scooter").length || 0,
  };

  const AssetIcon = ({ type, className }: { type: AssetType; className?: string }) => 
    type === "scooter" ? <Bike className={className || "w-5 h-5 text-primary"} /> : <TrikeIcon className={className || "w-5 h-5 text-primary"} />;

  return (
    <AppLayout
      title="Fleet"
      actions={
        isAdmin && (
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        )
      }
    >
      <AddAssetDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      {/* Asset Type Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={assetTypeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setAssetTypeFilter("all")}
        >
          All ({assetTypeCounts.all})
        </Button>
        <Button
          variant={assetTypeFilter === "trike" ? "default" : "outline"}
          size="sm"
          onClick={() => setAssetTypeFilter("trike")}
        >
          <TrikeIcon className="w-4 h-4 mr-2" />
          Trikes ({assetTypeCounts.trike})
        </Button>
        <Button
          variant={assetTypeFilter === "scooter" ? "default" : "outline"}
          size="sm"
          onClick={() => setAssetTypeFilter("scooter")}
        >
          <Bike className="w-4 h-4 mr-2" />
          Scooters ({assetTypeCounts.scooter})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">{statusCounts.all}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("available")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-status-available">{statusCounts.available}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("in_repair")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In Repair</p>
            <p className="text-2xl font-bold text-status-in-repair">{statusCounts.in_repair}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("out_of_service")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Out of Service</p>
            <p className="text-2xl font-bold text-status-out-of-service">{statusCounts.out_of_service}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TrikeStatus | "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_repair">In Repair</SelectItem>
            <SelectItem value="out_of_service">Out of Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter Buttons */}
      {isAdmin && courses && courses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={courseFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCourseFilter("all")}
          >
            All Locations
          </Button>
          {courses.map((course) => (
            <Button
              key={course.id}
              variant={courseFilter === course.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCourseFilter(course.id)}
            >
              {course.name}
            </Button>
          ))}
          <Button
            variant={courseFilter === "offsite" ? "default" : "outline"}
            size="sm"
            onClick={() => setCourseFilter("offsite")}
          >
            <Warehouse className="w-4 h-4 mr-1" />
            Off-site
          </Button>
        </div>
      )}

      {/* Trike List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTrikes?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bike className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No assets found</h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all" || assetTypeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No assets have been added yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrikes?.map((trike) => (
            <Link key={trike.id} to={`/trikes/${trike.id}`}>
              <Card className="hover:shadow-card transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <AssetIcon type={trike.asset_type} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{trike.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {trike.asset_type}{trike.asset_tag && ` • ${trike.asset_tag}`}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={trike.status} />
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {trike.location ? (
                      <>
                        <Warehouse className="w-3 h-3" />
                        {trike.location}
                      </>
                    ) : (
                      trike.courses?.name || "Unassigned"
                    )}
                  </div>
                  {trike.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {trike.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
