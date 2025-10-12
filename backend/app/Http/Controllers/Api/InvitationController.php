<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InvitationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InvitationController extends Controller
{
    protected $invitationService;

    public function __construct(InvitationService $invitationService)
    {
        $this->invitationService = $invitationService;
    }

    /**
     * Create invitations for an event
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createInvitations(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'member_ids' => 'required_without_all:family_id,church_wide|array',
            'member_ids.*' => 'exists:members,id',
            'family_id' => 'required_without_all:member_ids,church_wide|exists:families,id',
            'church_wide' => 'required_without_all:member_ids,family_id|boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $expiresAt = $request->expires_at ? Carbon::parse($request->expires_at) : null;
            $invitations = [];

            if ($request->church_wide) {
                $invitations = $this->invitationService->createInvitationsForChurch(
                    $request->event_id,
                    $expiresAt
                );
            } elseif ($request->family_id) {
                $invitations = $this->invitationService->createInvitationsForFamily(
                    $request->event_id,
                    $request->family_id,
                    $expiresAt
                );
            } else {
                $invitations = $this->invitationService->createInvitations(
                    $request->event_id,
                    $request->member_ids,
                    $expiresAt
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Invitations created successfully',
                'data' => [
                    'invitations' => $invitations,
                    'count' => count($invitations),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invitations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get invitation by token (public endpoint)
     * 
     * @param string $token
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInvitationByToken(string $token)
    {
        try {
            $invitation = $this->invitationService->getInvitationByToken($token);

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation not found',
                ], 404);
            }

            if (!$invitation->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This invitation is no longer valid',
                    'expired' => true,
                ], 403);
            }

            // Track the click
            $this->invitationService->trackClick($token);

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $invitation->event->id,
                        'title' => $invitation->event->title,
                        'description' => $invitation->event->description,
                        'start_date' => $invitation->event->start_date,
                        'end_date' => $invitation->event->end_date,
                        'location' => $invitation->event->location,
                        'img_path' => $invitation->event->img_path,
                    ],
                    'invited_by' => [
                        'name' => $invitation->member->full_name ?? 'Unknown',
                        'email' => $invitation->member->email,
                    ],
                    'invitation' => [
                        'expires_at' => $invitation->expires_at,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve invitation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit guest response to invitation (public endpoint)
     * 
     * @param Request $request
     * @param string $token
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitResponse(Request $request, string $token)
    {
        $validator = Validator::make($request->all(), [
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'status' => 'required|in:pending,confirmed,declined',
            'number_of_guests' => 'required|integer|min:1|max:20',
            'notes' => 'nullable|string|max:1000',
            'special_requirements' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $response = $this->invitationService->submitResponse($token, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Response submitted successfully',
                'data' => $response,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get analytics for an event
     * 
     * @param Request $request
     * @param int $eventId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEventAnalytics(Request $request, int $eventId)
    {
        try {
            $filterType = $request->query('filter_type'); // 'church', 'family', 'member'
            $filterId = $request->query('filter_id');

            $analytics = $this->invitationService->getEventAnalytics($eventId, $filterType, $filterId);

            return response()->json([
                'success' => true,
                'data' => $analytics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get member's invitation statistics
     * 
     * @param int $memberId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMemberStats(int $memberId)
    {
        try {
            $stats = $this->invitationService->getMemberInvitationStats($memberId);

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve member statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Deactivate an invitation
     * 
     * @param int $invitationId
     * @return \Illuminate\Http\JsonResponse
     */
    public function deactivateInvitation(int $invitationId)
    {
        try {
            $this->invitationService->deactivateInvitation($invitationId);

            return response()->json([
                'success' => true,
                'message' => 'Invitation deactivated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate invitation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reactivate an invitation
     * 
     * @param int $invitationId
     * @return \Illuminate\Http\JsonResponse
     */
    public function reactivateInvitation(int $invitationId)
    {
        try {
            $this->invitationService->reactivateInvitation($invitationId);

            return response()->json([
                'success' => true,
                'message' => 'Invitation reactivated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reactivate invitation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update response status
     * 
     * @param Request $request
     * @param int $responseId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateResponseStatus(Request $request, int $responseId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,declined,attended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $response = $this->invitationService->updateResponseStatus($responseId, $request->status);

            return response()->json([
                'success' => true,
                'message' => 'Response status updated successfully',
                'data' => $response,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update response status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all responses for an event
     * 
     * @param Request $request
     * @param int $eventId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEventResponses(Request $request, int $eventId)
    {
        try {
            $status = $request->query('status');
            $responses = $this->invitationService->getEventResponses($eventId, $status);

            return response()->json([
                'success' => true,
                'data' => $responses,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve responses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
