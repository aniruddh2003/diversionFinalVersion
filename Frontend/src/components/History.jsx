import React, { useState } from "react";
import styles from "../style";

// const data = {
//   Incoming: [
//     { id: 1, description: "Message 1", status: "Unread" },
//     { id: 2, description: "Message 2", status: "Read" },
//     // Add more inbox messages as needed
//   ],
//   Outgoing: [
//     { id: 1, description: "Sent Message 1", status: "Sent" },
//     { id: 2, description: "Sent Message 2", status: "Delivered" },
//   ],
// };



const History = () => {
  const [tabValue, setTabValue] = useState(0);
  // const [sectabValue, setsecTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="pt-8">
      <h2 className={styles.heading2}>Activities</h2>
      <div className="max-w-screen-md mx-auto mt-8 bg-transparent bg-opacity-25 p-4 rounded-md glass shadow-md">
        <div className="flex items-center w-full justify-center mb-4">
          <button
            className={`py-2 px-4 rounded-tl-md w-full ${
              tabValue === 0 ? "bg-[#33bbcf] text-white" : "bg-gray-300"
            }`}
            onClick={() => setTabValue(0)}
          >
            Incoming
          </button>
          <button
            className={`py-2 px-4 rounded-tr-md w-full ${
              tabValue === 1 ? "bg-[#33bbcf]  text-white" : "bg-gray-300"
            }`}
            onClick={() => setTabValue(1)}
          >
            Outgoing
          </button>
        </div>
        {/* <div>
          {tabValue === 0 && <IncomingCards />}
          {tabValue === 1 && <OutgoingCards />}
        </div> */}
      </div>
    </div>
  );
};

export default History;
