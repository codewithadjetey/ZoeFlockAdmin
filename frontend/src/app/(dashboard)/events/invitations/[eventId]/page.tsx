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
import { EntitiesService } from "@/services/entities";
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
    loadEntities();
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

  const loadEntities = async () => {
    try {
      const response = await EntitiesService.getEntities('families,members', true);
      if (response.success && response.data) {
        setFamilies(response.data.families || []);
        setMembers(response.data.members || []);
      }
    } catch (error) {
      console.error("Error loading entities:", error);
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
      key: "member",
      label: "Member",
      render: (value: any) => (
        <div>
          <div className="font-medium">{value.name}</div>
          <div className="text-sm text-gray-500">{value.email}</div>
        </div>
      ),
    },
    {
      key: "clicks",
      label: "Clicks",
    },
    {
      key: "responses",
      label: "Responses",
    },
    {
      key: "total_guests",
      label: "Total Guests",
    },
    {
      key: "confirmed_guests",
      label: "Confirmed",
    },
    {
      key: "is_active",
      label: "Status",
      render: (value: boolean) => (
        <StatusBadge status={value ? "active" : "inactive"} />
      ),
    },
    {
      key: "id",
      label: "Actions",
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
      key: "guest_name",
      label: "Guest Name",
    },
    {
      key: "guest_email",
      label: "Email",
      render: (value: string | null) => value || "N/A",
    },
    {
      key: "guest_phone",
      label: "Phone",
      render: (value: string | null) => value || "N/A",
    },
    {
      key: "number_of_guests",
      label: "Guests",
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "invited_by",
      label: "Invited By",
      render: (value: any) => value?.name || "Unknown",
    },
    {
      key: "id",
      label: "Actions",
      render: (value: number, row: any) => (
        <SelectInput
          value={row.status}
          onChange={(status) =>
            handleUpdateResponseStatus(
              value,
              status as "pending" | "confirmed" | "declined" | "attended"
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
        <StatusBadge status={invitation.is_active ? "active" : "inactive"} />
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
        <StatusBadge status={response.status} />
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
          onChange={(status) =>
            handleUpdateResponseStatus(
              response.id,
              status as "pending" | "confirmed" | "declined" | "attended"
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
    { id: "overview", label: "Overview", icon: "fas fa-chart-pie" },
    { id: "invitations", label: "Invitations", icon: "fas fa-envelope" },
    { id: "responses", label: "Responses", icon: "fas fa-reply-all" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Event Invitations: ${event.title}`}
        description="Manage and track event invitations"
      />

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        orientation="horizontal"
      />

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Invitations"
              value={analytics.summary.total_invitations}
              description="Sent"
              icon="fas fa-envelope"
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100 dark:bg-blue-900"
            />
            <StatCard
              title="Total Clicks"
              value={analytics.summary.total_clicks}
              description={`${analytics.summary.click_through_rate}% CTR`}
              icon="fas fa-mouse-pointer"
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100 dark:bg-purple-900"
            />
            <StatCard
              title="Total Responses"
              value={analytics.summary.total_responses}
              description={`${analytics.summary.response_rate}% Response Rate`}
              icon="fas fa-check-circle"
              iconColor="text-green-600"
              iconBgColor="bg-green-100 dark:bg-green-900"
            />
            <StatCard
              title="Confirmed Guests"
              value={analytics.summary.confirmed_guests}
              description={`of ${analytics.summary.total_guests} total`}
              icon="fas fa-users"
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100 dark:bg-indigo-900"
            />
          </div>

          {/* Responses Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Confirmed"
                value={analytics.responses_breakdown.confirmed}
                description="Guests confirmed"
                icon="fas fa-check-circle"
                iconColor="text-green-600"
                iconBgColor="bg-green-100 dark:bg-green-900"
              />
              <StatCard
                title="Declined"
                value={analytics.responses_breakdown.declined}
                description="Guests declined"
                icon="fas fa-times-circle"
                iconColor="text-red-600"
                iconBgColor="bg-red-100 dark:bg-red-900"
              />
              <StatCard
                title="Pending"
                value={analytics.responses_breakdown.pending}
                description="Awaiting response"
                icon="fas fa-clock"
                iconColor="text-yellow-600"
                iconBgColor="bg-yellow-100 dark:bg-yellow-900"
              />
              <StatCard
                title="Attended"
                value={analytics.responses_breakdown.attended}
                description="Actually attended"
                icon="fas fa-user-check"
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100 dark:bg-blue-900"
              />
            </div>

          {/* Top Performers */}
          {analytics.top_performers.length > 0 && (
              <DataTable
                data={analytics.top_performers}
                columns={[
                  { key: "member_name", label: "Member" },
                  { key: "clicks", label: "Clicks" },
                  { key: "responses", label: "Responses" },
                  { key: "guests", label: "Guests" },
                  { key: "confirmed_guests", label: "Confirmed" },
                ]}
              />
          )}

          {/* Filters */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onChange={(value) => setFilterId(parseInt(value))}
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
                  onChange={(value) => setFilterId(parseInt(value))}
                  options={[
                    { value: "", label: "Select a member" },
                    ...members.map((m) => ({
                      value: m.id.toString(),
                      label: m.name,
                    })),
                  ]}
                />
              )}
            </div> */}
        </div>
      )}

      {activeTab === "invitations" && (
        <div className="space-y-6">
          {/* Create Invitations */}
          <ContentCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Invitations</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectInput
                  label="Create For"
                  value={createType}
                  onChange={(value) => setCreateType(value as any)}
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
                    onChange={(value) => setSelectedFamily(parseInt(value))}
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
                <DataTable data={analytics.invitations} columns={invitationsColumns} />
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
              <DataTable data={responses} columns={responsesColumns} />
          ) : (
            <DataGrid data={responses} renderCard={renderResponseCard} columns={4} />
          )}
        </div>
      )}
    </div>
  );
}

