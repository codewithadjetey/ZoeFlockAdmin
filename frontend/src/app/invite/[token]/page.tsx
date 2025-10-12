"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  TextInput,
  SelectInput,
  Textarea,
  ContentCard,
} from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import invitationService from "@/services/invitations";
import { toast } from "react-toastify";
import { PublicInvitationData } from "@/interfaces/invitations";

export default function PublicInvitationPage() {
  const params = useParams();
  const token = params.token as string;

  const [invitationData, setInvitationData] = useState<PublicInvitationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form data
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [status, setStatus] = useState<"confirmed" | "declined">("confirmed");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    setIsLoading(true);
    try {
      const data = await invitationService.getInvitationByToken(token);
      setInvitationData(data);
    } catch (error: any) {
      console.error("Error loading invitation:", error);
      if (error.response?.data?.expired) {
        setIsExpired(true);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load invitation"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    try {
      await invitationService.submitResponse(token, {
        guest_name: guestName,
        guest_email: guestEmail || undefined,
        guest_phone: guestPhone || undefined,
        status,
        number_of_guests: numberOfGuests,
        notes: notes || undefined,
        special_requirements: specialRequirements || undefined,
      });

      toast.success("Your response has been submitted successfully!");
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting response:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit response"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invitation Expired
          </h1>
          <p className="text-gray-600">
            This invitation link has expired. Please contact the event organizer
            for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  if (!invitationData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invitation Not Found
          </h1>
          <p className="text-gray-600">
            We couldn't find this invitation. Please check your link and try
            again.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully. We look forward to
            seeing you at the event!
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Event Details:</h3>
            <p className="text-sm text-gray-600">
              <strong>Event:</strong> {invitationData.event.title}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Date:</strong>{" "}
              {new Date(invitationData.event.start_date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Location:</strong> {invitationData.event.location}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { event, invited_by } = invitationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
          {event.img_path && (
            <div className="h-48 overflow-hidden">
              <img
                src={event.img_path}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              You're Invited!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {invited_by.name} has invited you to attend:
            </p>
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
              {event.title}
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>📅 Date:</strong>{" "}
                {new Date(event.start_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                <strong>📍 Location:</strong> {event.location}
              </p>
              {event.description && (
                <div className="mt-4">
                  <strong>📝 Description:</strong>
                  <p className="mt-2 text-gray-600">{event.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Response Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            RSVP to this Event
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Your Name *"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <TextInput
              label="Email Address"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your.email@example.com"
            />

            <TextInput
              label="Phone Number"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+1 (234) 567-8900"
            />

            <SelectInput
              label="Will you attend? *"
              value={status}
              onChange={(e) => setStatus(e.target.value as "confirmed" | "declined")}
              options={[
                { value: "confirmed", label: "Yes, I'll be there!" },
                { value: "declined", label: "Sorry, I can't make it" },
              ]}
              required
            />

            {status === "confirmed" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Including yourself
                </p>
              </div>
            )}

            <Textarea
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any message for the organizer..."
              rows={3}
            />

            {status === "confirmed" && (
              <Textarea
                label="Special Requirements"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Dietary restrictions, accessibility needs, etc."
                rows={3}
              />
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              variant="primary"
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600">
          <p className="text-sm">
            This invitation was sent by {invited_by.name} ({invited_by.email})
          </p>
        </div>
      </div>
    </div>
  );
}
