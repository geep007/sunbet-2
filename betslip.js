function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// First, let's update the modal HTML with enhanced styling
const modalHtml = `
<div id="providerDetailsModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6);">
  <div class="modal-content" style="background-color: #1c2431; margin: 10% auto; padding: 25px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); width: 90%; max-width: 500px; position: relative; color: #fff; border: 1px solid #3e4758;">
    <span class="close" style="color: #aaa; position: absolute; top: 15px; right: 20px; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
    <h2 id="modalTitle" style="margin-top: 0; color: #f8f8f8; margin-bottom: 20px; font-size: 22px; border-bottom: 1px solid #3e4758; padding-bottom: 15px;">Betslip Details</h2>
    <div id="modalContent" style="margin-top: 20px;">
      <!-- Loading spinner -->
      <div id="loading" style="text-align: center; padding: 30px;">
        <div class="spinner" style="border: 4px solid #3e4758; border-top: 4px solid #f5a623; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 15px; color: #ccc;">Loading betslip details...</p>
      </div>
      <!-- Content will be populated here -->
      <div id="betslipDetails" style="display: none; font-family: Arial, sans-serif;">
        <!-- Betslip details will be inserted here -->
      </div>
    </div>
  </div>
</div>
<style>
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .betslip-details p {
    margin: 8px 0;
    padding: 8px 12px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.05);
  }
  .betslip-details p:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.03);
  }
  .betslip-details p b {
    display: inline-block;
    width: 130px;
    color: #aaa;
  }
  .betslip-details .bet-header {
    font-size: 18px;
    font-weight: bold;
    color: #f5a623;
    text-align: center;
    background-color: transparent !important;
    margin-bottom: 15px;
  }
  .copy-button {
    cursor: pointer;
    opacity: 0.8;
    transition: all 0.3s;
  }
  .copy-button:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  .action-buttons {
    display: flex;
    justify-content: center;
    margin-top: 25px; 
    gap: 15px;
  }
  .action-button {
    background-color: #f5a623;
    color: #1c2431;
    padding: 10px 18px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  .action-button:hover {
    background-color: #ffb340;
    transform: translateY(-2px);
  }
</style>`;

function updateBetslips(betslips) {
  // Get the container
  const container = document.querySelector(
    ".withdrawal-history-wrapper.is-betslip"
  );

  // Get the first row (non-header) as template
  const templateRow = document.querySelector(
    ".withdrawal-info-row-grid.is-betslip:not(.is-heading)"
  );

  // Remove any existing data rows
  const existingRows = document.querySelectorAll(
    ".withdrawal-info-row-grid.is-betslip:not(.is-heading)"
  );
  existingRows.forEach((row, index) => {
    if (index > 0) {
      // Keep the first row as template
      row.remove();
    }
  });

  // Update and/or create rows for each betslip
  betslips.forEach((betslip, index) => {
    let row;
    if (index === 0) {
      // Use the existing first row
      row = templateRow;
    } else {
      // Clone the template for additional rows
      row = templateRow.cloneNode(true);
      container.appendChild(row);
    }

    // Update row content
    const dateTime = row.querySelector('[id*="date-time"]');
    const provider = row.querySelector('[id*="provider"]');
    const game = row.querySelector('[id*="game"]');
    const stake = row.querySelector('[id*="stake"]');
    const win = row.querySelector('[id*="win"]');
    const betslipLink = row.querySelector('[id*="betslip"]');

    if (dateTime) dateTime.textContent = formatDate(betslip.transactionDate);
    if (provider)
      provider.textContent = betslip.details.providerName || "Unknown";
    if (game) game.textContent = betslip.description || "N/A";
    if (stake) stake.textContent = betslip.amount || "0";
    if (win) win.textContent = "0";

    if (betslipLink) {
      betslipLink.textContent = "VIEW";
      betslipLink.setAttribute("data-betslip-id", betslip.id);
      betslipLink.setAttribute("data-remote-id", betslip.remoteReference);
    }
  });

  setupViewButtons();
}

function initializeModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById("providerDetailsModal")) {
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Set up modal close button
    const modal = document.getElementById("providerDetailsModal");
    const closeBtn = modal.querySelector(".close");

    closeBtn.onclick = function () {
      modal.style.display = "none";
    };

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
}

function loadBetslips(startDate, endDate) {
  // Convert dates to ISO string format
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  // Set time to start of day for start date and end of day for end date
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const queryOptions = {
    startdate: start.toISOString(),
    enddate: end.toISOString(),
    sort: "desc",
    type: ["Stake", "Debit", "Win"],
    take: 10,
  };

  simlBC.getWalletTrxs(queryOptions, (err, data) => {
    if (err) {
      console.error("Error fetching betslips:", err);
      return;
    }

    if (data && data.items && !err) {
      console.log(`Displaying ${data.items.length} betslips`);
      updateBetslips(data.items);
      setupViewButtons();
    }
  });
}

