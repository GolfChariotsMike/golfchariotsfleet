import { useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Plus, Search, Filter } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type TrikeStatus = Database["public"]["Enums"]["trike_status"];

export default function Trikes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrikeStatus | "all">("all");
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

  const filteredTrikes = trikes?.filter((trike) => {
    const matchesSearch =
      trike.name.toLowerCase().includes(search.toLowerCase()) ||
      trike.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
      trike.courses?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || trike.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: trikes?.length || 0,
    available: trikes?.filter((t) => t.status === "available").length || 0,
    in_repair: trikes?.filter((t) => t.status === "in_repair").length || 0,
    out_of_service: trikes?.filter((t) => t.status === "out_of_service").length || 0,
  };

  return (
    <AppLayout
      title="Trikes"
      actions={
        isAdmin && (
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Trike
          </Button>
        )
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Trikes</p>
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trikes..."
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
            <h3 className="font-medium mb-2">No trikes found</h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No trikes have been added yet"}
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
                        <Bike className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{trike.name}</h3>
                        {trike.asset_tag && (
                          <p className="text-sm text-muted-foreground">
                            {trike.asset_tag}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={trike.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trike.courses?.name || "Unassigned"}
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
