"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PageHeader,
  Button,
  StatCard,
  DataTable,
  DataGrid,
  SelectInput,
  ContentCard,
  StatusBadge,
  TabNavigation,
  ViewToggle,
} from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import invitationService from "@/services/invitations";
import { EventsService } from "@/services/events";
import { FamiliesService } from "@/services/families";
import { MembersService } from "@/services/members";
import { toast } from "react-toastify";
import {
  InvitationAnalytics,
  InvitationResponse,
} from "@/interfaces/invitations";
import { Event } from "@/interfaces/events";

export default function EventInvitationsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.eventId as string);

  const [event, setEvent] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<InvitationAnalytics | null>(null);
  const [responses, setResponses] = useState<InvitationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "invitations" | "responses">("overview");
  
  // View mode states
  const [invitationsViewMode, setInvitationsViewMode] = useState<"grid" | "table">("table");
  const [responsesViewMode, setResponsesViewMode] = useState<"grid" | "table">("table");
  
  // Filter states
  const [filterType, setFilterType] = useState<"church" | "family" | "member">("church");
  const [filterId, setFilterId] = useState<number | undefined>();
  const [families, setFamilies] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  // Create invitation modal states
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<"church" | "family" | "members">("church");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | undefined>();

  useEffect(() => {
    loadData();
    loadFamilies();
    loadMembers();
  }, [eventId]);

  useEffect(() => {
    if (analytics) {
      loadAnalytics();
    }
  }, [filterType, filterId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventResponse, analyticsData, responsesData] = await Promise.all([
        EventsService.getEvent(eventId),
        invitationService.getEventAnalytics(eventId),
        invitationService.getEventResponses(eventId),
      ]);

      if (eventResponse.success) {
        setEvent(eventResponse.data);
      }
      setAnalytics(analyticsData);
      setResponses(responsesData);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.response?.data?.message || "Failed to load invitation data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await invitationService.getEventAnalytics(
        eventId,
        filterType,
        filterId
      );
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    }
  };

  const loadFamilies = async () => {
    try {
      const response = await FamiliesService.getFamilies({ per_page: 1000 });
      if (response.success && response.families) {
        setFamilies(response.families.data);
      }
    } catch (error) {
      console.error("Error loading families:", error);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await MembersService.getMembers({ per_page: 1000 });
      if (response.success && response.members) {
        setMembers(response.members.data);
      }
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleCreateInvitations = async () => {
    setIsCreating(true);
    try {
      let data: any = { event_id: eventId };

      if (createType === "church") {
        data.church_wide = true;
      } else if (createType === "family") {
        if (!selectedFamily) {
          toast.error("Please select a family");
          return;
        }
        data.family_id = selectedFamily;
      } else {
        if (selectedMembers.length === 0) {
          toast.error("Please select at least one member");
          return;
        }
        data.member_ids = selectedMembers;
      }

      const result = await invitationService.createInvitations(data);
      toast.success(`${result.count} invitation(s) created successfully`);
      loadData();
      setSelectedMembers([]);
      setSelectedFamily(undefined);
    } catch (error: any) {
      console.error("Error creating invitations:", error);
      toast.error(error.response?.data?.message || "Failed to create invitations");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Invitation link copied to clipboard!");
  };

  const handleToggleInvitation = async (invitationId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await invitationService.deactivateInvitation(invitationId);
        toast.success("Invitation deactivated");
      } else {
        await invitationService.reactivateInvitation(invitationId);
        toast.success("Invitation reactivated");
      }
      loadData();
    } catch (error: any) {
      console.error("Error toggling invitation:", error);
      toast.error("Failed to update invitation");
    }
  };

  const handleUpdateResponseStatus = async (
    responseId: number,
    status: "pending" | "confirmed" | "declined" | "attended"
  ) => {
    try {
      await invitationService.updateResponseStatus(responseId, status);
      toast.success("Response status updated");
      loadData();
    } catch (error: any) {
      console.error("Error updating response:", error);
      toast.error("Failed to update response");
    }
  };

  if (isLoading || !event || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const invitationsColumns = [
    {
      header: "Member",
      accessor: "member" as const,
      render: (value: any) => (
        <div>
          <div className="font-medium">{value.name}</div>
          <div className="text-sm text-gray-500">{value.email}</div>
        </div>
      ),
    },
    {
      header: "Clicks",
      accessor: "clicks" as const,
    },
    {
      header: "Responses",
      accessor: "responses" as const,
    },
    {
      header: "Total Guests",
      accessor: "total_guests" as const,
    },
    {
      header: "Confirmed",
      accessor: "confirmed_guests" as const,
    },
    {
      header: "Status",
      accessor: "is_active" as const,
      render: (value: boolean) => (
        <StatusBadge status={value ? "active" : "inactive"}>
          {value ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      render: (value: number, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCopyLink(row.invitation_url)}
          >
            Copy Link
          </Button>
          <Button
            variant={row.is_active ? "danger" : "primary"}
            size="sm"
            onClick={() => handleToggleInvitation(value, row.is_active)}
          >
            {row.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  const responsesColumns = [
    {
      header: "Guest Name",
      accessor: "guest_name" as const,
    },
    {
      header: "Email",
      accessor: "guest_email" as const,
      render: (value: string | null) => value || "N/A",
    },
    {
      header: "Phone",
      accessor: "guest_phone" as const,
      render: (value: string | null) => value || "N/A",
    },
    {
      header: "Guests",
      accessor: "number_of_guests" as const,
    },
    {
      header: "Status",
      accessor: "status" as const,
      render: (value: string) => <StatusBadge status={value}>{value}</StatusBadge>,
    },
    {
      header: "Invited By",
      accessor: "invited_by" as const,
      render: (value: any) => value?.name || "Unknown",
    },
    {
      header: "Actions",
      accessor: "id" as const,
      render: (value: number, row: any) => (
        <SelectInput
          value={row.status}
          onChange={(e) =>
            handleUpdateResponseStatus(
              value,
              e.target.value as "pending" | "confirmed" | "declined" | "attended"
            )
          }
          options={[
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "declined", label: "Declined" },
            { value: "attended", label: "Attended" },
          ]}
        />
      ),
    },
  ];

  // Card renderers for grid view
  const renderInvitationCard = (invitation: any) => (
    <div className="rounded-3xl shadow-xl p-6 bg-white dark:bg-gray-800 hover:shadow-2xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {invitation.member.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{invitation.member.email}</p>
        </div>
        <StatusBadge status={invitation.is_active ? "active" : "inactive"}>
          {invitation.is_active ? "Active" : "Inactive"}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invitation.clicks}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Clicks</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{invitation.responses}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Responses</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{invitation.total_guests}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Guests</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{invitation.confirmed_guests}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Confirmed</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleCopyLink(invitation.invitation_url)}
          className="flex-1"
        >
          <i className="fas fa-copy mr-1"></i>
          Copy Link
        </Button>
        <Button
          variant={invitation.is_active ? "danger" : "primary"}
          size="sm"
          onClick={() => handleToggleInvitation(invitation.id, invitation.is_active)}
          className="flex-1"
        >
          {invitation.is_active ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );

  const renderResponseCard = (response: any) => (
    <div className="rounded-3xl shadow-xl p-6 bg-white dark:bg-gray-800 hover:shadow-2xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {response.guest_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {response.guest_email || response.guest_phone || "No contact info"}
          </p>
        </div>
        <StatusBadge status={response.status}>{response.status}</StatusBadge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Number of Guests:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{response.number_of_guests}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Invited By:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {response.invited_by?.name || "Unknown"}
          </span>
        </div>
        {response.notes && (
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Notes:</span>
            <p className="text-gray-900 dark:text-white mt-1 text-xs">{response.notes}</p>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Update Status:</label>
        <SelectInput
          value={response.status}
          onChange={(e) =>
            handleUpdateResponseStatus(
              response.id,
              e.target.value as "pending" | "confirmed" | "declined" | "attended"
            )
          }
          options={[
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "declined", label: "Declined" },
            { value: "attended", label: "Attended" },
          ]}
        />
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "invitations", label: "Invitations" },
    { id: "responses", label: "Responses" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Event Invitations: ${event.title}`}
        subtitle="Manage and track event invitations"
      >
        <Button onClick={() => router.back()}>Back to Events</Button>
      </PageHeader>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as any)}
      />

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Invitations"
              value={analytics.summary.total_invitations}
              icon="📧"
            />
            <StatCard
              title="Total Clicks"
              value={analytics.summary.total_clicks}
              subtitle={`${analytics.summary.click_through_rate}% CTR`}
              icon="👆"
            />
            <StatCard
              title="Total Responses"
              value={analytics.summary.total_responses}
              subtitle={`${analytics.summary.response_rate}% Response Rate`}
              icon="✅"
            />
            <StatCard
              title="Confirmed Guests"
              value={analytics.summary.confirmed_guests}
              subtitle={`of ${analytics.summary.total_guests} total`}
              icon="👥"
            />
          </div>

          {/* Responses Breakdown */}
          <ContentCard title="Responses Breakdown">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.responses_breakdown.confirmed}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.responses_breakdown.declined}
                </div>
                <div className="text-sm text-gray-600">Declined</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.responses_breakdown.pending}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.responses_breakdown.attended}
                </div>
                <div className="text-sm text-gray-600">Attended</div>
              </div>
            </div>
          </ContentCard>

          {/* Top Performers */}
          {analytics.top_performers.length > 0 && (
            <ContentCard title="Top Performers">
              <DataTable
                data={analytics.top_performers}
                columns={[
                  { header: "Member", accessor: "member_name" as const },
                  { header: "Clicks", accessor: "clicks" as const },
                  { header: "Responses", accessor: "responses" as const },
                  { header: "Guests", accessor: "guests" as const },
                  { header: "Confirmed", accessor: "confirmed_guests" as const },
                ]}
              />
            </ContentCard>
          )}

          {/* Filters */}
          <ContentCard title="Filter Analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectInput
                label="Filter By"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setFilterId(undefined);
                }}
                options={[
                  { value: "church", label: "Entire Church" },
                  { value: "family", label: "By Family" },
                  { value: "member", label: "By Member" },
                ]}
              />
              {filterType === "family" && (
                <SelectInput
                  label="Select Family"
                  value={filterId?.toString() || ""}
                  onChange={(e) => setFilterId(parseInt(e.target.value))}
                  options={[
                    { value: "", label: "Select a family" },
                    ...families.map((f) => ({ value: f.id.toString(), label: f.name })),
                  ]}
                />
              )}
              {filterType === "member" && (
                <SelectInput
                  label="Select Member"
                  value={filterId?.toString() || ""}
                  onChange={(e) => setFilterId(parseInt(e.target.value))}
                  options={[
                    { value: "", label: "Select a member" },
                    ...members.map((m) => ({
                      value: m.id.toString(),
                      label: `${m.first_name} ${m.last_name}`,
                    })),
                  ]}
                />
              )}
            </div>
          </ContentCard>
        </div>
      )}

      {activeTab === "invitations" && (
        <div className="space-y-6">
          {/* Create Invitations */}
          <ContentCard title="Create New Invitations">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectInput
                  label="Create For"
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value as any)}
                  options={[
                    { value: "church", label: "Entire Church" },
                    { value: "family", label: "Specific Family" },
                    { value: "members", label: "Specific Members" },
                  ]}
                />
                {createType === "family" && (
                  <SelectInput
                    label="Select Family"
                    value={selectedFamily?.toString() || ""}
                    onChange={(e) => setSelectedFamily(parseInt(e.target.value))}
                    options={[
                      { value: "", label: "Select a family" },
                      ...families.map((f) => ({ value: f.id.toString(), label: f.name })),
                    ]}
                  />
                )}
              </div>
              {createType === "members" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Members
                  </label>
                  <div className="max-h-64 overflow-y-auto border rounded p-4 space-y-2">
                    {members.map((member) => (
                      <label key={member.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(
                                selectedMembers.filter((id) => id !== member.id)
                              );
                            }
                          }}
                        />
                        <span>
                          {member.first_name} {member.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <Button onClick={handleCreateInvitations} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Invitations"}
              </Button>
            </div>
          </ContentCard>

          {/* View Toggle and Invitations List */}
          <div className="space-y-4">
            <ViewToggle
              value={invitationsViewMode}
              onChange={(v) => setInvitationsViewMode(v as any)}
              options={[
                { value: "table", label: "Table", icon: "fas fa-table" },
                { value: "grid", label: "Grid", icon: "fas fa-th" },
              ]}
              count={analytics.invitations.length}
              countLabel="invitations"
            />

            {invitationsViewMode === "table" ? (
              <ContentCard title="All Invitations">
                <DataTable data={analytics.invitations} columns={invitationsColumns} />
              </ContentCard>
            ) : (
              <DataGrid
                data={analytics.invitations}
                renderCard={renderInvitationCard}
                columns={4}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "responses" && (
        <div className="space-y-4">
          <ViewToggle
            value={responsesViewMode}
            onChange={(v) => setResponsesViewMode(v as any)}
            options={[
              { value: "table", label: "Table", icon: "fas fa-table" },
              { value: "grid", label: "Grid", icon: "fas fa-th" },
            ]}
            count={responses.length}
            countLabel="responses"
          />

          {responsesViewMode === "table" ? (
            <ContentCard title="All Responses">
              <DataTable data={responses} columns={responsesColumns} />
            </ContentCard>
          ) : (
            <DataGrid data={responses} renderCard={renderResponseCard} columns={4} />
          )}
        </div>
      )}
    </div>
  );
}