// Initialize date pickers and handle changes
document.addEventListener("DOMContentLoaded", () => {
  // Add the modal HTML to the document
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Set up modal close button
  const modal = document.getElementById("providerDetailsModal");
  const closeBtn = modal.querySelector(".close");

  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  initializeModal();

  // Initialize date pickers and load betslips
  let fromDate = "";
  let toDate = "";

  const fromDateInput = document.querySelector("#Date");
  const toDateInput = document.querySelector("#Date-2");

  $(fromDateInput).datepicker({
    format: "mm-dd-yyyy",
    pick: function (e) {
      fromDate = $(this).datepicker("getDate");
      console.log("From Date selected:", fromDate);

      if (fromDate && toDate) {
        loadBetslips(fromDate, toDate);
      }
    },
  });

  $(toDateInput).datepicker({
    format: "mm-dd-yyyy",
    pick: function (e) {
      toDate = $(this).datepicker("getDate");
      console.log("To Date selected:", toDate);

      if (fromDate && toDate) {
        loadBetslips(fromDate, toDate);
      }
    },
  });
});

function setupViewButtons() {
  document.querySelectorAll(".is-betslip-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const betslipId = e.target.getAttribute("data-betslip-id");
      const remoteId = e.target.getAttribute("data-remote-id");
      console.log("View betslip clicked:", betslipId, remoteId);

      // Show the modal
      const modal = document.getElementById("providerDetailsModal");
      const loading = document.getElementById("loading");
      const betslipDetails = document.getElementById("betslipDetails");
      const modalTitle = document.getElementById("modalTitle");

      if (!modal || !loading || !betslipDetails) {
        console.error("Modal elements not found!");
        return;
      }

      // Show loading state
      modal.style.display = "block";
      loading.style.display = "block";
      betslipDetails.style.display = "none";
      modalTitle.textContent = "Betslip Details";

      // First try to find betslip in already loaded data
      let foundBetslip = null;

      // Try to get the transaction from the data we already have
      const container = document.querySelector(
        ".withdrawal-history-wrapper.is-betslip"
      );
      const rows = container.querySelectorAll(
        ".withdrawal-info-row-grid.is-betslip:not(.is-heading)"
      );

      // Find the row containing this betslip
      rows.forEach((row) => {
        const link = row.querySelector(".is-betslip-link");
        if (link && link.getAttribute("data-betslip-id") === betslipId) {
          // Extract data from this row
          const dateTime = row.querySelector('[id*="date-time"]').textContent;
          const provider = row.querySelector('[id*="provider"]').textContent;
          const game = row.querySelector('[id*="game"]').textContent;
          const stake = row.querySelector('[id*="stake"]').textContent;
          const win = row.querySelector('[id*="win"]').textContent;

          foundBetslip = {
            id: betslipId,
            remoteReference: remoteId,
            transactionDate: dateTime,
            details: {
              providerName: provider,
              gameCode: "",
              gameName: game,
            },
            amount: stake,
            description: game,
          };
        }
      });

      if (!foundBetslip) {
        // If not found in current display, make an API call to get all transactions
        // and filter for the one we need
        const queryOptions = {
          startdate: new Date(
            new Date().setMonth(new Date().getMonth() - 3)
          ).toISOString(), // Last 3 months
          enddate: new Date().toISOString(),
          sort: "desc",
          type: ["Stake", "Debit", "Win"],
          take: 100, // Get more to increase chances of finding the betslip
        };

        simlBC.getWalletTrxs(queryOptions, (err, data) => {
          if (err || !data || !data.items) {
            console.error("Error fetching betslips:", err);
            loading.style.display = "none";
            betslipDetails.innerHTML = `
                          <div style="color: #ff5e5e; text-align: center; padding: 30px;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                              </svg>
                              <p style="margin-top: 15px; font-size: 16px;">Betslip details not found.</p>
                          </div>
                      `;
            betslipDetails.style.display = "block";
            return;
          }

          // Find the specific betslip
          foundBetslip = data.items.find(
            (item) => item.id === betslipId || item.remoteReference === remoteId
          );

          if (foundBetslip) {
            displayBetslipDetails(foundBetslip);
          } else {
            loading.style.display = "none";
            betslipDetails.innerHTML = `
                          <div style="color: #ff5e5e; text-align: center; padding: 30px;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                              </svg>
                              <p style="margin-top: 15px; font-size: 16px;">Betslip details not found.</p>
                          </div>
                      `;
            betslipDetails.style.display = "block";
          }
        });
      } else {
        // If found in current display, show it
        displayBetslipDetails(foundBetslip);
      }

      // Function to display betslip details
      function displayBetslipDetails(data) {
        // Hide loading
        loading.style.display = "none";

        console.log("Betslip details:", data);

        // Extract details from the data
        const transactionDate = data.transactionDate;
        const provider = data.details?.providerName || "Unknown";
        const gameCode = data.details?.gameCode || "";
        const gameName =
          data.description || data.details?.gameName || "Unknown";
        const amount = data.amount || 0;

        // Display basic betslip info with improved styling
        betslipDetails.innerHTML = `
                  <div class="betslip-details">
                      <p class="bet-header">SunBet Betslip</p>
                      <p><b>Transaction ID:</b> ${data.id}</p>
                      <p id="WagerIdValue">
                          <b>Wager Id:</b> 
                          <span>${remoteId}</span> 
                          
                      </p>
                      <p><b>Date/time:</b> ${transactionDate}</p>
                      <p><b>Game:</b> ${gameName}</p>
                      <p><b>Provider:</b> ${provider}</p>
                      <p id="licenseNumber"><b>License Number:</b> <span class="loading-text">Loading...</span></p>
                      <p><b>Amount:</b> ${amount}</p>
                      <p><b>Status:</b> ${
                        data.details?.status || "Completed"
                      }</p>
                  </div>
                  <div class="action-buttons">
                      
                      <a href="javascript:void(0)" id="exportPdf" data-id="${
                        data.id
                      }" class="action-button">Export PDF</a>
                  </div>
              `;
        betslipDetails.style.display = "block";

        // Add event listener for the copy Wager Id button
        const copyWagerIdBtn = document.getElementById("copyWagerId");
        if (copyWagerIdBtn) {
          copyWagerIdBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(remoteId);
            copyWagerIdBtn.src = "/content/dam/sunbet/images/check-solid.svg";
            copyWagerIdBtn.style.transition = "0.3s";
            copyWagerIdBtn.style.transform = "scale(1.2)";
            setTimeout(() => {
              copyWagerIdBtn.src =
                "/content/dam/sunbet/images/copy-regular.svg";
              copyWagerIdBtn.style.transform = "scale(1)";
            }, 2000);
          });
        }

        // Add event listener for export PDF button
        const exportPdfBtn = document.getElementById("exportPdf");
        if (exportPdfBtn) {
          exportPdfBtn.addEventListener("click", () => {
            // Pass the betslip ID to the export function
            exportBetslipPDF(data.id);
          });
        }

        // Convert transaction date to ISO format for the API call
        const dateObj = new Date(data.transactionDate);
        const transactionDateISO = isNaN(dateObj.getTime())
          ? new Date().toISOString()
          : dateObj.toISOString();

        // Make immediate API call for license number
        simlBC.getProviderDetails(
          provider,
          transactionDateISO,
          gameCode,
          (err, providerData) => {
            if (err) {
              console.error("Error fetching provider details:", err);
              document.getElementById("licenseNumber").innerHTML =
                "<b>License Number:</b> <span>Not available</span>";

              // Even if provider details fail, save what we have to localStorage
              saveBetslipDataToLocalStorage(
                data,
                "Not available",
                "Not available"
              );
              return;
            }

            console.log("Provider details received:", providerData);
            const licenseNumber =
              providerData?.licenseNumber || "Not available";
            const address =
              providerData?.physical_address ||
              "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni";
            document.getElementById(
              "licenseNumber"
            ).innerHTML = `<b>License Number:</b> <span>${licenseNumber}</span>`;

            // Save to localStorage with the license number
            saveBetslipDataToLocalStorage(data, licenseNumber, address);
          }
        );
        // Add event listener for the "View Detailed Slip" button
        // const viewDetailedSlipBtn = document.getElementById("viewDetailedSlip");
        // if (viewDetailedSlipBtn) {
        //   viewDetailedSlipBtn.addEventListener("click", () => {
        //     // For Kambi providers, try to extract the coupon ID
        //     if (provider.toLowerCase().includes("kambi")) {
        //       // Try to extract a numeric ID from the remote reference
        //       const couponMatch = remoteId.match(/\d+/);
        //       if (couponMatch) {
        //         const couponId = couponMatch[0];
        //         console.log(
        //           "Navigating to detailed view for coupon:",
        //           couponId
        //         );
        //         window.location.href = "/betting/bethistory/" + couponId;
        //       } else {
        //         alert(
        //           "Could not extract coupon ID from reference: " + remoteId
        //         );
        //       }
        //     } else {
        //       alert("Detailed view is only available for Kambi betslips");
        //     }
        //   });
        // }
      }
    });
  });
}

