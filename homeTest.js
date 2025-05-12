//betslipCtrl.js
(function (angular, sunbetApp, simlBC) {
  "use strict";

  angular
    .module("betslipModule")
    .controller("betslipCtrl", [
      "$scope",
      "$timeout",
      "betslipService",
      "utilService",
      betslipCtrl,
    ]);

  function betslipCtrl($scope, $timeout, betslipService, utilService) {
    var ctrl = this;

    ctrl.data = null;
    ctrl.error = null;

    ctrl.paginationData = null;
    ctrl.totalPages = 0;

    ctrl.currentPage = 1;
    ctrl.skipItems = 0;
    ctrl.itemsPerPage = 10;

    ctrl.allTrans = ["Stake", "Debit", "Win"];
    ctrl.months = [
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

    ctrl.selectedMonth = ctrl.months[new Date().getMonth()];
    ctrl.selectedYear = new Date().getFullYear();
    ctrl.selectedTransaction = "All Transactions";

    ctrl.years = (function () {
      var y = [];
      var currentYear = new Date().getFullYear();
      for (var i = currentYear; i >= 1950; i--) {
        //assuming 1950 is the lowest year
        y.push(i);
      }
      return y;
    })();

    ctrl.endDate = new Date();
    ctrl.endDateChange = function () {
      ctrl.endDateFormatted =
        ctrl.endDate.getFullYear() +
        "/" +
        ("0" + (ctrl.endDate.getMonth() + 1)).slice(-2) +
        "/" +
        ("0" + ctrl.endDate.getDate()).slice(-2) +
        " " +
        ("0" + ctrl.endDate.getHours()).slice(-2) +
        ":" +
        ("0" + ctrl.endDate.getMinutes()).slice(-2);
    };

    //Handler for startDate Change
    ctrl.startDateChange = function () {
      ctrl.startDate = new Date();

      //Format ctrl.startDate to YYYY/MM/DD HH:MM
      ctrl.startDate =
        ctrl.startDate.getFullYear() +
        "/" +
        ("0" + (ctrl.startDate.getMonth() + 1)).slice(-2) +
        "/" +
        ("0" + ctrl.startDate.getDate()).slice(-2) +
        " " +
        ("0" + ctrl.startDate.getHours()).slice(-2) +
        ":" +
        ("0" + ctrl.startDate.getMinutes()).slice(-2);
      resetPaginationData();
      loadDataWrapper();
    };

    //Handler for endDate Change
    ctrl.endDateChange = function () {
      resetPaginationData();
      loadDataWrapper();
    };

    //Handler for Month Change
    ctrl.onMonthChange = function () {
      resetPaginationData();
      loadDataWrapper();
    };

    //Handler for Year Change
    ctrl.onYearChange = function () {
      resetPaginationData();
      loadDataWrapper();
    };

    //Only call when logged in
    if (simlBC.isLoggedIn()) {
      loadDataWrapper();
    }

    ctrl.next = function () {
      if (ctrl.totalPages && ctrl.currentPage < ctrl.totalPages) {
        ctrl.currentPage++;
        ctrl.skipItems += ctrl.itemsPerPage;
        loadStmtData(ctrl.currentPage, ctrl.skipItems, ctrl.itemsPerPage);
      }
    };

    ctrl.prev = function () {
      if (ctrl.totalPages && ctrl.currentPage > 1) {
        ctrl.currentPage--;
        ctrl.skipItems -= ctrl.itemsPerPage;
        loadStmtData(ctrl.currentPage, ctrl.skipItems, ctrl.itemsPerPage);
      }
    };

    ctrl.lastPage = function () {
      if (ctrl.totalPages && ctrl.currentPage < ctrl.totalPages) {
        ctrl.currentPage = ctrl.paginationData.totalPages;
        ctrl.skipItems =
          ctrl.paginationData.totalItems -
          (ctrl.paginationData.totalItems % ctrl.itemsPerPage);
        loadStmtData(ctrl.currentPage, ctrl.skipItems, ctrl.itemsPerPage);
      }
    };

    ctrl.firstPage = function () {
      if (ctrl.totalPages && ctrl.currentPage > 1) {
        ctrl.currentPage = 1;
        ctrl.skipItems = 0;
        loadStmtData(ctrl.currentPage, ctrl.skipItems, ctrl.itemsPerPage);
      }
    };

    ctrl.pageReload = function () {
      $(".transaction-list").hide();
      $(".view_statement").hide();
      $(".back-button").hide();
      $(".bet-slip").hide();

      window.location.reload();
    };

    function loadPdfData(itemId) {
      $("#footer_table_pdfBody").empty();

      var array = [];
      array = JSON.parse(window.localStorage.getItem("betslipData"));

      $(array).each(function () {
        var pdfBody = [];

        var pdfRow = {};

        pdfRow.operator = "SunBet Pty Ltd";
        pdfRow.address =
          "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni";
        if (this.playerId) {
          pdfRow.playerId = this.playerId;
        }
        if (this.wagerId) {
          pdfRow.id = this.wagerId;
        }
        if (this.dateTime) {
          pdfRow.datetime = this.dateTime;
        }
        if (this.game) {
          pdfRow.description = this.game;
        }
        if (this.provider) {
          pdfRow.provider = this.provider;
        }
        if (this.licenseNumber) {
          pdfRow.licenseNumber = this.licenseNumber;
        }
        if (this.wagerAmount) {
          pdfRow.amount = this.wagerAmount;
        }
        if (this.wagerType) {
          pdfRow.wagerType = this.wagerType;
        }
        var betDetailsArray = [];
        var oddsArray = [];

        if (this.betDetail) {
          betDetailsArray.push(this.betDetail);
        }
        if (this.odds) {
          oddsArray.push(this.odds);
        }

        var detailsArray = [];
        detailsArray = JSON.parse(
          window.localStorage.getItem("betslipDetails")
        );

        if (detailsArray) {
          for (var j = 0; j < detailsArray.length; j++) {
            if (detailsArray[j].betDetail) {
              betDetailsArray.push(detailsArray[j].betDetail);
            }
            if (detailsArray[j].odds) {
              oddsArray.push(detailsArray[j].odds);
            }
          }
        }

        pdfRow.betDetail = betDetailsArray;
        pdfRow.odds = oddsArray;

        pdfBody.push(pdfRow);
        var footerText = $("#footer_legal_text").text().trim();

        var pdfFooterBody = "";
        pdfFooterBody += "<tr>";
        pdfFooterBody += "<td>" + footerText + "</td>";
        pdfFooterBody += "</tr>";
        $("#footer_table_pdfBody").append(pdfFooterBody);

        ctrl.htmlToPdf(pdfBody);
        ctrl.error = null;
      });
    }

    $(document).on("click", ".border_form_btn_details", function () {
      loadPdfData($(this).data("id"));
    });

    $(document).on("click", ".kambi_details", function () {
      ctrl.loadkambiDetails($(this).data("id"));
    });

    ctrl.loadDetails = function (itemId) {
      var array = [];
      array = JSON.parse(window.localStorage.getItem("transaction-history"));

      $(array).each(function () {
        if ($(this)[0].id === itemId) {
          var currentItem = $(this)[0];
          var licence_number;
          var physc_address;

          function handleProviderDetails(err, data) {
            sunbetApp.UTILS.hideLoading();

            if (data) {
              // Set licence_number here
              licence_number = data[0].licence_number;
              physc_address = data[0].physical_address;

              // Continue with the rest of your code here
              $(".transaction-list").hide();
              $(".view_statement").hide();
              $(".back-button").show();

              if (currentItem.details.category == "Betting") {
                if (currentItem.betting) {
                  if (currentItem.betting.betActions.length > 1) {
                    var betslipDetailsArray = [];

                    // Create an object to hold the data
                    var betslipData = {
                      operator: "Sunbet Pty Ltd",
                      address: physc_address,
                      playerId: currentItem.playerId,
                      wagerId: currentItem.id,
                      dateTime: currentItem.transactionDate,
                      game: currentItem.description,
                      provider: currentItem.betting.providerName,
                      licenseNumber: licence_number,
                      wagerAmount: currentItem.amount,
                      wagerType: "Single (Fixed Odds)",
                      betDetail: currentItem.betting.betActions[0].description,
                      odds: currentItem.betting.betActions[0].additionalData
                        .odd,
                    };

                    // Convert the object to a JSON string
                    var betslipJson = JSON.stringify(betslipData);

                    window.localStorage.removeItem("betslipData");

                    // Store the JSON string in local storage
                    localStorage.setItem("betslipData", betslipJson);

                    // Append common information only once
                    var commonInfo =
                      '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                      physc_address +
                      "</p><p> <b>PlayerId:</b> " +
                      currentItem.playerId +
                      '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                      currentItem.id +
                      ' <img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                      currentItem.transactionDate +
                      "</p><p><b> Game:</b> " +
                      currentItem.description +
                      "</p><p><b> Provider:</b>" +
                      currentItem.betting.providerName +
                      "</p><p><b> License Number:</b> " +
                      licence_number +
                      "</p><p><b> Amount:</b> " +
                      currentItem.amount +
                      "</p><p><b> Wager Type:</b> Single (Fixed Odds)</p></div>";
                    $(".bet-slip").append(commonInfo);
                    document
                      .getElementById("copyWagerId")
                      .addEventListener("click", function () {
                        let myValue =
                          document.getElementById("WagerIdValue").textContent;

                        const wagerIdArray = myValue.split("");
                        // Remove the "Wager Id : " part
                        const wagerIdWithoutPrefix = wagerIdArray
                          .slice(11)
                          .join("");

                        navigator.clipboard.writeText(wagerIdWithoutPrefix);
                        let buttonChaneEffect =
                          document.getElementById("copyWagerId");
                        buttonChaneEffect.src =
                          "/content/dam/sunbet/images/check-solid.svg";
                        buttonChaneEffect.style.transition = "0.5s";
                        buttonChaneEffect.style.transform = "scale(1.2)";
                        setTimeout(() => {
                          let buttonChaneEffect =
                            document.getElementById("copyWagerId");
                          buttonChaneEffect.src =
                            "/content/dam/sunbet/images/copy-regular.svg";
                          buttonChaneEffect.style.transform = "scale(1)";
                        }, 10000);
                      });

                    // Append details for each bet action in the loop
                    for (
                      var j = 0;
                      j < currentItem.betting.betActions.length;
                      j++
                    ) {
                      var betslipDetail = {
                        betDetail:
                          currentItem.betting.betActions[j].description,
                        odds: currentItem.betting.betActions[j].additionalData
                          .odds,
                      };

                      // Push the betslipDetail object to the array
                      betslipDetailsArray.push(betslipDetail);

                      $(".bet-slip").append(
                        '<div class="betslip-details"><p><b> Bet Detail:</b> ' +
                          currentItem.betting.betActions[j].description +
                          "</p><p><b> Odds:</b> " +
                          currentItem.betting.betActions[j].additionalData
                            .odds +
                          "</p></div>"
                      );
                    }

                    // Convert the array to a JSON string
                    var betslipDetailsJson =
                      JSON.stringify(betslipDetailsArray);

                    window.localStorage.removeItem("betslipDetails");

                    // Store the JSON string in local storage
                    localStorage.setItem("betslipDetails", betslipDetailsJson);

                    // Append the "Export PDF" button outside the loop (if needed)
                    $(".bet-slip").append(
                      '<a class="kambi_details border_form_btn less_padding_border" href="javascript:" data-id="' +
                        currentItem.details.betActions[0].description +
                        '">View Detailed Slip</a><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                        currentItem.id +
                        '">Export PDF</a>'
                    );
                  } else if (currentItem.betting.betActions.length == 1) {
                    // Create an object to hold the data
                    var betslipData = {
                      operator: "Sunbet Pty Ltd",
                      address: physc_address,
                      playerId: currentItem.playerId,
                      wagerId: currentItem.id,
                      dateTime: currentItem.transactionDate,
                      game: currentItem.description,
                      provider: currentItem.betting.providerName,
                      licenseNumber: licence_number,
                      wagerAmount: currentItem.amount,
                      wagerType: "Single (Fixed Odds)",
                      betDetail: currentItem.betting.betActions[0].description,
                      odds: currentItem.betting.betActions[0].additionalData
                        .odd,
                    };

                    // Convert the object to a JSON string
                    var betslipJson = JSON.stringify(betslipData);

                    window.localStorage.removeItem("betslipData");

                    // Store the JSON string in local storage
                    localStorage.setItem("betslipData", betslipJson);

                    if (currentItem.betting.providerName == "Kambi") {
                      $(".bet-slip").append(
                        '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                          physc_address +
                          "</p><p> <b>PlayerId:</b> " +
                          currentItem.playerId +
                          '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                          currentItem.id +
                          '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                          currentItem.transactionDate +
                          "</p><p><b> Game:</b> " +
                          currentItem.description +
                          "</p><p><b> Provider:</b>" +
                          currentItem.betting.providerName +
                          "</p><p><b> License Number:</b> " +
                          licence_number +
                          "</p><p><b> Amount:</b> " +
                          currentItem.amount +
                          "</p><p><b> Wager Type:</b> Single (Fixed Odds)</p><p><b> Bet Detail:</b> " +
                          currentItem.betting.betActions[0].description +
                          "</p><p><b> Odds:</b> " +
                          currentItem.betting.betActions[0].additionalData.odd +
                          '</p></div><a class="kambi_details border_form_btn  less_padding_border" href="javascript:" data-id="' +
                          currentItem.details.betActions[0].description +
                          '">View Detailed Slip</a><a class="border_form_btn less_padding_border" href="javascript:" data-id="' +
                          currentItem.id +
                          '">Export PDF</a>'
                      );
                    } else {
                      $(".bet-slip").append(
                        '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                          physc_address +
                          "</p><p> <b>PlayerId:</b> " +
                          currentItem.playerId +
                          '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                          currentItem.id +
                          '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                          currentItem.transactionDate +
                          "</p><p><b> Game:</b> " +
                          currentItem.description +
                          "</p><p><b> Provider:</b>" +
                          currentItem.betting.providerName +
                          "</p><p><b> License Number:</b> " +
                          licence_number +
                          "</p><p><b> Amount:</b> " +
                          currentItem.amount +
                          "</p><p><b> Wager Type:</b> Single (Fixed Odds)</p><p><b> Bet Detail:</b> " +
                          currentItem.betting.betActions[0].description +
                          "</p><p><b> Odds:</b> " +
                          currentItem.betting.betActions[0].additionalData.odd +
                          '</p></div><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                          currentItem.id +
                          '">Export PDF</a>'
                      );
                    }

                    document
                      .getElementById("copyWagerId")
                      .addEventListener("click", function () {
                        let myValue =
                          document.getElementById("WagerIdValue").textContent;

                        const wagerIdArray = myValue.split("");
                        // Remove the "Wager Id : " part
                        const wagerIdWithoutPrefix = wagerIdArray
                          .slice(11)
                          .join("");

                        navigator.clipboard.writeText(wagerIdWithoutPrefix);
                        let buttonChaneEffect =
                          document.getElementById("copyWagerId");
                        buttonChaneEffect.src =
                          "/content/dam/sunbet/images/check-solid.svg";
                        buttonChaneEffect.style.transition = "0.5s";
                        buttonChaneEffect.style.transform = "scale(1.2)";
                        setTimeout(() => {
                          let buttonChaneEffect =
                            document.getElementById("copyWagerId");
                          buttonChaneEffect.src =
                            "/content/dam/sunbet/images/copy-regular.svg";
                          buttonChaneEffect.style.transform = "scale(1)";
                        }, 10000);
                      });
                  }
                }

                if (currentItem.details.betActions) {
                  var wager =
                    currentItem.details.betActions[0].additionalData[
                      "combination.1"
                    ];

                  if (currentItem.details.betActions.length > 1) {
                    var betslipDetailsArray = [];

                    if (wager) {
                      const parts = wager.split(" - ");
                      const value = parts[1];

                      if (value == "1") {
                        // Create an object to hold the data
                        var betslipData = {
                          operator: "Sunbet Pty Ltd",
                          address:
                            "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni",
                          playerId: currentItem.playerId,
                          wagerId: currentItem.id,
                          dateTime: currentItem.transactionDate,
                          game: currentItem.description,
                          provider:
                            currentItem.details.betActions[0].description,
                          licenseNumber: licence_number,
                          wagerAmount: currentItem.amount,
                          wagerType: "Single",
                          betDetail:
                            currentItem.details.betActions[0].description,
                          odds: currentItem.details.betActions[0].additionalData
                            .odd,
                        };
                      } else {
                        // Create an object to hold the data
                        var betslipData = {
                          operator: "Sunbet Pty Ltd",
                          address:
                            "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni",
                          playerId: currentItem.playerId,
                          wagerId: currentItem.id,
                          dateTime: currentItem.transactionDate,
                          game: currentItem.description,
                          provider:
                            currentItem.details.betActions[0].description,
                          licenseNumber: licence_number,
                          wagerAmount: currentItem.amount,
                          wagerType: "Multiple",
                          betDetail:
                            currentItem.details.betActions[0].description,
                          odds: currentItem.details.betActions[0].additionalData
                            .odd,
                        };
                      }
                    } else if (!wager) {
                      // Create an object to hold the data
                      var betslipData = {
                        operator: "Sunbet Pty Ltd",
                        address:
                          "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni",
                        playerId: currentItem.playerId,
                        wagerId: currentItem.id,
                        dateTime: currentItem.transactionDate,
                        game: currentItem.description,
                        provider: currentItem.details.betActions[0].description,
                        licenseNumber: licence_number,
                        wagerAmount: currentItem.amount,
                        wagerType: "Single (Fixed Odds)",
                        betDetail:
                          currentItem.details.betActions[0].description,
                        odds: currentItem.details.betActions[0].additionalData
                          .odd,
                      };
                    }

                    // Convert the object to a JSON string
                    var betslipJson = JSON.stringify(betslipData);

                    window.localStorage.removeItem("betslipData");

                    // Store the JSON string in local storage
                    localStorage.setItem("betslipData", betslipJson);

                    // Append common information only once
                    var commonInfo =
                      '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b> Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni</p><p> <b>PlayerId:</b> ' +
                      currentItem.playerId +
                      '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                      currentItem.id +
                      ' <img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                      currentItem.transactionDate +
                      "</p><p><b> Game:</b> " +
                      currentItem.details.betActions[0].description +
                      "</p><p><b> Provider:</b>" +
                      currentItem.description +
                      "</p><p><b> License Number:</b> " +
                      licence_number +
                      "</p><p><b> Amount:</b> " +
                      currentItem.amount +
                      "</p><p><b> Wager Type:</b>" +
                      betslipData.wagerType +
                      "</p></div>";
                    $(".bet-slip").append(commonInfo);
                    document
                      .getElementById("copyWagerId")
                      .addEventListener("click", function () {
                        let myValue =
                          document.getElementById("WagerIdValue").textContent;

                        const wagerIdArray = myValue.split("");
                        // Remove the "Wager Id : " part
                        const wagerIdWithoutPrefix = wagerIdArray
                          .slice(11)
                          .join("");

                        navigator.clipboard.writeText(wagerIdWithoutPrefix);
                        let buttonChaneEffect =
                          document.getElementById("copyWagerId");
                        buttonChaneEffect.src =
                          "/content/dam/sunbet/images/check-solid.svg";
                        buttonChaneEffect.style.transition = "0.5s";
                        buttonChaneEffect.style.transform = "scale(1.2)";
                        setTimeout(() => {
                          let buttonChaneEffect =
                            document.getElementById("copyWagerId");
                          buttonChaneEffect.src =
                            "/content/dam/sunbet/images/copy-regular.svg";
                          buttonChaneEffect.style.transform = "scale(1)";
                        }, 10000);
                      });
                    // Append details for each bet action in the loop
                    for (
                      var j = 0;
                      j < currentItem.details.betActions.length;
                      j++
                    ) {
                      var oddsValue;

                      if (
                        currentItem.details.betActions[j].additionalData.odd
                      ) {
                        oddsValue =
                          currentItem.details.betActions[j].additionalData.odd;
                      } else if (
                        currentItem.details.betActions[j].additionalData.odds
                      ) {
                        oddsValue =
                          currentItem.details.betActions[j].additionalData.odds;
                      }

                      var betslipDetail = {
                        betDetail:
                          currentItem.details.betActions[j].description,
                        odds: oddsValue,
                      };

                      // Push the betslipDetail object to the array
                      betslipDetailsArray.push(betslipDetail);

                      $(".bet-slip").append(
                        '<div class="betslip-details"><p><b> Bet Detail:</b> ' +
                          currentItem.details.betActions[j].description +
                          "</p><p><b> Odds:</b> " +
                          oddsValue +
                          "</p></div>"
                      );
                    }

                    // Convert the array to a JSON string
                    var betslipDetailsJson =
                      JSON.stringify(betslipDetailsArray);

                    window.localStorage.removeItem("betslipDetails");

                    // Store the JSON string in local storage
                    localStorage.setItem("betslipDetails", betslipDetailsJson);

                    // Append the "Export PDF" button outside the loop (if needed)
                    $(".bet-slip").append(
                      '<a class="kambi_details border_form_btn less_padding_border" href="javascript:" data-id="' +
                        currentItem.details.betActions[0].description +
                        '">View Detailed Slip</a><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                        currentItem.id +
                        '">Export PDF</a>'
                    );
                  } else if (currentItem.details.betActions.length == 1) {
                    var oddsValue;

                    if (currentItem.details.betActions[0].additionalData.odd) {
                      oddsValue =
                        currentItem.details.betActions[0].additionalData.odd;
                    } else if (
                      currentItem.details.betActions[0].additionalData.odds
                    ) {
                      oddsValue =
                        currentItem.details.betActions[0].additionalData.odds;
                    }

                    if (wager) {
                      const parts = wager.split(" - ");
                      const value = parts[1];

                      if (value == "1") {
                        // Create an object to hold the data
                        var betslipData = {
                          operator: "Sunbet Pty Ltd",
                          address:
                            "Shop 17, Riverside Junction, Emnotweni Avenue Riverside Park, Mbombela, Ehlanzeni",
                          playerId: currentItem.playerId,
                          wagerId: currentItem.id,
                          dateTime: currentItem.transactionDate,
                          game: currentItem.details.betActions[0].description,
                          provider: currentItem.description,
                          licenseNumber: licence_number,
                          wagerAmount: currentItem.amount,
                          wagerType: "Single",
                          betDetail:
                            currentItem.details.betActions[0].description,
                          odds: oddsValue,
                        };
                      } else {
                        // Create an object to hold the data
                        var betslipData = {
                          operator: "Sunbet Pty Ltd",
                          address: physc_address,
                          playerId: currentItem.playerId,
                          wagerId: currentItem.id,
                          dateTime: currentItem.transactionDate,
                          game: currentItem.details.betActions[0].description,
                          provider: currentItem.description,
                          licenseNumber: licence_number,
                          wagerAmount: currentItem.amount,
                          wagerType: "Multiple",
                          betDetail:
                            currentItem.details.betActions[0].description,
                          odds: oddsValue,
                        };
                      }
                    } else if (!wager) {
                      // Create an object to hold the data
                      var betslipData = {
                        operator: "Sunbet Pty Ltd",
                        address: physc_address,
                        playerId: currentItem.playerId,
                        wagerId: currentItem.id,
                        dateTime: currentItem.transactionDate,
                        game: currentItem.details.betActions[0].description,
                        provider: currentItem.description,
                        licenseNumber: licence_number,
                        wagerAmount: currentItem.amount,
                        wagerType: "Single (Fixed Odds)",
                        betDetail:
                          currentItem.details.betActions[0].description,
                        odds: oddsValue,
                      };
                    }

                    // Convert the object to a JSON string
                    var betslipJson = JSON.stringify(betslipData);

                    window.localStorage.removeItem("betslipData");

                    // Store the JSON string in local storage
                    localStorage.setItem("betslipData", betslipJson);

                    if (currentItem.description == "Kambi") {
                      $(".bet-slip").append(
                        '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b> ' +
                          physc_address +
                          "</p><p> <b>PlayerId:</b> " +
                          currentItem.playerId +
                          '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                          currentItem.id +
                          '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                          currentItem.transactionDate +
                          "</p><p><b> Game:</b> " +
                          currentItem.details.betActions[0].description +
                          "</p><p><b> Provider:</b>" +
                          currentItem.description +
                          "</p><p><b> License Number:</b> " +
                          licence_number +
                          "</p><p><b> Amount:</b> " +
                          currentItem.amount +
                          "</p><p><b> Wager Type:</b>" +
                          betslipData.wagerType +
                          "</p><p><b> Bet Detail:</b>" +
                          currentItem.details.betActions[0].description +
                          " </p><p><b> Odds:</b> " +
                          oddsValue +
                          ' </p></div><a class="kambi_details border_form_btn less_padding_border" href="javascript:" data-id="' +
                          currentItem.details.betActions[0].description +
                          '">View Detailed Slip</a><a class="border_form_btn less_padding_border" href="javascript:" data-id="' +
                          currentItem.id +
                          '">Export PDF</a>'
                      );
                    } else {
                      $(".bet-slip").append(
                        '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                          physc_address +
                          "</p><p> <b>PlayerId:</b> " +
                          currentItem.playerId +
                          '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                          currentItem.id +
                          '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                          currentItem.transactionDate +
                          "</p><p><b> Game:</b> " +
                          currentItem.details.betActions[0].description +
                          "</p><p><b> Provider:</b>" +
                          currentItem.description +
                          "</p><p><b> License Number:</b> " +
                          licence_number +
                          "</p><p><b> Amount:</b> " +
                          currentItem.amount +
                          "</p><p><b> Wager Type:</b>" +
                          betslipData.wagerType +
                          "</p><p><b> Bet Detail:</b>" +
                          currentItem.details.betActions[0].description +
                          " </p><p><b> Odds:</b> " +
                          oddsValue +
                          ' </p></div><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                          currentItem.id +
                          '">Export PDF</a>'
                      );
                    }

                    document
                      .getElementById("copyWagerId")
                      .addEventListener("click", function () {
                        let myValue =
                          document.getElementById("WagerIdValue").textContent;

                        const wagerIdArray = myValue.split("");
                        // Remove the "Wager Id : " part
                        const wagerIdWithoutPrefix = wagerIdArray
                          .slice(11)
                          .join("");

                        navigator.clipboard.writeText(wagerIdWithoutPrefix);
                        let buttonChaneEffect =
                          document.getElementById("copyWagerId");
                        buttonChaneEffect.src =
                          "/content/dam/sunbet/images/check-solid.svg";
                        buttonChaneEffect.style.transition = "0.5s";
                        buttonChaneEffect.style.transform = "scale(1.2)";
                        setTimeout(() => {
                          let buttonChaneEffect =
                            document.getElementById("copyWagerId");
                          buttonChaneEffect.src =
                            "/content/dam/sunbet/images/copy-regular.svg";
                          buttonChaneEffect.style.transform = "scale(1)";
                        }, 10000);
                      });
                  }
                }
              } else if (currentItem.details.category == "Gaming") {
                if (currentItem.displayType == "Stake") {
                  var odds = 30000000 / currentItem.amount;
                } else {
                  var odds = "";
                }

                // Create an object to hold the data
                var betslipData = {
                  operator: "Sunbet Pty Ltd",
                  address: physc_address,
                  playerId: currentItem.playerId,
                  wagerId: currentItem.id,
                  dateTime: currentItem.transactionDate,
                  game: currentItem.description,
                  provider: currentItem.details.gameEngine,
                  licenseNumber: licence_number,
                  wagerAmount: currentItem.amount,
                  wagerType: "Single (Fixed Odds)",
                  odds: odds,
                };

                // Convert the object to a JSON string
                var betslipJson = JSON.stringify(betslipData);

                window.localStorage.removeItem("betslipData");

                // Store the JSON string in local storage
                localStorage.setItem("betslipData", betslipJson);

                var launchUrl;

                if (currentItem.details.gameEngine == "Authentic") {
                  if (currentItem.description == "Blaze Roulette") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1107590889662054409&openTable=852";
                  } else if (currentItem.description == "Bad Homburg") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1128958143498551352";
                  } else if (currentItem.description == "XL Roulette") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1478676050367226594&openTable=1321";
                  } else if (currentItem.description == "Speed 1") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1107590889662054413";
                  } else if (currentItem.description == "Classic 2") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1107590889662054412";
                  } else if (currentItem.description == "Classic 1") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1107590889662054412";
                  } else if (currentItem.description == "Royal Casino") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1107590889662054407";
                  } else if (currentItem.description == "Kensington") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1463100247407599626";
                  } else if (currentItem.description == "Auto Roulette VIP") {
                    launchUrl =
                      "/slots-games/launch-game/?gameId=1107590889662054410&openTable=855";
                  }

                  $(".bet-slip").append(
                    '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                      physc_address +
                      "</p><p> <b>PlayerId:</b> " +
                      currentItem.playerId +
                      '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                      currentItem.id +
                      '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                      currentItem.transactionDate +
                      "</p><p><b> Game:</b> " +
                      currentItem.description +
                      "</p><p><b> Provider:</b>" +
                      currentItem.details.gameEngine +
                      "</p><p><b> License Number:</b> " +
                      licence_number +
                      "</p><p><b> Amount:</b> " +
                      currentItem.amount +
                      '</p><p><b> Wager Type:</b> Single (Fixed Odds)</p><p><a style="font-weight: 900; text-decoration: underline;" target="_blank" href=' +
                      launchUrl +
                      '>view detail<a/></p></div><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                      currentItem.id +
                      '">Export PDF</a>'
                  );
                } else {
                  $(".bet-slip").append(
                    '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                      physc_address +
                      "</p><p> <b>PlayerId:</b> " +
                      currentItem.playerId +
                      '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                      currentItem.id +
                      '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                      currentItem.transactionDate +
                      "</p><p><b> Game:</b> " +
                      currentItem.description +
                      "</p><p><b> Provider:</b>" +
                      currentItem.details.gameEngine +
                      "</p><p><b> License Number:</b> " +
                      licence_number +
                      "</p><p><b> Amount:</b> " +
                      currentItem.amount +
                      '</p><p><b> Wager Type:</b> Single (Fixed Odds)</p></div><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                      currentItem.id +
                      '">Export PDF</a>'
                  );
                }
                document
                  .getElementById("copyWagerId")
                  .addEventListener("click", function () {
                    let myValue =
                      document.getElementById("WagerIdValue").textContent;

                    const wagerIdArray = myValue.split("");
                    // Remove the "Wager Id : " part
                    const wagerIdWithoutPrefix = wagerIdArray
                      .slice(11)
                      .join("");

                    navigator.clipboard.writeText(wagerIdWithoutPrefix);
                    let buttonChaneEffect =
                      document.getElementById("copyWagerId");
                    buttonChaneEffect.src =
                      "/content/dam/sunbet/images/check-solid.svg";
                    buttonChaneEffect.style.transition = "0.5s";
                    buttonChaneEffect.style.transform = "scale(1.2)";
                    setTimeout(() => {
                      let buttonChaneEffect =
                        document.getElementById("copyWagerId");
                      buttonChaneEffect.src =
                        "/content/dam/sunbet/images/copy-regular.svg";
                      buttonChaneEffect.style.transform = "scale(1)";
                    }, 10000);
                  });
              } else {
                // Create an object to hold the data
                var betslipData = {
                  operator: "Sunbet Pty Ltd",
                  address: physc_address,
                  playerId: currentItem.playerId,
                  wagerId: currentItem.id,
                  dateTime: currentItem.transactionDate,
                  game: currentItem.description,
                  provider: currentItem.details.gameEngine,
                  licenseNumber: licence_number,
                  wagerAmount: currentItem.amount,
                  odds: odds,
                };

                // Convert the object to a JSON string
                var betslipJson = JSON.stringify(betslipData);

                window.localStorage.removeItem("betslipData");

                // Store the JSON string in local storage
                localStorage.setItem("betslipData", betslipJson);
                $(".bet-slip").append(
                  '<div class="betslip-details"><p class="bet-header">SunBet Betslip</p><p> <b>Operator:</b> Sunbet Pty Ltd</p><p> <b>Address:</b>' +
                    physc_address +
                    "</p><p> <b>PlayerId:</b> " +
                    currentItem.playerId +
                    '</p><p id="WagerIdValue"> <b>Wager Id:</b> ' +
                    currentItem.id +
                    '<img src="/content/dam/sunbet/images/copy-regular.svg" alt="copy"   id="copyWagerId" style="margin-left:20px; max-width: 20px; margin-top: -10px;"></p><p><b> Date/time:</b> ' +
                    currentItem.transactionDate +
                    "</p><p><b> Game:</b> " +
                    currentItem.description +
                    "</p><p><b> Provider:</b>" +
                    currentItem.details.gameEngine +
                    "</p><p><b> License Number:</b> " +
                    licence_number +
                    "</p><p><b> Amount:</b> " +
                    currentItem.amount +
                    '</p><p><b> Wager Type:</b></p></div><a class="border_form_btn border_form_btn_details less_padding_border" href="javascript:" data-id="' +
                    currentItem.id +
                    '">Export PDF</a>'
                );
                document
                  .getElementById("copyWagerId")
                  .addEventListener("click", function () {
                    let myValue =
                      document.getElementById("WagerIdValue").textContent;

                    const wagerIdArray = myValue.split("");
                    // Remove the "Wager Id : " part
                    const wagerIdWithoutPrefix = wagerIdArray
                      .slice(11)
                      .join("");

                    navigator.clipboard.writeText(wagerIdWithoutPrefix);
                    let buttonChaneEffect =
                      document.getElementById("copyWagerId");
                    buttonChaneEffect.src =
                      "/content/dam/sunbet/images/check-solid.svg";
                    buttonChaneEffect.style.transition = "0.5s";
                    buttonChaneEffect.style.transform = "scale(1.2)";
                    buttonChaneEffect.style.transition = "0.5s";
                    buttonChaneEffect.style.transform = "scale(1.2)";
                    setTimeout(() => {
                      let buttonChaneEffect =
                        document.getElementById("copyWagerId");
                      buttonChaneEffect.src =
                        "/content/dam/sunbet/images/copy-regular.svg";
                      buttonChaneEffect.style.transform = "scale(1)";
                    }, 10000);
                  });
              }
            }
          }

          // Call getProviderDetails with the callback function

          // Convert to JavaScript Date object
          var dateObject = new Date(currentItem.transactionDate);
          // Format the Date object in ISO 8601 format
          var iso8601Time = dateObject.toISOString();

          if (currentItem.details.gameEngine) {
            simlBC.getProviderDetails(
              currentItem.details.gameEngine,
              iso8601Time,
              handleProviderDetails
            );
          }
          if (currentItem.details.providerName) {
            var provider;
            if (currentItem.details.providerName == "Kambi") {
              provider = "Kambi - Sport";
            } else {
              provider = currentItem.details.providerName;
            }
            simlBC.getProviderDetails(
              provider,
              iso8601Time,
              handleProviderDetails
            );
          } else if (currentItem.betting.providerName) {
            simlBC.getProviderDetails(
              currentItem.betting.providerName,
              iso8601Time,
              handleProviderDetails
            );
          }
        }
      });
    };

    ctrl.loadkambiDetails = function (itemId) {
      // Use a regular expression to find numbers in the string
      const match = itemId.match(/\d+/);
      if (match) {
        var redirectURL = $("#betslipURL").attr("href");

        window.location.href = redirectURL + match[0]; // Use match[0] to get the first match
      } else {
        console.error("No valid item ID found");
      }
    };

    function resetPaginationData() {
      ctrl.paginationData = null;
      ctrl.totalPages = 0;

      ctrl.currentPage = 1;
      ctrl.skipItems = 0;
      ctrl.itemsPerPage = 10;
    }

    function loadDataWrapper() {
      var params = getParams(ctrl.skipItems, ctrl.itemsPerPage);
      if (!ctrl.paginationData) {
        sunbetApp.UTILS.showLoading();
        loadPaginationData(params, function (err) {
          sunbetApp.UTILS.hideLoading();
          loadStmtData(ctrl.currentPage, ctrl.skipItems, ctrl.itemsPerPage);
        });
      }
    }

    function loadPaginationData(params, cb) {
      betslipService.getCountTransactions(params, function (err, data) {
        if (err) {
          ctrl.error = err.errors[0];
          ctrl.data = null;
          ctrl.paginationData = null;
          $timeout(function () {
            $scope.$apply();
          });
          sunbetApp.UTILS.hideLoading();
          cb(err);
          return;
        }
        ctrl.paginationData = data;
        ctrl.totalPages = parseInt(data.totalPages);
        ctrl.currentPage = 1;
        cb();
      });
    }

    function loadStmtData(currentPageCount, skip, recordsPerPage) {
      $(".back-button").hide();
      var params = getParams(skip, recordsPerPage);
      sunbetApp.UTILS.showLoading();
      betslipService.getStatementTransaction(params, function (err, data) {
        sunbetApp.UTILS.hideLoading();
        if (err) {
          var errObj = err.errors[0];
          if (errObj.status == 500) {
            utilService.showInternalServerError(errObj);
          } else if (errObj.status == 404) {
            errObj.detail = "No results found";
          }
          ctrl.error = err.errors[0];
          ctrl.data = null;
          $timeout(function () {
            $scope.$apply();
          });
          return;
        }
        ctrl.data = data.items.map(function (item) {
          item.transactionDate = moment(item.transactionDate)
            .tz("Africa/Johannesburg")
            .format("YYYY-MM-DD HH:mm:ss");
          window.localStorage.removeItem("betslipDetails");
          window.localStorage.removeItem("transaction-history");
          window.localStorage.setItem(
            "transaction-history",
            JSON.stringify(data.items)
          );
          return item;
        });

        ctrl.error = null;
        $timeout(function () {
          $scope.$apply();
        });
      });
    }

    /*
      |--------------------------------------------------------------------------
      | Below is some helper functions
      |--------------------------------------------------------------------------
      */

    function headRows() {
      return [
        {
          operator: "Operator",
          address: "Address",
          playerId: "Player ID",
          id: "Wager ID",
          datetime: "Date and Time",
          game: "Game",
          amount: "Amount",
          wagerType: "Wager type",
          betdetails: "Bet Details",
          odds: "Odds",
        },
      ];
    }

    function footRows() {
      return [
        {
          trxType: "Transaction Type",
          datetime: "Date and Time",
          trxRef: "Transaction ref",
          amount: "Amount",
          balance: "Balance",
        },
      ];
    }

    function columns() {
      return [
        {
          header: "Transaction Type",
          dataKey: "trxType",
        },
        {
          header: "Date and Time",
          dataKey: "datetime",
        },
        {
          header: "Transaction ref",
          dataKey: "trxRef",
        },
        {
          header: "Amount",
          dataKey: "amount",
        },
        {
          header: "Balance",
          dataKey: "balance",
        },
      ];
    }

    function bodyRows(pdfBody) {
      let body = [];
      body.push({
        operator: pdfBody.operator,
        address: pdfBody.address,
        playerId: pdfBody.playerId,
        id: pdfBody.id,
        datetime: pdfBody.datetime,
        Game: pdfBody.description,
        amount: pdfBody.amount,
        wagerType: pdfBody.wagerType,
        betdetails: pdfBody.betdetails,
        odds: pdfBody.odds,
      });
      return body;
    }

    // Call Bede API for player details and use callback for the value
    function playerDetails(fn) {
      simlBC.getProfile(function (err, data) {
        sunbetApp.UTILS.hideLoading();
        if (err) {
          console.error("User details Could not be retrieved");
          return;
        } else if (data) {
          fn(data);
        }
      });
    }

    //The callback now has the details
    playerDetails(function (profile) {
      var details = profile;
      var firstName = details.player.profile.personal.firstName;
      var lastName = details.player.profile.personal.lastName;
      var accountNumber = details.player.id;
      var statementDate = new Date();
      var splitDate = statementDate.toString().split(" ");
      var formattedDate =
        splitDate[2] +
        " " +
        ctrl.months[statementDate.getMonth()] +
        " " +
        splitDate[3];

      var fileName;
      var fileTitle;

      // From html - shows how pdf tables can be drawn from html tables
      ctrl.htmlToPdf = function (pdfBody) {
        var doc = new jsPDF();
        var totalPagesExp = "{total_pages_count_string}";

        doc.autoTable({
          didDrawPage: function (data) {
            // Header
            /* Single page starts here */
            doc.setFontSize(15);

            doc.text("SunBet Account Number: " + accountNumber, 14, 10);

            doc.text("SunBet User Name: " + firstName + " " + lastName, 14, 18);

            doc.text("Betslip Date: " + formattedDate, 14, 26);

            doc.setFontSize(12);

            doc.text("Operator: " + pdfBody[0].operator, 14, 40);
            doc.text("Address: " + pdfBody[0].address, 14, 46);
            doc.text("Player Id: " + pdfBody[0].playerId, 14, 54);
            doc.text("Betslip Id: " + pdfBody[0].id, 14, 61);
            doc.text("Date & Time: " + pdfBody[0].datetime, 14, 70);
            doc.text("Game: " + pdfBody[0].description, 14, 78);
            doc.text("Provider: " + pdfBody[0].provider, 14, 86);
            doc.text("License Number: " + pdfBody[0].licenseNumber, 14, 94);
            doc.text("Amount: " + pdfBody[0].amount, 14, 102);
            doc.text("Wager Type: " + pdfBody[0].wagerType, 14, 110);
            doc.text("Bet Details: " + pdfBody[0].betDetail, 14, 118);
            doc.text("Odds: " + pdfBody[0].odds, 14, 126);

            //first convert svg logo image to JPEG through online tool(https://www.online-convert.com/result/74798829-7735-45cc-8533-166f46808388) then covert the JPEG image to Code using online tool (http://dataurl.sveinbjorn.org/#dataurlmaker)so that it can be saved in a variable
            var img =
              "data:image/jpeg;base64,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Mpj1kSVM32JSRQTX9VdU1MIjh9Ro3bs+JDAS7Hu9suGPxeS1u8alv928UXC7Vc0cuN8XiFsRxjHsDDfIHt357rPPiVa+FNlixpPqT1fdaaas4e2qukL5mbwYYD4j9ze7SG/JOePaxz8xUeao6s1tRug0/Tepx/1idodKex4by1vmOd2QfIqMkWK3PtnstkXQojHruftWVNTWVDqmrqJqid+N0kry9zsDAyTyeAAvq20NXcq+GhoYHz1Mztscbe5P+A8yTwByVsmk9AX6/iOcQ+pUL8H1ioBG5pwcsb3dwcg8NOPlKY9F6QtWmKUeqxiWtfGGT1Th7UnOTgZIaM+Q9wySRleUYdlz1lsj2y6MNl1PD0v0kzTlmbPV07G3eob/ABh28P8ADbnIjB7DjGcZy7zIAW3oi7kIRrjyx6GFycnqwiIpngREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBanf+nmmLvsd6l6hI3A30W2LIGeC3Bb598Z4HOOFtiKE64zWklqexk49CHrr0fr2yA2q7U0zCXZFS10ZYPvRloduPfPA7fHjUbjojVdBs8ex1b9+ceABN2x32E47+aseixy4bU17uq+/wAy5ZE11KpTRSQzPhmjfHLG4tex7cOa4HBBB7EL4Vrpoo5oXwzRskikaWvY9uWuB4IIPcLC1mkNL1dM6nlsNvax2MmKARO4OeHMwR28is8uGS/1kWLJXdFa0Vg3dN9GlpAtBGR3FTLx/wDssV9iLTf9du3+9j/cVL4dcnpsTWRAhFFN32ItN/127f72P9xYn7DX+sf6l/mKLwL12PVfDzInRSx9hr/WP9S/zF9wdHImzMM+oHyRBw3tZSBriPMAl5wfjgrz2G/8P8o98eHmRIim77EWm/67dv8Aex/uL7h6S6ZjmZI6pucrWuBMb5mbXgHscMBwfgQfipf4+4j7RAg5FYT7HGjP7H/Wpv3lmYdO6fhmZNDY7ZHLG4PY9lIwOa4HIIIHBBVseGWd2iLyY9kVqoKGtuE5goKOoq5Q3eWQRl7g3IGcDy5H51slo6daruPhO+p3qcUmftlU8M24z3by8Zx/R8x5cqwiK+HDIL4pakHkvsiKLP0eH2t94vHv8SGlj+fGHu/Efk+8fFbzpzR+n7A5stvoGestaB6xKS+TIBBIJ+STk524Bys8i1141Ve8UUyslLqwiIryAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAf/9k=";

            /* 	addImage explained below:
                          param 1 -> image in code format
                          param 2 -> type of the image. SVG not supported. needs to be either PNG or JPEG.
                          param 3 -> X axis margin from left
                          param 4 -> Y axis margin from top
                          param 5 -> width of the image
                          param 6 -> height of the image
                      */

            doc.addImage(img, "JPEG", 157, 5, 40, 17);

            // Footer
            doc.setFontSize(12);

            var pageSize = doc.internal.pageSize;
            //jsPDF 1.4+ uses getHeight, <1.4 uses .height
            var pageHeight = pageSize.height
              ? pageSize.height
              : pageSize.getHeight();

            // jsPDF 1.4+ uses getWidth, <1.4 uses .width
            var pageWidth = pageSize.width
              ? pageSize.width
              : pageSize.getWidth();
            doc.text("E&OE", 185, pageHeight - 55);
            doc.autoTable({
              html: "#footer_table_pdf",
              startY: pageHeight - 50,
              styles: {
                halign: "center",
                cellPadding: 0.2,
              },
            });

            var str = "Page " + doc.internal.getNumberOfPages();
            // Total page number plugin only available in jspdf v1.0+
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

        fileName = "Betslip.pdf";
        doc.save(fileName);
      };
    });

    function getParams(skip, take) {
      var d = new Date();
      d.setMonth(ctrl.months.indexOf(ctrl.selectedMonth));
      d.setFullYear(ctrl.selectedYear);

      var y = d.getFullYear();
      var m = d.getMonth();

      var firstDate = new Date(y, m, 1).getDate();
      var lastDate = new Date(y, m + 1, 0).getDate();

      firstDate = "0" + firstDate;

      var month = ctrl.months.indexOf(ctrl.selectedMonth) + 1;
      month = month < 10 ? "0" + month : month;

      var startdate;
      var finalenddate;
      var order;

      if (ctrl.startDate && ctrl.endDateFormatted) {
        // console.log("we are here", ctrl.startDate, ctrl.endDateFormatted);
        startdate = ctrl.startDate;
        finalenddate = ctrl.endDateFormatted;
        order = "asc";
      } else {
        startdate = ctrl.selectedYear + "-" + month + "-" + firstDate;
        var enddate = ctrl.selectedYear + "-" + month + "-" + lastDate;
        finalenddate = new Date(enddate).setHours(23, 59, 59, 999);
        order = "desc";
      }

      function formatDate(date) {
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let day = ("0" + date.getDate()).slice(-2);
        let hours = ("0" + date.getHours()).slice(-2);
        let minutes = ("0" + date.getMinutes()).slice(-2);
        let seconds = ("0" + date.getSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      var param = {
        startdate: formatDate(new Date(startdate)),
        enddate: formatDate(new Date(finalenddate)),
        sort: order,
        type: ctrl.allTrans,
      };

      if (skip) {
        param.skip = skip;
      }
      if (take) {
        param.take = take;
      }
      return param;
    }
  }
})(angular, sunbetApp, window["simlBC"]);


<script>
function sfpAdvancedNavigation(){let e="sfp-advanced-navigation-js";StudioForm.forEach(t=>{["studio-form","sf"].forEach(r=>{let i=`${r}-${t.name}`,o=`[${i}^="to-"]`;document.querySelectorAll(o).forEach(r=>{!r.getAttribute(e)&&(r.setAttribute(e,""),r.addEventListener("click",()=>{let e=r.getAttribute(i).slice(3),o=t.logic.find(t=>t.name==e||t.index==e)?.index,d=[...Array(o+1).keys()];(!(d[d.length-1]>t.record[t.record.length-1].index)||t.reportValidity())&&((e=r.getAttribute("sfp-removed-slides"))&&e.split(",").forEach(e=>d=d.filter(t=>t!=e.trim())),t.record=d)}))}),document.querySelectorAll(`[${i}="reset"]`).forEach(r=>{!r.getAttribute(e+"-reset")&&(r.setAttribute(e+"-reset",""),r.addEventListener("click",()=>sfpMemoryWrite(t,{})))})})})}window.StudioForm=window.StudioForm||[],window.StudioForm.push(sfpAdvancedNavigation);
</script>



<script>
window.StudioForm = window.StudioForm || [];
window.StudioForm.push(withdrawControl);

function withdrawControl() {
  // Values
  const sf = StudioForm.withdraw_form;
  let globalBalanceData = null;

  // Modal display logic
  ['sf-transition', 'sf-transition-api'].forEach(str =>
    sf.elements.mask.addEventListener(str, e => {
      const showNeedHelp = sf.record[sf.record.length - 1] > 4;
      gsap.set('[sunbet-withdraw="wallet-balance"]', {
        display: showNeedHelp ? 'none' : 'flex',
      });
      gsap.set('[sunbet-withdraw="need-help"]', {
        display: showNeedHelp ? 'flex' : 'none',
      });
    })
  );

  // sf - to add bank account
  function sfToAddBankAccount() {
    sf.resolve = false;
    sf.to('add-bank-account');
    sf.resolve = true;

    // Message
    Swal.fire({
      title: 'Missing bank account!',
      text: 'Please add a bank account for withdrawals before proceeding',
    });
  }

  // Throw swal error
  function throwSwalErr(err, noThen = false) {
    // Guard
    if (!err) return;

    // Show
    const error = err.errors[0];
    Swal.fire({
      icon: 'error',
      title: error.code,
      text: error.detail,
    }).then(result => {
      // Guard
      if (typeof noThen == 'function') noThen();
      if (noThen) return;

      // Open modal
      document.querySelector('[sunbet-modals="login"]').click();

      // Listen to modal close
      window.addEventListener('sunbet-modals-close', renderBalances, {
        once: true,
      });
    });

    // Defautl
    return true;
  }

  // Balance
  function renderBalances(event) {
    // Guard
    if (event && !event.detail.successClose) return;

    simlBC.getBalances((err, data) => {
      // Guard
      if (throwSwalErr(err)) return;

      // Elements
      const cash = document.querySelector(
        '[sunbet-withdraw="digitalPlayableCash"]'
      );
      const bonus = document.querySelector(
        '[sunbet-withdraw="digitalTotalBonus"]'
      );
      const total = document.querySelector(
        '[sunbet-withdraw="digitalTotalCash"]'
      );
      const loader = document.querySelector(
        '[sunbet-withdraw="wallet-balance-loader"]'
      );

      // Render
      const d = data[0];
      cash.innerHTML = d.digitalPlayableCash;
      bonus.innerHTML = d.digitalTotalBonus;
      total.innerHTML = d.digitalTotalCash;
      loader.classList.remove('is-hidden', 'is-loading');

      // Overwrite
      globalBalanceData = d;
    });
  }
  renderBalances();

  // Event listener
  ['sf-promise', 'sf-promise-api'].forEach(str =>
    sf.elements.mask.addEventListener(str, async e => {
      // Values
      const d = e.detail;
      const currentSlide = sf.logic[d.current];
      const nextSlide = sf.logic[d.next];
      const isFirst = currentSlide.index == 0;
      let resolve = isFirst;

      // SF amount sf-to trigger
      if (isFirst) {
        const trigger = document.querySelector(
          '[sunbet-withdraw="amount-studio-form-trigger"]'
        );

        trigger.setAttribute(
          'studio-form-withdraw_form',
          'to-' + nextSlide.name
        );
        trigger.setAttribute(
          'sfp-removed-slides',
          Array.from({ length: nextSlide.index - 1 }, (_, i) => i + 1).join()
        );
      }

      // -api guard
      // if (str == 'sf-promise-api') return;

      // EFT case
      if (nextSlide?.name == 'eft') await eftLogic();

      // Add bank account case
      if (currentSlide.name == 'add-bank-account') await addBankAccount(d);

      // Amount slides
      if (!isFirst && nextSlide && nextSlide.name.indexOf('-confirmation') < 0)
        await amountLogic(d);

      // Return
      if (sf.isAwaiting) sf.resolve = resolve;
    })
  );

  // Eft logic
  async function eftLogic() {
    // Values
    const response = await new Promise(resolve =>
      simlBC.getPaymentEntities((err, data) =>
        resolve({ error: err, data: data })
      )
    );
    const bankAccountList = [];

    // Err
    if (throwSwalErr(response.error)) {
      sf.resolve = false;
      return;
    }

    // Existing
    response.data.paymentEntities.forEach(item => {
      if (
        item.paymentEntityType == 'Bank' &&
        item.paymentEntityStatus === 'Verified' &&
        item.accountHolder != 'Unknown' &&
        item.details.bankName !== 'Nedbank Send Imali' &&
        item.details.bankName !== 'OTT' &&
        item.details.bankName != 'OTT-FNB' &&
        item.details.bankName != 'OTT-STDBNK-IM' &&
        item.details.bankName != 'OTT-NEDBANKEMALI' &&
        item.details.bankName !== 'INSTANT-MONEY' &&
        item.details.bankName !== 'KAZANG' &&
        item.details.bankName !== 'OTT-KAZANG'
      ) {
        bankAccountList.push(item);
      }
    });

    // No accounts existing
    if (!bankAccountList.length) return sfToAddBankAccount();

    // Add bank accounts
    const select = document.querySelector('[sunbet-withdraw="eft-select"]');
    while (select.options.length > 1) {
      select.remove(1);
    }
    bankAccountList.forEach(account => {
      const option = document.createElement('option');
      option.value = account.accountNumber;
      option.text = `${account.details.bankName}: ${account.accountNumber}`;
      select.add(option);
    });
  }

  // Bank account
  async function addBankAccount(detail) {
    // Values
    const data = sf.data(detail.current);

    console.log('Bank account adding: ', data);

    // Await
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: Add new bank account to select

    // Animate [start, eft]
    sf.resolve = false;
    sf.to(0);
  }

  // Amount slides logic
  async function amountLogic(detail) {
    // Values
    // const formData = sf.data();
    const stepData = sf.data(detail.current);
    let response = await new Promise(resolve =>
      simlBC.getPaymentEntities((err, data) =>
        resolve({ error: err, data: data })
      )
    );

    // Err
    if (throwSwalErr(response.error)) return;

    // Loop
    const account = response.data.paymentEntities.find(item => {
      // Values & logics
      const currentAcc = stepData.option;
      if (!currentAcc) return;
      const last4 = currentAcc.slice(-4);
      const oldAcc = item.accountNumber;

      // Guard
      if (
        item.paymentEntityType == 'Bank' &&
        item.paymentEntityStatus === 'Verified' &&
        item.accountHolder != 'Unknown' &&
        item.details.bankName === 'OTT-KAZANG'
      )
        return;

      // Reduce
      return oldAcc.includes(last4);
    });

    // console.log(response, 'acc', account);

    // requestOTP Guard a.k.a. not eft case!
    if (!account) {
      console.log('Build request OTP');
      return requestOTP(stepData);

      // sfToAddBankAccount();
    }

    // Values
    const entityInfo = {
      amount: stepData.amount,
      payment_entity_id: account.id,
      currency_code: globalBalanceData.currencyCode,
    };

    // Render success slide
    const amountEl = document.querySelector(
      '[sunbet-withdraw="eft-confirmation-amount"]'
    );
    const accountEl = document.querySelector(
      '[sunbet-withdraw="eft-confirmation-account"]'
    );
    amountEl.innerHTML = stepData.amount;
    accountEl.innerHTML = stepData.option;

    // Fetch
    response = await new Promise(resolve =>
      simlBC.requestWithdrawal(entityInfo, (err, data) =>
        resolve({ error: err, data: data })
      )
    );
    const { data } = response;

    // console.log(entityInfo, response, 'acc', account);

    // Err
    if (throwSwalErr(response.error, true)) return;

    // Fica cases
    if ([2, 3].includes(data._authres.RejectionCode)) {
      throwSwalErr(
        {
          errors: [
            {
              code: 'Thanks for betting with SunBet',
              detail:
                "We hope you've enjoyed your time with us, unfortunately you've reached your withdrawal limit and now we're legally required to ask for your FICA documents.",
            },
          ],
        },
        () => {
          sunbetModalsRender('fica');
        }
      );
      return;
    }

    // SMS case
    if (data._authres.RejectionCode == 1 && data._smsres.sent == true) {
      Swal.fire({
        title: 'Please check your phone for OTP',
        text: data._smsres.msg,
      }).then(() => {
        requestOTP(stepData);
      });
      return;
    }

    // Else
    sfToSuccess();
  }

  // Trigger otp
  async function requestOTP(stepData) {
    // Open pop up
    Swal.fire({
      title: 'Please Enter Your One-Time Password (OTP)',
      text: 'The PIN sent to your registered cell number',
      input: 'number',
      inputAttributes: {
        min: 100000,
        max: 999999,
        required: true,
      },
      footer:
        '*By clicking submit, you confirm that the account is under your full control.',
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: preConfirm,
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(afterConfirm);

    // Send sms message
    const response = await new Promise(resolve =>
      simlBC.requestSessionPin(500, 'mobile', (err, data) =>
        resolve({ error: err, data: data })
      )
    );

    // Response logic
    if (throwSwalErr(response.error, true)) return;

    // // Pre
    // async function preConfirm(data) {
    //   // Check sms
    //   const response = await new Promise(resolve =>
    //     simlBC.confirmFicaPin(data, (err, data) =>
    //       resolve({ error: err, data: data })
    //     )
    //   );

    //   // Guard
    //   if (throwSwalErr(response.error)) return;

    //   // Return response
    //   return response;
    // }

    // // After
    // async function afterConfirm(result) {
    //   // Guard
    //   if (!result.value) return;
    // }

    // Pre
    async function preConfirm(data) {
      // Check sms
      const response = await new Promise(resolve =>
        simlBC.verifySessionPin(500, data, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      // Guard
      if (throwSwalErr(response.error, true)) return;

      // Return response
      return response;
    }

    // After
    async function afterConfirm(result) {
      // Guard
      if (!result.value) return;

      // Values
      const bank_data = {
        details: {},
      };
      bank_data.accountHolder = null;
      bank_data.details.bankName = 'OTT-KAZANG';
      bank_data.details.accountNumber = null;
      bank_data.details.branchCode = null;

      // Check sms
      let response = await new Promise(resolve =>
        simlBC.registerWithdrawalEntity(bank_data, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      // Guards
      if (throwSwalErr(response.error, true)) return;
      if (response.data.paymentEntityStatus != 'Verified') return;

      // Values
      const entityInfo = {
        amount: stepData.amount,
        payment_entity_id: response.data.id,
        currency_code: globalBalanceData.currencyCode,
      };

      // Render success slide
      const amountEls = document.querySelectorAll(
        '[sunbet-withdraw="confirmation-amount"]'
      );
      const phoneEls = document.querySelectorAll(
        '[sunbet-withdraw="confirmation-phone"]'
      );
      amountEls.forEach(el => (el.innerHTML = stepData.amount));
      phoneEls.forEach(el => (el.innerHTML = stepData.phone));

      // Withdraw
      response = await new Promise(resolve =>
        simlBC.requestWithdrawal(entityInfo, (err, data) =>
          resolve({ error: err, data: data })
        )
      );

      // Guards
      if (throwSwalErr(response.error, true)) return;

      // Success
      sfToSuccess();
    }
  }

  // Success
  function sfToSuccess() {
    // Values
    const data = sf.data();
    const sfToName = data.payment_option + '-confirmation';
    const navigatorElements = document.querySelectorAll(
      '[sf-withdraw_form^="current-"]'
    );
    const confirmationNavigatorElements = document.querySelectorAll(
      '[sf-withdraw_form="current-{{ var }}"]'
    );

    // Style
    gsap.set(navigatorElements, { pointerEvents: 'none' });
    confirmationNavigatorElements.forEach(el => el.classList.add('sf-current'));

    // Move
    sf.resolve = false;
    sf.to(sfToName);
    sf.resolve = true;

    // Reload
    renderBalances();
  }
}
</script>