// FinalPage.js
import React, { useEffect, useState } from "react";
import config from "./config";
import "./FinalPage.css";
import io from "socket.io-client";
import { handleAuthError } from "./authUtils";
import { useNavigate } from "react-router-dom";

function FinalPage() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [folder, setFolder] = useState("inbox");
  const [isSyncing, setIsSyncing] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("Attempting to connect to Socket.io server...");
    const newSocket = io(
      "http://ec2-52-59-239-96.eu-central-1.compute.amazonaws.com:4000",
      {
        // Ensure this URL is correct
        query: { userId: sessionStorage.getItem("localUserId") }, // Replace with actual user ID
      }
    );
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    newSocket.on("emailProcessingStarted", () => {
      console.log("emailProcessingStarted event received");
      setIsSyncing(true);
      startPolling();
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchEmails(folder, currentPage);
  }, [folder, currentPage]);

  const fetchEmails = async (folder, page) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/email/all?filter=${folder}&page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );
      console.log(response);
      if (await handleAuthError(response, navigate)) return;

      const data = await response.json();

      setEmails(data.data.emails);
      setCurrentPage(data.data.pagination.currentPage);
      setTotalPages(data.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const startPolling = () => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/sync/process-status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
            },
          }
        );

        if (await handleAuthError(response, navigate)) return;

        const data = await response.json();
        if (!data.data.isSyncing) {
          clearInterval(intervalId);
          setIsSyncing(false);
          fetchEmails(folder, currentPage);
        }
      } catch (error) {
        console.error("Error fetching process status:", error);
      }
    }, 1000);
  };

  const handleFolderClick = (folder) => {
    setFolder(folder);
    setCurrentPage(1);
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="final-page">
      {isSyncing && <div className="syncing-popup">Syncing in progress...</div>}
      <div className="folder-list">
        <ul>
          <li onClick={() => handleFolderClick("inbox")}>Inbox</li>
          <li onClick={() => handleFolderClick("junkEmail")}>Junk Email</li>
          <li onClick={() => handleFolderClick("drafts")}>Drafts</li>
          <li onClick={() => handleFolderClick("sentItems")}>Sent Items</li>
          <li onClick={() => handleFolderClick("archive")}>Archive</li>
        </ul>
      </div>
      <div className="email-list">
        <ul>
          {emails.map((email) => (
            <li key={email.id} onClick={() => handleEmailClick(email)}>
              {email.subject}
            </li>
          ))}
        </ul>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              disabled={currentPage === index + 1}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="email-detail">
        {selectedEmail ? (
          <div>
            <h2>{selectedEmail.subject}</h2>
            {/<[a-z][\s\S]*>/i.test(selectedEmail.body) ? (
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
            ) : (
              <p>{selectedEmail.body}</p>
            )}
          </div>
        ) : (
          <p>Select an email to view details</p>
        )}
      </div>
    </div>
  );
}

export default FinalPage;
