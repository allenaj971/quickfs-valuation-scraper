// this file will value companies based on cash flow statement
const cfs = require(".././json/cash_flow_statement.json");
const is = require(".././json/income_statement.json");
// import json export
var fs = require("fs");
// where to find indices in the json file for the accounting metrics required
let ocf_index, ppe_index, dep_index, rev_index, ebit_index;
// Exact string to check indices in the json file these metrics
const ocf = "Cash From Operations";
const ppe = "Property, Plant, & Equipment";
const dep = "Depreciation & Amortization";
const sales = "Revenue";
const ebit = "Operating Profit";
// initialise cfs_metrics so that it can be exported
const cfs_metrics = [];
// growth rates to simulate various business growth rates
const grow_rates = ["0.05", "0.1", "0.15", "0.2", "0.3", "0.4", "0.5"];

// // Run other scripts to avoid having to execute them manually. Right now not working because it launches multiple instances of puppeteer
// require("child_process").fork(".././scraper/income_statement.js");
// require("child_process").fork(".././scraper/cash_flow_statement.js");

// this for loop display OCF growth
for (i = 0; i < cfs.length; i++) {
  // Initialise cfs_metrics company array
  cfs_metrics[i] = [];

  // check for sales rev_index,
  for (j = 0; j < cfs[i].length; j++) {
    // if element matches "Revenue", set j to rev_index
    if (String(is[i][j][0]).match(sales)) {
      rev_index = j;
    }
    // if element matches "Cash from Operations", set j to ocf_index
    if (String(cfs[i][j][0]).match(ocf)) {
      ocf_index = j;
    }
    // if element matches "Property, Plant and Equipment", set j to ppe_index
    if (String(cfs[i][j][0]).match(ppe)) {
      ppe_index = j;
    }
    // if element matches "Depreciation and Amortization", set j to dep_index
    if (String(cfs[i][j][0]).match(dep)) {
      dep_index = j;
    }
    // if element matches "Operating Profit", set j to dep_index
    if (String(is[i][j][0]).match(ebit)) {
      ebit_index = j;
    }
  }

  // Add Years and FCF Margin. we loop the length of the year no of times
  for (let k = 0; k < cfs[i][1].length; k++) {
    // assign new row for years
    cfs_metrics[i][1] = [];

    // we iterate and assign to cfs_metrics.json the valid years
    for (let l = 1; l < cfs[i][1].length - 2; l++) {
      // Add periods
      cfs_metrics[i][1][l - 1] = cfs[i][1][l - 1] + "-" + cfs[i][1][l];
      cfs_metrics[i][1][l] = cfs[i][1][l] + "-" + cfs[i][1][l + 1];
    }

    // Assign new row for FCF margin year heading
    cfs_metrics[i][3] = [];
    // assign new row for FCF margin
    cfs_metrics[i][4] = [];

    // we iterate and assign to cfs_metrics.json valid FCF % sales values
    for (let l = 0; l < cfs[i][1].length - 1; l++) {
      // Assign FCF margin years
      cfs_metrics[i][3][l] = cfs[i][1][l];
      // Add FCF Margin = OCF_current_period / Sales_current_period
      // site: https://blog.apruve.com/profitability-metrics-free-cash-flow-margin
      cfs_metrics[i][4][l] = (
        parseFloat(cfs[i][ocf_index][l]) / parseFloat(is[i][rev_index][l])
      ).toFixed(2);
    }

    // Add FCF margin years heading
    cfs_metrics[i][3][0] = "Year - FCF margin, Rule of 40";
    // Add FCF margin
    cfs_metrics[i][4][0] = "FCF Margin";
  }

  // copy company values to cfs_statement array. length - 19 to avoid repeated copies
  for (j = 2; j < cfs[i].length - 18; j++) {
    if (!cfs_metrics[i][j]) {
      // if cfs_statement[i][] doesn't exist, create new one
      cfs_metrics[i][j] = [];
      // assign company name
      cfs_metrics[i][0] = cfs[i][0];
    }

    // loop over valid OCF values and assign to cfs_metrics.json
    for (let k = 1; k < cfs[i][j].length - 2; k++) {
      // OCF values
      if (!cfs_metrics[i][j][k]) {
        cfs_metrics[i][j][k] = [];
        // OCF growth = (OCF_current / OCF_prior) ^ (1 / difference between periods of OCF) - 1
        cfs_metrics[i][j][k] = (
          (parseFloat(cfs[i][ocf_index][k + 1]) /
            parseFloat(cfs[i][ocf_index][k])) **
            (1 / (parseFloat(cfs[i][1][k + 1]) - parseFloat(cfs[i][1][k]))) -
          1
        ).toFixed(2);
      }
      // add year to beginning of loop to make sure
      cfs_metrics[i][1][0] = "Period - OCF Growth";
      // FCF Growth title
      cfs_metrics[i][j][0] = "OCF Growth YoY";
    }
  }

  // initialise the rule of 40 values row
  cfs_metrics[i][5] = [];
  cfs_metrics[i][5][0] = "Rule of 40 (SaaS - value must be greater than 40%)";
  // EBITDA / Sales + growth rates
  for (let j = is[i][rev_index].length - 1; j < is[i][rev_index].length; j++) {
    for (let k = 1; k < 3; k++) {
      // ((EBIT + D&A)/ Sales) + growth rates (provide multiple rates to show whether business is undervalued or overvalued based on different rates)
      // to check growth rates, check grow_rates array at start of file
      cfs_metrics[i][5][k] = (
        (parseFloat(is[i][ebit_index][j]) + parseFloat(cfs[i][dep_index][j])) /
          parseFloat(cfs[i][rev_index][j]) +
        parseFloat(cfs_metrics[i][2][cfs[i][2].length])
      ).toFixed(2);
    }
  }

  // FCF growth modelling
  cfs_metrics[i][6] = [];
  cfs_metrics[i][6][0] = "FCF growth modelling";

  // write to JSON file: https://www.semicolonworld.com/question/47954/node-js-how-to-write-an-array-to-file
  fs.writeFile(
    "./cfs_metrics.json",
    JSON.stringify(cfs_metrics),
    function (err) {
      if (err) {
        console.error(err);
      }
    }
  );
}