// Add this separate function to handle saving to localStorage
function saveBetslipDataToLocalStorage(data, licenseNumber, address) {
  // Create a betslip object with all the necessary fields
  const betslipData = {
    id: data.id,
    operator: "Sunbet Pty Ltd",
    address: address,
    playerId: data.playerId || "",
    wagerId: data.remoteReference || data.id,
    dateTime: data.transactionDate,
    game: data.description || data.details?.gameName || "",
    provider:
      data.details?.providerName || data.details?.gameEngine || "Unknown",
    licenseNumber: licenseNumber,
    wagerAmount: data.amount || 0,
    wagerType:
      data.details?.category === "Betting" ? "Single (Fixed Odds)" : "Gaming",
    odds: data.details?.odds || "",
  };

  console.log("Saving betslip data to localStorage:", betslipData);
  localStorage.setItem("betslipData", JSON.stringify([betslipData]));
}

// Add this function to initialize the modal when the page loads
function initializeModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById("providerDetailsModal")) {
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Set up modal close button
    const modal = document.getElementById("providerDetailsModal");
    const closeBtn = modal.querySelector(".close");

    closeBtn.onclick = function () {
      modal.style.display = "none";
    };

    // Close the modal when clicking outside of it
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
}

// Add this function to generate and download the PDF
// Update the exportBetslipPDF function to be more robust
function exportBetslipPDF(betslipId) {
  console.log("Starting PDF export for betslip:", betslipId);

  // Try to get betslip data from localStorage first
  let betslipData;
  try {
    betslipData = JSON.parse(localStorage.getItem("betslipData"));
    if (Array.isArray(betslipData)) {
      betslipData = betslipData[0]; // Take the first item if it's an array
    }
    console.log("Found betslip data in localStorage:", betslipData);
  } catch (e) {
    console.error("Error parsing betslip data from localStorage:", e);
    betslipData = null;
  }

  // If we don't have betslip data, try to build it from the current modal content
  if (!betslipData) {
    console.log("Extracting betslip data from modal content");
    betslipData = extractBetslipDataFromModal();
  }

  // If we still don't have data, show an error
  if (!betslipData) {
    alert(
      "Sorry, could not find betslip data for export. Please try viewing the betslip details again."
    );
    return;
  }

  // Get user profile data
  simlBC.getProfile(function (err, profileData) {
    if (err) {
      console.error("Error getting user profile:", err);
      // Proceed with limited user info
      generatePDF(null, betslipData);
      return;
    }

    // Use user profile data and betslip data to create PDF
    generatePDF(profileData, betslipData);
  });
}

