import React, { useEffect, useState } from "react";
import { getAllLogs } from "../../utils/logs";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function AdminLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedAction, setSelectedAction] = useState("all");
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    async function loadUsers() {
      const snap = await getDocs(collection(db, "users"));
      const map = {};
      snap.forEach((doc) => {
        map[doc.id] = doc.data().displayName || doc.data().email || doc.id;
      });
      setUsersMap(map);
    }

    async function loadLogs() {
      const allLogs = await getAllLogs();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      loadUsers();
    }

    loadLogs();
  }, []);

  useEffect(() => {
    if (selectedAction === "all") {
      setFilteredLogs(logs);
    }
    // } else if (selectedAction === "join") {
    //   setFilteredLogs(
    //     logs.filter((l) => l.action?.toLowerCase().includes("join"))
    //   );
    // } else if (selectedAction === "leave") {
    //   setFilteredLogs(
    //     logs.filter((l) => l.action?.toLowerCase().includes("leave"))
    //   );
    // } 
    else {
      setFilteredLogs(
        logs.filter((l) => l.action?.toLowerCase().includes(selectedAction))
      );
    }
  }, [selectedAction, logs]);

  function getActionColor(action) {
    if (!action) return "";

    action = action.toLowerCase();
    if (action.includes("delete")) return "text-red-600 font-semibold";
    if (action.includes("create")) return "text-green-600 font-semibold";
    if (action.includes("update")) return "text-yellow-600 font-semibold";
    if (action.includes("login")) return "text-blue-600 font-semibold";
    // if (action.includes("join")) return "text-purple-600 font-semibold";
    // if (action.includes("leave")) return "text-orange-600 font-semibold";
    return "text-gray-700";
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow w-full max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-blue-600 hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> Back
      </button>

      <h2 className="text-xl text-center font-semibold mb-4">System Logs</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <label htmlFor="filter" className="font-medium">
          Filter by action:
        </label>
        <select
          id="filter"
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="login">Login</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          {/* <option value="join">Join Event</option>
          <option value="leave">Leave Event</option> */}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="px-4 py-2 font-medium">Timestamp</th>
              <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((l) => (
                <tr key={l.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-4 py-2 ">
                    <span
                      className={` px-2 py-1 rounded text-xs  ${getActionColor(
                        l.action
                      )} bg-gray-100`}
                    >
                      {l.timestamp
                        ? new Date(l.timestamp.seconds * 1000).toLocaleString()
                        : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={` px-2 py-1 rounded text-xs  ${getActionColor(
                        l.action
                      )} bg-gray-100`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={` px-2 py-1 rounded text-xs  ${getActionColor(
                        l.action
                      )} bg-gray-100`}
                    >
                      {usersMap[l.actorUid] || l.actorUid}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={` px-2 py-1 rounded text-xs  ${getActionColor(
                        l.action
                      )} bg-gray-100`}
                    >
                      {l.details?.eventTitle
                        ? `Event: ${l.details.eventTitle}`
                        : l.details?.name ||
                          l.details?.title ||
                          l.details?.email ||
                          l.details?.area ||
                          l.details?.city ||
                          "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLogs;
