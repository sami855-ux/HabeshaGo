// "use client";

// import {
//   MapPin,
//   Calendar,
//   Activity,
//   Clock,
//   DollarSign,
// } from "lucide-react";
// import { Button } from "../../../components/ui/button";

// import { useDispatch, useSelector } from "react-redux";
// import { useEffect } from "react";

// import {
//   fetchActiveSessions,
//   fetchMyReservations,
//   fetchMySessions,
//   fetchParkingLots,
// } from "@/store/slices/parkingSlice";

// interface UserHomeProps {
//   onNavigate?: (path: string) => void;
// }

// export default function UserHome({ onNavigate }: UserHomeProps) {
//   const dispatch = useDispatch<any>();

//   const { sessions = [], reservations = [], lots = [] } = useSelector(
//     (state: any) => state.parking || {}
//   );

//   useEffect(() => {
//     dispatch(fetchActiveSessions());
//     dispatch(fetchMyReservations());
//     dispatch(fetchMySessions());
//     dispatch(fetchParkingLots());
//   }, [dispatch]);

//   // SAFE ACTIVE SESSION
//   const activeSession =
//     sessions?.find((s: any) => s?.status === "ACTIVE") || null;

//   const stats = {
//     activeSession,
//     upcomingReservations: Array.isArray(reservations)
//       ? reservations.length
//       : 0,
//     totalSessions: Array.isArray(sessions) ? sessions.length : 0,
//     totalSpent: Array.isArray(sessions)
//       ? sessions.reduce((acc: number, s: any) => acc + (s?.cost || 0), 0)
//       : 0,
//   };

//   // SAFE LOT MAPPING (prevents object rendering issues)
//   const nearbyLots =
//     Array.isArray(lots)
//       ? lots.slice(0, 3).map((lot: any) => ({
//           id: lot?.id,
//           name: lot?.name || lot?.location || "Parking Lot",
//           distance: typeof lot?.distance === "string" ? lot.distance : "—",
//           available:
//             typeof lot?.availableSpots === "number"
//               ? lot.availableSpots
//               : lot?.slots?.filter((s: any) => s?.status === "AVAILABLE")
//                   ?.length || 0,
//           total:
//             typeof lot?.totalSpots === "number"
//               ? lot.totalSpots
//               : Array.isArray(lot?.slots)
//               ? lot.slots.length
//               : 0,
//         }))
//       : [];

//   return (
//     <div className="space-y-6">
//       {/* Welcome */}
//       <div>
//         <h2 className="text-2xl font-bold">Welcome Back!</h2>
//         <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
//           Find and book your parking spot easily
//         </p>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Button
//           onClick={() => onNavigate?.("parking-manager/parking-lots")}
//           className="h-24 bg-blue-600 hover:bg-blue-700 text-white justify-start px-6"
//         >
//           <MapPin className="h-8 w-8 mr-4" />
//           <div className="text-left">
//             <p className="font-bold text-lg">Find Parking</p>
//             <p className="text-sm text-blue-100">Search nearby parking lots</p>
//           </div>
//         </Button>

//         <Button
//           onClick={() => onNavigate?.("parking-manager/My-Reservations")}
//           className="h-24 bg-green-600 hover:bg-green-700 text-white justify-start px-6"
//         >
//           <Calendar className="h-8 w-8 mr-4" />
//           <div className="text-left">
//             <p className="font-bold text-lg">My Reservations</p>
//             <p className="text-sm text-green-100">
//               {stats.upcomingReservations} upcoming
//             </p>
//           </div>
//         </Button>
//       </div>

//       {/* Active Session */}
//       {stats.activeSession && (
//         <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
//                 <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
//               </div>

//               <div>
//                 <p className="font-semibold text-lg">
//                   Active Parking Session
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   {stats.activeSession?.parkingLot?.name ||
//                     "Parking Lot"}{" "}
//                   - Slot {stats.activeSession?.slotNumber || "—"}
//                 </p>
//               </div>
//             </div>

//             <Button
//               onClick={() =>
//                 onNavigate?.("/parking-manager/active-sessions")
//               }
//             >
//               View Details
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
//           <p className="text-sm text-gray-500">Reservations</p>
//           <h3 className="text-2xl font-bold">{stats.upcomingReservations}</h3>
//         </div>

//         <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
//           <p className="text-sm text-gray-500">Total Sessions</p>
//           <h3 className="text-2xl font-bold">{stats.totalSessions}</h3>
//         </div>

//         <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
//           <p className="text-sm text-gray-500">Total Spent</p>
//           <h3 className="text-2xl font-bold">
//             ${Number(stats.totalSpent).toFixed(2)}
//           </h3>
//         </div>

//         <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
//           <p className="text-sm text-gray-500">Avg Duration</p>
//           <h3 className="text-2xl font-bold">3.2h</h3>
//         </div>
//       </div>

//       {/* Nearby Lots */}
//       <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
//         <div className="flex justify-between mb-4">
//           <h3 className="text-lg font-semibold">Nearby Parking Lots</h3>
//         </div>

//         <div className="space-y-3">
//           {nearbyLots.map((lot: any) => (
//             <div
//               key={lot.id}
//               className="flex justify-between p-4 border rounded-lg"
//             >
//               <div className="flex items-center gap-3">
//                 <MapPin className="h-5 w-5 text-blue-500" />
//                 <div>
//                   <p className="font-semibold">{lot.name}</p>
//                   <p className="text-sm text-gray-500">
//                     {lot.distance} away
//                   </p>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <p className="font-semibold text-green-600">
//                   {lot.available} available
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   of {lot.total} spots
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }