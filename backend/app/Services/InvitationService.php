<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventInvitation;
use App\Models\InvitationResponse;
use App\Models\Member;
use App\Models\Family;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InvitationService
{
    /**
     * Create invitations for an event
     * Can create for specific members, family, or all church members
     */
    public function createInvitations(int $eventId, array $memberIds, ?Carbon $expiresAt = null): array
    {
        $event = Event::findOrFail($eventId);
        $invitations = [];

        foreach ($memberIds as $memberId) {
            $invitation = EventInvitation::updateOrCreate(
                [
                    'event_id' => $eventId,
                    'member_id' => $memberId,
                ],
                [
                    'expires_at' => $expiresAt,
                    'is_active' => true,
                ]
            );

            $invitations[] = $invitation->load('member');
        }

        return $invitations;
    }

    /**
     * Create invitations for all church members
     */
    public function createInvitationsForChurch(int $eventId, ?Carbon $expiresAt = null): array
    {
        $memberIds = Member::active()->pluck('id')->toArray();
        return $this->createInvitations($eventId, $memberIds, $expiresAt);
    }

    /**
     * Create invitations for a specific family
     */
    public function createInvitationsForFamily(int $eventId, int $familyId, ?Carbon $expiresAt = null): array
    {
        $family = Family::findOrFail($familyId);
        $memberIds = $family->activeMembers()->pluck('members.id')->toArray();
        return $this->createInvitations($eventId, $memberIds, $expiresAt);
    }

    /**
     * Get invitation by unique token
     */
    public function getInvitationByToken(string $token): ?EventInvitation
    {
        return EventInvitation::where('unique_token', $token)
            ->with(['event', 'member'])
            ->first();
    }

    /**
     * Track invitation click
     */
    public function trackClick(string $token): void
    {
        $invitation = EventInvitation::where('unique_token', $token)->first();
        if ($invitation) {
            $invitation->incrementClickCount();
        }
    }

    /**
     * Submit a guest response
     */
    public function submitResponse(string $token, array $data): InvitationResponse
    {
        $invitation = EventInvitation::where('unique_token', $token)->firstOrFail();

        if (!$invitation->isValid()) {
            throw new \Exception('This invitation is no longer valid.');
        }

        $response = InvitationResponse::create([
            'event_invitation_id' => $invitation->id,
            'guest_name' => $data['guest_name'],
            'guest_email' => $data['guest_email'] ?? null,
            'guest_phone' => $data['guest_phone'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'number_of_guests' => $data['number_of_guests'] ?? 1,
            'notes' => $data['notes'] ?? null,
            'special_requirements' => $data['special_requirements'] ?? null,
            'responded_at' => now(),
        ]);

        $invitation->incrementResponseCount();

        return $response->load('invitation.event');
    }

    /**
     * Get analytics for an event
     */
    public function getEventAnalytics(int $eventId, ?string $filterType = null, ?int $filterId = null): array
    {
        $query = EventInvitation::where('event_id', $eventId);

        // Apply filters
        if ($filterType === 'member' && $filterId) {
            $query->where('member_id', $filterId);
        } elseif ($filterType === 'family' && $filterId) {
            $family = Family::findOrFail($filterId);
            $memberIds = $family->activeMembers()->pluck('members.id')->toArray();
            $query->whereIn('member_id', $memberIds);
        }
        // If filterType is 'church' or null, no additional filtering needed

        $invitations = $query->with(['member', 'responses'])->get();

        // Calculate statistics
        $totalInvitations = $invitations->count();
        $totalClicks = $invitations->sum('click_count');
        $totalResponses = $invitations->sum('response_count');
        
        $allResponses = InvitationResponse::whereIn('event_invitation_id', $invitations->pluck('id'))->get();
        
        $confirmedResponses = $allResponses->where('status', 'confirmed')->count();
        $declinedResponses = $allResponses->where('status', 'declined')->count();
        $pendingResponses = $allResponses->where('status', 'pending')->count();
        $attendedResponses = $allResponses->where('status', 'attended')->count();
        
        $totalGuests = $allResponses->sum('number_of_guests');
        $confirmedGuests = $allResponses->where('status', 'confirmed')->sum('number_of_guests');

        // Top performers
        $topPerformers = $invitations->sortByDesc('response_count')->take(10)->map(function ($invitation) {
            return [
                'member_id' => $invitation->member_id,
                'member_name' => $invitation->member->full_name ?? 'Unknown',
                'clicks' => $invitation->click_count,
                'responses' => $invitation->response_count,
                'guests' => $invitation->total_guests,
                'confirmed_guests' => $invitation->confirmed_guests,
            ];
        })->values();

        return [
            'summary' => [
                'total_invitations' => $totalInvitations,
                'total_clicks' => $totalClicks,
                'total_responses' => $totalResponses,
                'total_guests' => $totalGuests,
                'confirmed_guests' => $confirmedGuests,
                'click_through_rate' => $totalInvitations > 0 ? round(($totalClicks / $totalInvitations) * 100, 2) : 0,
                'response_rate' => $totalClicks > 0 ? round(($totalResponses / $totalClicks) * 100, 2) : 0,
            ],
            'responses_breakdown' => [
                'confirmed' => $confirmedResponses,
                'declined' => $declinedResponses,
                'pending' => $pendingResponses,
                'attended' => $attendedResponses,
            ],
            'top_performers' => $topPerformers,
            'invitations' => $invitations->map(function ($invitation) {
                return [
                    'id' => $invitation->id,
                    'member' => [
                        'id' => $invitation->member_id,
                        'name' => $invitation->member->full_name ?? 'Unknown',
                        'email' => $invitation->member->email ?? null,
                    ],
                    'unique_token' => $invitation->unique_token,
                    'invitation_url' => $invitation->invitation_url,
                    'clicks' => $invitation->click_count,
                    'responses' => $invitation->response_count,
                    'total_guests' => $invitation->total_guests,
                    'confirmed_guests' => $invitation->confirmed_guests,
                    'is_active' => $invitation->is_active,
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                    'created_at' => $invitation->created_at->toIso8601String(),
                ];
            }),
        ];
    }

    /**
     * Get member's invitations statistics
     */
    public function getMemberInvitationStats(int $memberId): array
    {
        $invitations = EventInvitation::where('member_id', $memberId)
            ->with(['event', 'responses'])
            ->get();

        return [
            'total_invitations' => $invitations->count(),
            'total_clicks' => $invitations->sum('click_count'),
            'total_responses' => $invitations->sum('response_count'),
            'total_guests' => $invitations->sum(function ($inv) {
                return $inv->total_guests;
            }),
            'invitations' => $invitations->map(function ($invitation) {
                return [
                    'id' => $invitation->id,
                    'event' => [
                        'id' => $invitation->event_id,
                        'title' => $invitation->event->title ?? 'Unknown',
                        'start_date' => $invitation->event->start_date?->toIso8601String(),
                    ],
                    'invitation_url' => $invitation->invitation_url,
                    'clicks' => $invitation->click_count,
                    'responses' => $invitation->response_count,
                    'guests' => $invitation->total_guests,
                ];
            }),
        ];
    }

    /**
     * Deactivate an invitation
     */
    public function deactivateInvitation(int $invitationId): bool
    {
        $invitation = EventInvitation::findOrFail($invitationId);
        $invitation->is_active = false;
        return $invitation->save();
    }

    /**
     * Reactivate an invitation
     */
    public function reactivateInvitation(int $invitationId): bool
    {
        $invitation = EventInvitation::findOrFail($invitationId);
        $invitation->is_active = true;
        return $invitation->save();
    }

    /**
     * Update response status
     */
    public function updateResponseStatus(int $responseId, string $status): InvitationResponse
    {
        $response = InvitationResponse::findOrFail($responseId);
        $response->status = $status;
        $response->save();

        return $response->load('invitation.event');
    }

    /**
     * Get all responses for an event
     */
    public function getEventResponses(int $eventId, ?string $status = null): array
    {
        $query = InvitationResponse::whereHas('invitation', function ($q) use ($eventId) {
            $q->where('event_id', $eventId);
        })->with(['invitation.member']);

        if ($status) {
            $query->where('status', $status);
        }

        $responses = $query->orderBy('responded_at', 'desc')->get();

        return $responses->map(function ($response) {
            return [
                'id' => $response->id,
                'guest_name' => $response->guest_name,
                'guest_email' => $response->guest_email,
                'guest_phone' => $response->guest_phone,
                'status' => $response->status,
                'number_of_guests' => $response->number_of_guests,
                'notes' => $response->notes,
                'special_requirements' => $response->special_requirements,
                'responded_at' => $response->responded_at->toIso8601String(),
                'invited_by' => [
                    'id' => $response->invitation->member_id,
                    'name' => $response->invitation->member->full_name ?? 'Unknown',
                ],
            ];
        })->toArray();
    }
}

