import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Complaint } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { motion } from "framer-motion";
import { FileText, MoreHorizontal, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComplaintListItemProps {
  complaint: Complaint;
  onStatusChange?: (id: string, status: Complaint["status"]) => void;
  isAdmin?: boolean;
  index?: number;
}

const ComplaintListItem = ({
  complaint,
  onStatusChange,
  isAdmin = false,
  index = 0,
}: ComplaintListItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const basePath = isAdmin ? "/admin/complaints" : "/complaints";

  const getPriorityColor = (priority: Complaint["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  // Ensure createdAt is valid before formatting
  const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : null;
  const priority = complaint.priority || "low"; // Default to "low"
  const category = complaint.category || "general"; // Default to "general"

  if (createdAt && isNaN(createdAt.getTime())) {
    console.warn(`Invalid date value for complaint ID: ${complaint.id}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`glass-card rounded-lg p-4 mb-3 transition-all duration-300 ${
        isHovered ? "shadow-md" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-shrink-0 bg-primary/10 rounded-full p-2.5">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-grow min-w-0">
          <Link to={`${basePath}/${complaint.id}`} className="hover:underline">
            <h3 className="font-medium text-lg line-clamp-1">{complaint.title}</h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {createdAt && !isNaN(createdAt.getTime())
                ? format(createdAt, "MMM d, yyyy")
                : "Date not available"}
            </span>
            <span>•</span>
            <span className={`font-medium ${getPriorityColor(priority)}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </span>
            <span>•</span>
            <span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0 self-end sm:self-center">
          <StatusBadge status={complaint.status} />

          {isAdmin && (
            <>
              {/* Dropdown for Admin Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Admin actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem
                    onClick={() => onStatusChange?.(complaint.id, "in-progress")}
                  >
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange?.(complaint.id, "resolved")}
                  >
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange?.(complaint.id, "rejected")}
                    className="text-red-500"
                  >
                    Reject Complaint
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Button to Add/View Comments */}
              <Link to={`${basePath}/${complaint.id}`}>
                <Button variant="ghost" size="icon" aria-label="View comments">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintListItem;