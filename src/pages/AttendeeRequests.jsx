import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  getEventAttendeeRequests,
  acceptAttendeeRequest,
  rejectAttendeeRequest,
} from "../utils/events";
import {
  getMutualSportInterests,
  checkCityMatch,
  checkstarMatch,
  hasEventSportInterest,
} from "../utils/attendeeMatching";

function AttendeeRequests() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [event, setEvent] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [activeTab, setActiveTab] = useState("starMatch");
  const [categorizedAttendees, setCategorizedAttendees] = useState({
    starMatch: [],
    mutualSports: [],
    cityMatch: [],
    notMatched: [],
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
          alert("Event not found!");
          navigate("/dashboard");
          return;
        }

        const eventData = { id: eventSnap.id, ...eventSnap.data() };
        setEvent(eventData);

        if (eventData.createdBy !== profile?.uid && profile?.role !== "admin") {
          alert("You don't have permission to view this page!");
          navigate(`/events/${eventId}`);
          return;
        }

        if (eventData.createdBy) {
          const creatorRef = doc(db, "users", eventData.createdBy);
          const creatorSnap = await getDoc(creatorRef);
          if (creatorSnap.exists()) {
            setCreatorProfile({ uid: creatorSnap.id, ...creatorSnap.data() });
          }
        }
      } catch (err) {
        console.error("Error loading event:", err);
        alert("Error loading event");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (profile && eventId) {
      loadEvent();
    }
  }, [eventId, profile, navigate]);

  useEffect(() => {
    async function loadAttendees() {
      if (!event?.id) return;

      try {
        const attendeeRequests = await getEventAttendeeRequests(event.id);

        const attendeesWithProfiles = [];
        for (const request of attendeeRequests) {
          try {
            const userRef = doc(db, "users", request.id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              attendeesWithProfiles.push({
                ...request,
                userProfile: { uid: userSnap.id, ...userSnap.data() },
              });
            }
          } catch (err) {
            console.error(`Error loading profile for ${request.id}:`, err);
          }
        }

        setAttendees(attendeesWithProfiles);
      } catch (err) {
        console.error("Error loading attendees:", err);
      }
    }

    loadAttendees();
  }, [event?.id]);

  useEffect(() => {
    if (attendees.length === 0 || !event) {
      setCategorizedAttendees({
        starMatch: [],
        mutualSports: [],
        cityMatch: [],
        notMatched: [],
      });
      return;
    }

    const eventSport = event.sport || "";
    const eventCity = event.city || "";

    const starMatch = [];
    const mutualSports = [];
    const cityMatch = [];
    const notMatched = [];

    attendees.forEach((attendee) => {
      const attendeeProfile = attendee.userProfile || {};
      const attendeeSports = attendeeProfile.sports || [];
      const attendeeCity = attendeeProfile.city || "";

      const isstarMatch = checkstarMatch(
        eventSport,
        eventCity,
        attendeeSports,
        attendeeCity
      );

      const hasEventSport = hasEventSportInterest(eventSport, attendeeSports);

      const hasCityMatch = checkCityMatch(eventCity, attendeeCity);

      let addedToAny = false;

      // Start Match: must match BOTH sport AND city
      if (isstarMatch) {
        starMatch.push(attendee);
        addedToAny = true;
      }

      // Mutual Sport Interests: matches sport
      if (hasEventSport) {
        mutualSports.push(attendee);
        addedToAny = true;
      }

      // Nearest City: matches city
      if (hasCityMatch) {
        cityMatch.push(attendee);
        addedToAny = true;
      }

      if (!hasEventSport && !hasCityMatch) {
        notMatched.push(attendee);
      }
    });

    setCategorizedAttendees({
      starMatch,
      mutualSports,
      cityMatch,
      notMatched,
    });
  }, [attendees, event]);

  useEffect(() => {
    setFilteredAttendees(categorizedAttendees[activeTab] || []);
  }, [activeTab, categorizedAttendees]);

  async function handleAccept(attendeeId) {
    if (!window.confirm("Accept this attendee request?")) return;

    setProcessing(attendeeId);
    try {
      await acceptAttendeeRequest(event.id, attendeeId, profile, event.title);

      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendeeId
            ? { ...a, status: "accepted", acceptedAt: new Date() }
            : a
        )
      );

      alert("Request accepted successfully!");
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Error accepting request");
    } finally {
      setProcessing(null);
    }
  }

  // async function handleReject(attendeeId) {
  //   if (!window.confirm("Reject this attendee request?")) return;

  //   setProcessing(attendeeId);
  //   try {
  //     await rejectAttendeeRequest(event.id, attendeeId, profile, event.title);

  //     setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
  //     setFilteredAttendees((prev) => prev.filter((a) => a.id !== attendeeId));

  //     alert("Request rejected");
  //   } catch (err) {
  //     console.error("Error rejecting request:", err);
  //     alert("Error rejecting request");
  //   } finally {
  //     setProcessing(null);
  //   }
  // }
  async function handleReject(attendeeId) {
    const attendee = attendees.find((a) => a.id === attendeeId);

    const confirmText =
      attendee?.status === "accepted"
        ? "Remove this attendee from the event? They will be notified."
        : "Reject this attendee request?";

    if (!window.confirm(confirmText)) return;

    setProcessing(attendeeId);
    try {
      await rejectAttendeeRequest(event.id, attendeeId, profile, event.title);

      setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
      setFilteredAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Error rejecting request");
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return <p className="text-center mt-8">Loading...</p>;
  }

  if (!event) {
    return <p className="text-center mt-8">Event not found</p>;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-xl shadow-md p-4 md:p-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:underline text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Attendee Requests
          </h1>
          <p className="text-gray-600 mb-2">
            Review and manage attendee requests for your event
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Event: {event.title}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Sport: {event.sport || "N/A"}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              City: {event.city || "N/A"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto no-scrollbar">
              <nav
                className="flex -mb-px whitespace-nowrap min-w-max"
                role="tablist"
                aria-label="Attendee categories"
              >
                <button
                  onClick={() => setActiveTab("starMatch")}
                  className={`p-3 text-sm font-medium ${
                    activeTab === "starMatch"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Star Matches ({categorizedAttendees.starMatch.length})
                </button>
                <button
                  onClick={() => setActiveTab("mutualSports")}
                  className={`p-3 text-sm font-medium ${
                    activeTab === "mutualSports"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Sports Matches ({categorizedAttendees.mutualSports.length})
                </button>
                <button
                  onClick={() => setActiveTab("cityMatch")}
                  className={`p-3 text-sm font-medium ${
                    activeTab === "cityMatch"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  City Matches ({categorizedAttendees.cityMatch.length})
                </button>
                <button
                  onClick={() => setActiveTab("notMatched")}
                  className={`p-3 text-sm font-medium ${
                    activeTab === "notMatched"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Not Matched ({categorizedAttendees.notMatched.length})
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          {filteredAttendees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">
                No attendees found in this category.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Attendees will appear here once they match the criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredAttendees.map((attendee) => {
                const userProfile = attendee.userProfile || {};
                const eventSport = event?.sport || "";
                const eventCity = event?.city || "";
                const attendeeSports = userProfile.sports || [];
                const attendeeCity = userProfile.city || "";

                const hasEventSport = hasEventSportInterest(
                  eventSport,
                  attendeeSports
                );
                const isCityMatch = checkCityMatch(eventCity, attendeeCity);
                const isstarMatch = checkstarMatch(
                  eventSport,
                  eventCity,
                  attendeeSports,
                  attendeeCity
                );

                return (
                  <div
                    key={attendee.id}
                    className="border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-lg transition-all duration-200 bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900">
                            {userProfile.name ||
                              attendee.displayName ||
                              "Anonymous"}
                          </h3>

                          <div className="flex gap-2 ml-2">
                            {isstarMatch && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                Star Match
                              </span>
                            )}
                            {hasEventSport && !isstarMatch && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                Sport Match
                              </span>
                            )}
                            {isCityMatch && !isstarMatch && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                City Match
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
                              Email:
                            </span>
                            <span className="text-gray-600 break-all">
                              {userProfile.email || attendee.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
                              City:
                            </span>
                            <span className="text-gray-600 flex items-center gap-2">
                              {userProfile.city || "N/A"}
                              {isCityMatch && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  Matches Event City
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
                              Area:
                            </span>
                            <span className="text-gray-600">
                              {userProfile.area || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
                              Skill:
                            </span>
                            <span className="text-gray-600">
                              {userProfile.skill || "N/A"}
                            </span>
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <span className="font-semibold text-gray-700">
                              Sport Interests:
                            </span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {attendeeSports.length > 0 ? (
                                attendeeSports.map((sport, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      sport.toLowerCase() ===
                                      eventSport?.toLowerCase()
                                        ? "bg-green-100 text-green-800 border-2 border-green-300"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {sport}
                                    {/* {sport.toLowerCase() === eventSport?.toLowerCase() && (
                                      <span className="ml-1">✓</span>
                                    )} */}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  No sports selected
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
                              Status:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                attendee.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {attendee.status === "accepted"
                                ? "Accepted"
                                : "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20 flex-shrink-0">
                              Requested:
                            </span>
                            <span className="text-gray-600 text-xs">
                              {attendee.requestedAt
                                ? new Date(
                                    attendee.requestedAt.seconds * 1000
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {attendee.status !== "accepted" && (
                        <div className="flex flex-row md:flex-col gap-2 md:w-32 flex-shrink-0">
                          <button
                            onClick={() => handleAccept(attendee.id)}
                            disabled={processing === attendee.id}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            {processing === attendee.id
                              ? "Processing..."
                              : "Accept"}
                          </button>
                          <button
                            onClick={() => handleReject(attendee.id)}
                            disabled={processing === attendee.id}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm hover:shadow-md"
                          >
                            {processing === attendee.id
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </div>
                      )}
                      {/* {attendee.status === "accepted" && (
                        <div className="flex items-center justify-center md:w-32 h-10 px-4 bg-green-50 text-green-800 rounded-lg font-semibold text-sm">
                          Accepted
                        </div>
                      )} */}
                      {attendee.status === "accepted" && (
                        <div className="flex flex-row md:flex-col gap-2 md:w-32">
                          <div className="flex items-center justify-center h-10 px-4 bg-green-50 text-green-800 rounded-lg font-semibold text-sm">
                            Accepted
                          </div>

                          <button
                            onClick={() => handleReject(attendee.id)}
                            disabled={processing === attendee.id}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 
                 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors
                 shadow-sm hover:shadow-md"
                          >
                            {processing === attendee.id
                              ? "Processing..."
                              : "Remove"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendeeRequests;
