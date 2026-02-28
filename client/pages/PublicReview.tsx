import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PublicReview() {
  const { token } = useParams<{ token: string }>();
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [stars, setStars] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Invalid review link.");
      }

      const { error } = await supabase.rpc("submit_location_review", {
        p_token: token,
        p_customer_name: customerName,
        p_review_text: reviewText,
        p_stars: stars,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thanks! Your review has been submitted.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to submit review.",
      );
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Please add a short review.");
      return;
    }
    submitMutation.mutate();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Leave a Review</h1>
        <p className="mt-1 text-sm text-slate-600">
          Share your experience in a few words.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Thank you for your feedback.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="customer-name">Your name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Jane D."
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStars(value)}
                    className="rounded p-1"
                    aria-label={`Set ${value} stars`}
                  >
                    <Star
                      className={`h-6 w-6 ${value <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-text">Your review</Label>
              <Textarea
                id="review-text"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                rows={5}
                placeholder="Tell us how the project went..."
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit review"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