// Function to extract betslip data from the modal if localStorage fails
function extractBetslipDataFromModal() {
  const modal = document.getElementById("betslipDetails");
  if (!modal) return null;

  // Try to extract data from the visible modal
  const extractText = (selector) => {
    const el = modal.querySelector(selector);
    if (!el) return "";
    // Extract text after the colon
    const text = el.textContent;
    const colonIndex = text.indexOf(":");
    return colonIndex > -1
      ? text.substring(colonIndex + 1).trim()
      : text.trim();
  };

  return {
    id: extractText("p:nth-child(2)"),
    operator: "Sunbet Pty Ltd",
    address:
      "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni",
    playerId: "", // May not be visible in the modal
    wagerId: extractText("p:nth-child(3)"),
    dateTime: extractText("p:nth-child(4)"),
    game: extractText("p:nth-child(5)"),
    provider: extractText("p:nth-child(6)"),
    licenseNumber: extractText("p:nth-child(7)"),
    wagerAmount: extractText("p:nth-child(8)"),
    wagerType: "Single (Fixed Odds)",
    odds: "",
  };
}

// Function to generate the PDF with the specified format
function generatePDF(profileData, betslipData) {
  // Extract user information
  const firstName = profileData.player.profile.personal.firstName || "";
  const lastName = profileData.player.profile.personal.lastName || "";
  const accountNumber = profileData.player.id || "";

  // Current date for the betslip date
  const currentDate = new Date();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedDate = `${currentDate.getDate()} ${
    months[currentDate.getMonth()]
  } ${currentDate.getFullYear()}`;

  // Create new PDF document
  const doc = new jsPDF();
  const totalPagesExp = "{total_pages_count_string}";

  // Set up auto table with headers, etc.
  doc.autoTable({
    didDrawPage: function (data) {
      // Header
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);

      doc.text("SunBet Account Number: " + accountNumber, 14, 10);
      doc.text("SunBet User Name: " + firstName + " " + lastName, 14, 18);
      doc.text("Betslip Date: " + formattedDate, 14, 26);

      doc.setFontSize(12);

      // Betslip details
      doc.text(
        "Operator: " + (betslipData.operator || "SunBet Pty Ltd"),
        14,
        40
      );
      doc.text(
        "Address: " +
          (betslipData.address ||
            "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni"),
        14,
        46
      );
      doc.text("Player Id: " + (betslipData.playerId || accountNumber), 14, 54);
      doc.text(
        "Betslip Id: " + (betslipData.wagerId || betslipData.id),
        14,
        61
      );
      doc.text("Date & Time: " + (betslipData.dateTime || ""), 14, 70);
      doc.text("Game: " + (betslipData.game || ""), 14, 78);
      doc.text("Provider: " + (betslipData.provider || ""), 14, 86);
      doc.text("License Number: " + (betslipData.licenseNumber || ""), 14, 94);
      doc.text("Amount: " + (betslipData.wagerAmount || ""), 14, 102);
      doc.text(
        "Wager Type: " + (betslipData.wagerType || "Single (Fixed Odds)"),
        14,
        110
      );
      doc.text("Bet Details: " + (betslipData.betDetail || ""), 14, 118);
      doc.text("Odds: " + (betslipData.odds || ""), 14, 126);

      // SunBet logo - base64 encoded image
      const img =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQIADwAPAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAESAlgDASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAcIBQYJBAID/8QAVxAAAQMDAwICBQMOCgcFCQEAAQACAwQFEQYSIQcxE0EIFCJRYTJxtBUWFyM4QlaBhJGSpNHSGCQzN1JUVXbB4yVmkpOhpdM0ZGhy4UNEV2J0lZais9T/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAgMEBQEG/8QAMhEAAgIBAgQDBgYDAQEAAAAAAAECAwQRIQUSMUETUXEUIjIz0fBSYYGRocEVQuFTsf/aAAwDAQACEQMRAD8AuWiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiLz19fQ2+ETV9ZT0kTnbQ+eUMaXYJxknvgH8y8b06g9CLULj1J0lRsm2XB9XLE4t8OCFxLyDg7XEBpHnnOCO2eFgbj1htrNn1Ps9XUZzv8eRsW3tjGN2fP3fjVMsqmPWRYqpvoiTUUL1nV+9uqXupLZbooDjayUPkcOOcuDmg858gsXX9T9W1Mwkhq6eiaG4McFO0tJyefb3HP48cKiXEKV01ZNY82T4ir39kfWf9s/q0P7qfZH1n/bP6tD+6o/5Kryf3+p77NIsIir9D1K1jHMx77oyVrXAmN9NGGuAPY4aDg/AgrM2/rBdmTE19qoZ4tvDYHOicD78ku478Y/GpR4jS+uqPHjzRMyLSLF1P01cNkdXJNbZnbG4nZlhc7g4e3IAB++dt4OffjdIJoqiCOeCVksUjQ9kjHBzXNIyCCO4I81rrshYtYvUqlFx6n2iIpkQiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAItI1R1LsFpzFRO+qtSPvYHjwh27ycjsT8kO5GDhRrqXqJqO7zEQ1TrbTB2WRUri13c43P8AlE4OD2BwDgLJbm1V7a6sthTKRNd/1JY7FsF1uMNO9+NsfL3kHODtaCccHnGFH986wM2FlktTi4tBEtY7Aac8jYw8jHnuHJ7ccxKi51nEbZfDsaI48V13NpvnUDVN1ed1yfRxbg5sdH9qDSBj5Q9ojzwSRn5hjWZ5ZZ5nzTSPllkcXPe9xLnE9ySe5WQsen71engWu21FS3cWmRrcRhwGSC84aDjHc+Y963Cz9Jb9U+G+41VJQRuzvbkyyM744HsnPH33Y/iVChddvo2Wc0IbEeIpus/Saw03hPuNVV3CRu7e3IiifnOOB7Qxx993Hu4WyUGjNLUUJihsVC9pduJnj8Z2fnfk447dlfDh1r6tIreRFdCtqy31sak/B+7focn7FZeCKKCFkMMbIoo2hrGMaA1rQMAADsAvtaFwxd5EHkvyK50GhNW1sJlhslQ1odtxM5sLs/8AleQcc9+y9H2ONZ/2P+sw/vKwiKa4bV3bI+0yKyjTOpCM/W/dv0KT9ixk0UkMz4Zo3xyxuLXse3DmuBwQQexVrV57hQUNwhENfR09XE124MniD2h2CM4I78n86rlwxabSJLJ80VXW2aA1tX6arGRTSS1Nrd7MlOXZ8MZJ3R54ByScdjnnnBGxdT+ntLa7c68WGOfwmOHj02d4jZj5YJO7GQMjn5WeAFGK57VmPZp0a+/5L042RLWwyxzwsmhkZJFI0OY9jstcDyCCO4X2tF6JXaS4aRNJUTNkloJTE0biXiIgFmcn37mjsMNA8lvS+gptVsFNdzBKPK2giIrSIREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEXzNLHDC+aaRkcUbS573uw1oHJJJ7BRP1E6lyeNPadNysEYaY5a5p9onPPhHPA7jd55yMYDjTdfCmOsicIOb2N01lraz6ajMcz/Wq05DaWFwLmnbkF/9AHI5785AOCoZ1frS9ajmlZPUPgoXO9ikjdhgGRgOI+WeAcnzzgDstemlknmfNNI+SWRxc973Zc5xOSST3K/W20VVca+GhoYHz1Mztscbe5P+AxkkngAElcW/Lsuei2XkbYVRhuedeigoa2vldDQUdTVytbuLIInPcG8DOACccj86lDSfSb+TqtSVPud6pTu+Y4e//aBDfgQ5SbabZQWmjbR22khpYG49mNuMnAGSe5OAOTknCtp4fOe89iE8iK6bkQ6d6TXaplilvVTDQwHl8UbvEm4d8nj2RkZOcuxxwecSBY+n+lrU0FtubWS7S0y1n20uBOfkn2QRwMhoOPx52lF0q8Sqvov3M0rZy7hERaSsIiIAiIgCIiAL8quppqOnfU1dRFTwMxukleGtbk4GSeByvJqG80FhtUtxuMuyFnAA5dI7ya0eZP/AKnABKr7rHVV01LcJJqqV8dLuHg0jXnw4wM4OOxdycuxk58hgDLk5UaFp1ZbXU5+hverOrI+2UunKfPdvrc7fnGWM/2SC75i1RjdrlX3WsdWXKrlqp3cb5HZwMk4A7AZJ4HAyvIti0joy/ahLZKOk8KlP/vM+WR+fY93ctI9kHB74XGnbbkPTr+RsjGFaNdXutFnul3m8K2UFRVuDmtcY2EtYXdtzuzRweSQOCpo050v0/bmNfcA+61IcHbpMsjBBJGGA8g8ZDi4HHkCQt4tijhhZDDGyOKNoaxjG4a0DgAAdgtdXDZPeb0KpZKXQhaydJL1VND7nWU1uaWk7GjxpA7PAIBDcYychx8uPdvVp6aaUoNrpKSaukbIHtfUyk4xj2S1uGkcdiDnJzwtxRbq8Omvtr6lErpy7nnt9DRW+Ew0FHT0kTnbiyCIMaT2zgDvwPzL0Ii0padCoIiL0BERAEREAREQBERAEREBFXWPRcXgS6ktUDhKHbq2KNvskc5lx5EffY753cYJMSK2Crx1RsUVh1dPT00200tQwVMLB941xILewwA5rsD3Y5XGz8blfiR6PqbMezX3WbV0N1M9lSdMVRBik3y0ry5xLXDl0YHIAIDneWCD33cS6qsWuslt1zpa+ANMtNMyVgdnBLTkA48uFadaeHWucHF9ivIhpLXzCIi6BnCIiAIiIAiIgCIiAIiIAvyrKWmrKZ9NV08NRA/G6OVge12DkZB4PIyv1RNNQa3X6E0lWzCWayU7HBu0CAuhbjJ8mEDPPfutZuHR+0PhAoLrXU8u7JdM1srdvPGAG89uc/iUlIqJY1UusUTVk10ZCk3SHUAmeIrha3xhxDHOfI1xbngkbDg48snHvKlLR2nqTTNkZbaV75SXGSaV3eSQgAux5DgAD3DzOScyi8qxa6pc0UeytlJaMIiLQVhERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQEJdcr1NValFnZLKKaijaXxnAa6Vw3buO/suaOe3tY78x/DFJPMyGGN8ssjg1jGNJc4k4AAHcrcetNHJTa9qZnuYW1cMUzA08gBuzn45YfxYWrWWs+p14orh4fi+q1Ec2zdt3bXB2M+WcL5zIbd0ubzOjXtBaEvaA6Z01u2XDUDYaypdHxSOYHRQk5zu7h5xj4A578ESOsfp280F+tUdxt0viQv4c08Ojd5tcPIj9hGQQVkF3qa4QjpDoYZylJ7hERWkAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAKJPSEmidUWanEjTKxkz3MzyGuLAD8xLXfmK3/WWp7fpm2OqqtwkncMQUzXYfK7/AAaPN3l8TgGvmobzX366yXG4zeJM/hrRw2Nvk1o8gP2k5JJXMz8iPJ4cXuzTjwevMY5Wf0vTzUmmbXS1DDHNDRwxyNP3rgwAj84VedF2OTUOo6W2MDxE526d7fvIhy45wcHyGRjJA81ZdQ4ZB+9Pse5L6IIiLrGUIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiA1HqlpWTU1kjNHs9fpHF8AccB4I9pnfAJw0gnzGOASVAE0UkEz4Zo3xyxuLXse0hzSDggg9irWrU9baDtOpd1T/2O4naPWmN3bgPJzcgO48+DwOcDC5+Zh+K+eHU0U3cuz6EE2O73Ky1wrbXVvpp9paXNAIIPkQcgj5x3wfJSlpzq5SSsbFfqF8EpcB41KN0eCTklpO5oAx2LieeBwFoGp9G3/TwdJXUZfTA/9phO+PyHJ7t5IA3AZPbK15cyu62h6Lb8maZQhYiztk1BZby0G13KmqXFpf4bX4kDQcElh9oDOO48x71k1U9bDbtb6roPE8C+Vb9+M+ORNjGe28HHfy7rdXxNf7x/YoljeTLHooUtvVy+wvhbXUNDVxMbiQtDo5JDjvnJaDnk4bj3Y8s9busNtf4n1Qs9XT4xs8CRsu7vnOduPL3/AIvPVHOpl30KnRNdiTUWkW7qlpSq3+PNV0O3GPHgJ35z22bu3xx3XrPUjRgBP1Y7f91m/cVqyKn0kv3IuuS7G2IsT9c2m/wgtP6ZH+1Prm03+EFp/TI/2qfiQ8yPK/IyyLE/XPpv8ILT+mR/tT65tN/hBaf0yP8AaniQ8xyvyMsiw02qtMwwvlff7YWsaXEMqmOdge4Akk/AcrGfZH0Z/bP6tN+6vHdWusl+56oSfY2xFodZ1X0vBUOiijuFUxuMSxQtDXceW5wPw5CxNZ1jpm1L20lilmgGNr5akRuPHOWhrgOfiVVLMpj1kSVM32JSRQTX9VdU1MIjh9Ro3bs+JDAS7Hu9suGPxeS1u8alv928UXC7Vc0cuN8XiFsRxjHsDDfIHt357rPPiVa+FNlixpPqT1fdaaas4e2qukL5mbwYYD4j9ze7SG/JOePaxz8xUeao6s1tRug0/Tepx/1idodKex4by1vmOd2QfIqMkWK3PtnstkXQojHruftWVNTWVDqmrqJqid+N0kry9zsDAyTyeAAvq20NXcq+GhoYHz1Mztscbe5P+A8yTwByVsmk9AX6/iOcQ+pUL8H1ioBG5pwcsb3dwcg8NOPlKY9F6QtWmKUeqxiWtfGGT1Th7UnOTgZIaM+Q9wySRleUYdlz1lsj2y6MNl1PD0v0kzTlmbPV07G3eob/ABh28P8ADbnIjB7DjGcZy7zIAW3oi7kIRrjyx6GFycnqwiIpngREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBanf+nmmLvsd6l6hI3A30W2LIGeC3Bb598Z4HOOFtiKE64zWklqexk49CHrr0fr2yA2q7U0zCXZFS10ZYPvRloduPfPA7fHjUbjojVdBs8ex1b9+ceABN2x32E47+aseixy4bU17uq+/wAy5ZE11KpTRSQzPhmjfHLG4tex7cOa4HBBB7EL4Vrpoo5oXwzRskikaWvY9uWuB4IIPcLC1mkNL1dM6nlsNvax2MmKARO4OeHMwR28is8uGS/1kWLJXdFa0Vg3dN9GlpAtBGR3FTLx/wDssV9iLTf9du3+9j/cVL4dcnpsTWRAhFFN32ItN/127f72P9xYn7DX+sf6l/mKLwL12PVfDzInRSx9hr/WP9S/zF9wdHImzMM+oHyRBw3tZSBriPMAl5wfjgrz2G/8P8o98eHmRIim77EWm/67dv8Aex/uL7h6S6ZjmZI6pucrWuBMb5mbXgHscMBwfgQfipf4+4j7RAg5FYT7HGjP7H/Wpv3lmYdO6fhmZNDY7ZHLG4PY9lIwOa4HIIIHBBVseGWd2iLyY9kVqoKGtuE5goKOoq5Q3eWQRl7g3IGcDy5H51slo6daruPhO+p3qcUmftlU8M24z3by8Zx/R8x5cqwiK+HDIL4pakHkvsiKLP0eH2t94vHv8SGlj+fGHu/Efk+8fFbzpzR+n7A5stvoGestaB6xKS+TIBBIJ+STk524Bys8i1141Ve8UUyslLqwiIryAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/9k=";

      doc.addImage(img, "JPEG", 157, 5, 40, 17);

      // Footer
      doc.setFontSize(12);

      var pageSize = doc.internal.pageSize;
      var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

      doc.text("E&OE", 185, pageHeight - 55);

      // Footer text
      const footerText =
        "SUNBET (PTY) LTD TRADING AS SUNBET IS A LICENSED BOOKMAKER WITH REGISTRATION NUMBER " +
        "2008/014410/07 AND ITS OFFICE ADDRESS AT 6 SANDOWN VALLEY CRESCENT, SANDTON, 2146, LICENSED " +
        "WITH THE FOLLOWING REGULATORS: MPUMALANGA ECONOMIC REGULATOR WITH LICENSE NUMBER " +
        "9-2-1-09789; AND NORTH WEST GAMBLING BOARD License. NO PERSONS UNDER THE AGE OF 18 ARE " +
        "PERMITTED TO GAMBLE. WINNERS KNOW WHEN TO STOP. SOUTH AFRICAN RESPONSIBLE GAMBLING " +
        "FOUNDATION TOLL FREE COUNSELLING LINE 0800 006 008 OR WHATSAPP HELP TO 0766750710. " +
        "WARNING: GAMBLING INVOLVES RISK. BY GAMBLING ON THIS WEBSITE, YOU RUN THE RISK THAT YOU " +
        "MAY LOSE' and 'GAMBLING ADDICTION IS NOT SELECTIVE. IT COULD HAPPEN TO YOU.";

      const splitFooter = doc.splitTextToSize(footerText, pageWidth - 40);
      doc.text(splitFooter, 20, pageHeight - 40);

      // Page number
      var str = "Page " + doc.internal.getNumberOfPages();
      if (typeof doc.putTotalPages === "function") {
        str = str + " of " + totalPagesExp;
      }
      doc.setFontSize(10);
      doc.text(str, data.settings.margin.left, pageHeight - 10);
    },
    margin: {
      bottom: 60,
      top: 40,
    },
  });

  // Total page number plugin only available in jspdf v1.0+
  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages(totalPagesExp);
  }

  // Save the PDF
  doc.save("Betslip.pdf");
}

