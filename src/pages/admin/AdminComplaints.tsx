import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AdminLayout from "@/components/AdminLayout";
import ComplaintListItem from "@/components/ComplaintListItem";
import { Complaint } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    document.title = "Admin Complaints - Manage Complaints";

    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const complaintsCollection = collection(db, "complaints");
        const snapshot = await getDocs(complaintsCollection);
        const complaintsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintsData);
        setFilteredComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error("Failed to load complaints");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    let result = [...complaints];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((complaint) => complaint.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((complaint) => complaint.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          complaint.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredComplaints(result);
  }, [complaints, statusFilter, categoryFilter, searchQuery]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const complaintRef = doc(db, "complaints", id);
      await updateDoc(complaintRef, { status });
      toast.success(`Complaint marked as ${status}`);
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === id ? { ...complaint, status } : complaint
        )
      );
    } catch (error) {
      console.error("Error updating complaint status:", error);
      toast.error("Failed to update complaint status.");
    }
  };

  const handleAddComment = async (id: string, comment: string) => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const commentData = {
        userId: "admin", // Admin ID or role
        userName: "Admin", // Admin name
        content: comment,
        createdAt: new Date().toISOString(),
      };

      const complaintRef = doc(db, "complaints", id);
      await updateDoc(complaintRef, {
        comments: arrayUnion(commentData),
      });

      toast.success("Comment added successfully");
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id === id
            ? {
                ...complaint,
                comments: [...(complaint.comments || []), commentData],
              }
            : complaint
        )
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">All Complaints</h1>
            <p className="text-muted-foreground">Manage and process all student-submitted complaints</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            aria-label="Refresh complaints list"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters Section */}
        <div className="glass-card rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints, students, departments..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search complaints"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                aria-label="Filter by category"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                aria-label="Filter by status"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs and Complaints List */}
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex flex-col w-full space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-muted rounded-lg h-24 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <ComplaintListItem
                    key={complaint.id}
                    complaint={complaint}
                    isAdmin
                    onStatusChange={handleStatusChange}
                    onAddComment={handleAddComment}
                  />
                ))
              ) : (
                <div className="glass-card rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No complaints found</h3>
                  <p className="text-muted-foreground">Try changing your filters or search query</p>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;