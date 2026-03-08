"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  StarHalf,
  MessageSquare,
  ThumbsUp,
  Flag,
  MoreVertical,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Reply,
  Send,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
  Award,
  Clock,
  Heart,
  Share2,
  BarChart,
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Rating {
  id: number;
  stationId: number;
  userId: string;
  rating: number; // 1-5
  comment?: string | null;
  cleanliness?: number | null;
  accessibility?: number | null;
  reliability?: number | null;
  staffFriendliness?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsSectionProps {
  ratings: Rating[];
  stationId: number;
  onAddReview?: (review: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEditReview?: (id: number, review: Partial<Rating>) => Promise<void>;
  onDeleteReview?: (id: number) => Promise<void>;
  onReportReview?: (id: number, reason: string) => Promise<void>;
  currentUserId?: string;
}

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent"
};

const categoryLabels = {
  cleanliness: "Cleanliness",
  accessibility: "Accessibility",
  reliability: "Reliability",
  staffFriendliness: "Staff Friendliness"
};

export function ReviewsSection({ 
  ratings, 
  stationId,
  onAddReview,
  onEditReview,
  onDeleteReview,
  onReportReview,
  currentUserId = "current-user" // In real app, get from auth
}: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Rating | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState<Partial<Rating>>({
    rating: 5,
    comment: "",
    cleanliness: 5,
    accessibility: 5,
    reliability: 5,
    staffFriendliness: 5,
  });

  // Calculate statistics
  const totalReviews = ratings.length;
  const averageRating = ratings.length > 0
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
    : 0;
  
  const ratingDistribution = [5,4,3,2,1].map(star => ({
    stars: star,
    count: ratings.filter(r => Math.floor(r.rating) === star).length,
    percentage: totalReviews > 0 
      ? (ratings.filter(r => Math.floor(r.rating) === star).length / totalReviews) * 100 
      : 0
  }));

  const categoryAverages = {
    cleanliness: ratings.filter(r => r.cleanliness).reduce((acc, r) => acc + (r.cleanliness || 0), 0) / ratings.filter(r => r.cleanliness).length || 0,
    accessibility: ratings.filter(r => r.accessibility).reduce((acc, r) => acc + (r.accessibility || 0), 0) / ratings.filter(r => r.accessibility).length || 0,
    reliability: ratings.filter(r => r.reliability).reduce((acc, r) => acc + (r.reliability || 0), 0) / ratings.filter(r => r.reliability).length || 0,
    staffFriendliness: ratings.filter(r => r.staffFriendliness).reduce((acc, r) => acc + (r.staffFriendliness || 0), 0) / ratings.filter(r => r.staffFriendliness).length || 0,
  };

  // Sort and filter reviews
  const filteredReviews = ratings.filter(r => 
    filterRating === "all" ? true : Math.floor(r.rating) === filterRating
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const handleAddReview = async () => {
    if (!newReview.rating || !newReview.comment?.trim()) {
      toast.error("Validation Error", {
        description: "Please provide a rating and comment.",
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Posting your review...");

    try {
      await onAddReview?.({
        stationId,
        userId: currentUserId,
        rating: newReview.rating,
        comment: newReview.comment,
        cleanliness: newReview.cleanliness,
        accessibility: newReview.accessibility,
        reliability: newReview.reliability,
        staffFriendliness: newReview.staffFriendliness,
      });

      toast.success("Review Added", {
        description: "Your review has been posted successfully.",
        id: toastId,
        duration: 4000,
      });

      setIsAddDialogOpen(false);
      setNewReview({
        rating: 5,
        comment: "",
        cleanliness: 5,
        accessibility: 5,
        reliability: 5,
        staffFriendliness: 5,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to post review. Please try again.",
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = async () => {
    if (!selectedReview) return;
    
    setIsSubmitting(true);
    const toastId = toast.loading("Updating your review...");

    try {
      await onEditReview?.(selectedReview.id, newReview);
      
      toast.success("Review Updated", {
        description: "Your review has been updated successfully.",
        id: toastId,
        duration: 4000,
      });

      setIsAddDialogOpen(false);
      setSelectedReview(null);
      setNewReview({
        rating: 5,
        comment: "",
        cleanliness: 5,
        accessibility: 5,
        reliability: 5,
        staffFriendliness: 5,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update review. Please try again.",
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    const toastId = toast.loading("Deleting review...");

    try {
      await onDeleteReview?.(id);
      
      toast.success("Review Deleted", {
        description: "Your review has been removed successfully.",
        id: toastId,
        duration: 4000,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete review. Please try again.",
        id: toastId,
        duration: 4000,
      });
    }
  };

  const handleReportReview = async () => {
    if (!selectedReview || !reportReason.trim()) {
      toast.error("Validation Error", {
        description: "Please provide a reason for reporting.",
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting report...");

    try {
      await onReportReview?.(selectedReview.id, reportReason);
      
      toast.success("Report Submitted", {
        description: "Thank you for helping us maintain quality reviews.",
        id: toastId,
        duration: 4000,
      });

      setIsReportDialogOpen(false);
      setSelectedReview(null);
      setReportReason("");
    } catch (error) {
      toast.error("Error", {
        description: "Failed to submit report. Please try again.",
        id: toastId,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = (reviewId: number) => {
    toast.success("Feedback recorded", {
      description: "You found this review helpful.",
      duration: 2000,
    });
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const starSizes = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rating;
          const halfFilled = !filled && star - 0.5 <= rating;
          
          return (
            <Star
              key={star}
              className={cn(
                starSizes[size],
                filled ? "fill-yellow-400 text-yellow-400" : 
                halfFilled ? "fill-yellow-400/50 text-yellow-400" : 
                "text-gray-300"
              )}
            />
          );
        })}
      </div>
    );
  };

  const confirmDelete = (review: Rating) => {
    toast.custom((t) => (
      <Card className="p-4 shadow-lg border-destructive">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Delete Review</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toast.dismiss(t)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  handleDeleteReview(review.id);
                  toast.dismiss(t);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    ), { duration: Infinity });
  };

  if (ratings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="p-4 rounded-full bg-muted mb-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your experience at this charging station.
          </p>
          {onAddReview && (
            <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
              <Star className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Reviews & Ratings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              See what others are saying about this station
            </p>
          </div>
          {onAddReview && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Star className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          )}
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Rating */}
          <Card className="p-6 col-span-1">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(averageRating, "lg")}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-8">{stars} ★</span>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Ratings */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              Detailed Ratings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(categoryAverages).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{categoryLabels[key as keyof typeof categoryLabels]}</span>
                    <span className="text-sm font-medium">{value.toFixed(1)} ★</span>
                  </div>
                  <Progress value={(value / 5) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filterRating.toString()}
              onValueChange={(value) => setFilterRating(value === "all" ? "all" : parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 ★ Only</SelectItem>
                <SelectItem value="4">4 ★ & Up</SelectItem>
                <SelectItem value="3">3 ★ & Up</SelectItem>
                <SelectItem value="2">2 ★ & Up</SelectItem>
                <SelectItem value="1">1 ★ & Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {review.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">User {review.userId.slice(0, 8)}</span>
                      {review.userId === currentUserId && (
                        <Badge variant="outline" className="text-xs">
                          Your Review
                        </Badge>
                      )}
                      {review.rating === 5 && (
                        <Badge className="bg-amber-500 text-white text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Top Reviewer
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                      </div>
                      {review.updatedAt !== review.createdAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Edited
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-2">
                    {renderStars(review.rating)}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {review.userId === currentUserId ? (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setNewReview(review);
                            setSelectedReview(review);
                            setIsAddDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Review
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => confirmDelete(review)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Review
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => handleHelpful(review.id)}>
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Helpful
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedReview(review);
                              setIsReportDialogOpen(true);
                            }}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-muted-foreground mb-4 pl-14">
                  {review.comment}
                </p>
              )}

              {/* Category Ratings */}
              {(review.cleanliness || review.accessibility || review.reliability || review.staffFriendliness) && (
                <div className="pl-14">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                    {review.cleanliness && (
                      <div>
                        <p className="text-xs text-muted-foreground">Cleanliness</p>
                        <div className="flex items-center gap-1">
                          {renderStars(review.cleanliness, "sm")}
                        </div>
                      </div>
                    )}
                    {review.accessibility && (
                      <div>
                        <p className="text-xs text-muted-foreground">Accessibility</p>
                        <div className="flex items-center gap-1">
                          {renderStars(review.accessibility, "sm")}
                        </div>
                      </div>
                    )}
                    {review.reliability && (
                      <div>
                        <p className="text-xs text-muted-foreground">Reliability</p>
                        <div className="flex items-center gap-1">
                          {renderStars(review.reliability, "sm")}
                        </div>
                      </div>
                    )}
                    {review.staffFriendliness && (
                      <div>
                        <p className="text-xs text-muted-foreground">Staff</p>
                        <div className="flex items-center gap-1">
                          {renderStars(review.staffFriendliness, "sm")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Helpful Section */}
              <div className="flex items-center gap-4 mt-4 pl-14">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Helpful
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Review Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReview ? 'Edit Your Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your experience at this charging station
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Overall Rating */}
            <div className="space-y-2">
              <Label>Overall Rating *</Label>
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-all",
                        rating <= (newReview.rating || 0)
                          ? "fill-yellow-400 text-yellow-400 scale-110"
                          : "text-gray-300 hover:text-gray-400"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Your Review *</Label>
              <Textarea
                id="comment"
                placeholder="Tell others about your experience..."
                value={newReview.comment || ''}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
              />
            </div>

            {/* Category Ratings */}
            <div className="space-y-3">
              <Label>Detailed Ratings (Optional)</Label>
              {Object.entries({
                cleanliness: "Cleanliness",
                accessibility: "Accessibility",
                reliability: "Reliability",
                staffFriendliness: "Staff Friendliness"
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ 
                          ...newReview, 
                          [key]: rating 
                        })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4 transition-all",
                            rating <= (newReview[key as keyof typeof newReview] as number || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setSelectedReview(null);
              setNewReview({
                rating: 5,
                comment: "",
                cleanliness: 5,
                accessibility: 5,
                reliability: 5,
                staffFriendliness: 5,
              });
            }}>
              Cancel
            </Button>
            <Button onClick={selectedReview ? handleEditReview : handleAddReview} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedReview ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {selectedReview ? 'Update Review' : 'Post Review'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Review Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Let us know why you're reporting this review
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Please provide details about why you're reporting this review..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsReportDialogOpen(false);
              setSelectedReview(null);
              setReportReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReportReview}
              disabled={isSubmitting || !reportReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}