// Update the click handler for the Export PDF button
function setupExportPDF() {
  // Use the stored betslip data for PDF export
  const betslipData = JSON.parse(
    localStorage.getItem("betslipData") || "[]"
  )[0];
  if (betslipData) {
    exportBetslipPDF(betslipData);
  } else {
    alert("No betslip data available to export");
  }
}

//Details

// https://pr01-spine.sun.bedegaming.com/api/v5/players/138383/activities?startdate=2024-01-02%2016:53:00&enddate=2025-04-01%2016:53:00&sort=asc&type%5B%5D=Stake&type%5B%5D=Debit&type%5B%5D=Win&take=10
// https://weapistg.sunbet.co.za/pub/ext/bede-player/players/1143090739723537571/activities?startdate=2024-01-01T18:30:00.000Z&enddate=2025-04-01T18:29:59.999Z&sort=desc&type%5B%5D=Stake&type%5B%5D=Debit&type%5B%5D=Win&take=10

// {
//   "id": "50584475-f72a-475f-9564-fbbba5d11238-1",
//   "siteCode": "sunbet.co.za",
//   "transactionDate": "2024-04-05T06:07:02.1Z",
//   "type": "Stake",
//   "displayType": "Stake",
//   "amount": 8,
//   "description": "Fire In The Hole xBomb",
//   "correlationToken": "bda84de8-a2df-46ff-abc2-1c8fcd0a54f2",
//   "totalBalanceAfter": 76.05,
//   "cashBalanceAfter": 76.05,
//   "isHealed": false,
//   "effects": [
//       {
//           "walletType": "Cash",
//           "walletName": "Default",
//           "walletDisplayName": "Cash-Default",
//           "compartment": "Adjustments",
//           "amount": -8,
//           "balanceBefore": {
//               "adjustments": 22.2,
//               "winnings": 61.83,
//               "ringfence": 0
//           },
//           "balanceAfter": {
//               "adjustments": 14.2,
//               "winnings": 61.83,
//               "ringfence": 0
//           }
//       }
//   ],
//   "details": {
//       "category": "Gaming",
//       "gameName": "Fire In The Hole xBomb",
//       "gameCode": "fireinthehole-fireinthehole000",
//       "gamingEventId": "1963868188",
//       "gameEngine": "Evolution",
//       "productType": "Casino",
//       "status": "Created",
//       "remoteId": "NLCR-8029983526",
//       "currency": "ZAR",
//       "gamingAction": {
//           "id": "3923231731",
//           "status": "Success",
//           "cashAmount": 8,
//           "bonusAmount": 0
//       }
//   },
//   "playerId": "138383",
//   "remoteReference": "DNLCR-8029983526"
// }

