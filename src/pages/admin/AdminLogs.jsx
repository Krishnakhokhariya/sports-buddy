import React, { useEffect, useState } from "react";
import { getAllLogs } from "../../utils/logs";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedAction, setSelectedAction] = useState("all");
  const [usersMap, setUsersMap] = useState({}); 

  
  async function loadUsers() {
    const snap = await getDocs(collection(db, "users"));
    const map = {};
    snap.forEach((doc) => {
      map[doc.id] = doc.data().displayName || doc.data().email || doc.id;
    });
    setUsersMap(map);
  }

  useEffect(() => {
    async function load() {
      const allLogs = await getAllLogs();
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      loadUsers(); 
    }
    load();
  }, []);


  useEffect(() => {
    if (selectedAction === "all") {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(
        logs.filter((l) => l.action?.toLowerCase().includes(selectedAction))
      );
    }
  }, [selectedAction, logs]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow w-full">
      <h2 className="text-xl font-semibold mb-4">System Logs</h2>

      <div className="mb-4 flex gap-2 items-center">
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
            {filteredLogs.map((l) => (
              <tr key={l.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2">
                  {l.timestamp
                    ? new Date(l.timestamp.seconds * 1000).toLocaleString()
                    : "-"}
                </td>

                <td className="px-4 py-2">{l.action}</td>

                <td className="px-4 py-2">
                  {usersMap[l.actorUid] || l.actorUid}
                </td>

                <td className="px-4 py-2">
                  {l.details?.name ||
                    l.details?.title ||
                    l.details?.email ||
                    l.details?.area ||
                    l.details?.city ||
                    "-"}
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-gray-500"
                >
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