// {
//   "id": "ae710ff2-447a-44fd-b404-cb448111dc54",
//   "siteCode": "sunbet.co.za",
//   "transactionDate": "2025-03-31T13:18:11.762Z",
//   "type": "Debit",
//   "displayType": "Debit",
//   "amount": 10,
//   "description": "Kambi",
//   "correlationToken": "378209fa-1da8-4c08-a986-b56959f144f3",
//   "totalBalanceAfter": 1150,
//   "cashBalanceAfter": 1150,
//   "isHealed": false,
//   "effects": [
//       {
//           "walletType": "Cash",
//           "walletName": "Default",
//           "walletDisplayName": "Cash-Default",
//           "compartment": "Adjustments",
//           "amount": -10,
//           "balanceBefore": {
//               "adjustments": 1050,
//               "winnings": 110,
//               "ringfence": 1300
//           },
//           "balanceAfter": {
//               "adjustments": 1040,
//               "winnings": 110,
//               "ringfence": 1300
//           }
//       }
//   ],
//   "details": {
//       "category": "Betting",
//       "bedeTransactionId": 8024,
//       "remoteTransactionId": "25287db4-f415-43a9-b263-28d01fa280f2/4358458003",
//       "providerName": "Kambi",
//       "providerBetType": "Sports",
//       "currency": "ZAR",
//       "betActions": [
//           {
//               "betId": 6530,
//               "remoteBetId": "4358458003",
//               "betActionId": 8376,
//               "amount": 10,
//               "description": "Coupon ID: 4358458003",
//               "additionalData": {
//                   "combination.1": "7158866960 - 2 - 2.25 - False - 10.00"
//               }
//           }
//       ]
//   },
//   "playerId": "1143090739723537571",
//   "remoteReference": "25287db4-f415-43a9-b263-28d01fa280f2/4358458003"
// }
