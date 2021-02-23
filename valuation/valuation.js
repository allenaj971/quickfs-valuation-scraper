// this file will value companies based on cash flow statement
const cfs = require("../json/scraped_financials/cash_flow_statement.json");
const is = require("../json/scraped_financials/income_statement.json");
// import json export
var fs = require("fs");
// storing indices for the accounting metrics required from the json file
let ocf_index, ppe_index, dep_index, rev_index, ebit_index, shares_index;
// Exact string to check indices in the json file these metrics
const ocf = "Cash From Operations";
const ppe = "Property, Plant, & Equipment";
const dep = "Depreciation & Amortization";
const sales = "Revenue";
const ebit = "Operating Profit";
const shares = "Shares (Diluted)";
// initialise cfs_metrics so that it can be exported
const cfs_metrics = [];
// growth rates to simulate various business growth rates
const grow_rates = ["0.05", "0.1", "0.15", "0.2", "0.3", "0.4", "0.5"];

// this for loop FCF Margin and Rule of 40
for (i = 0; i < cfs.length; i++) {
  // Initialise cfs_metrics company array
  cfs_metrics[i] = [];

  for (let j = 0; j < cfs[i].length; j++) {
    if (String(cfs[i][j][0]).includes(ocf)) {
      // if element matches "Cash from Operations", set j to ocf_index
      ocf_index = j;
    }
    if (String(cfs[i][j][0]).includes(ppe)) {
      // if element matches "Property, Plant and Equipment", set j to ppe_index
      ppe_index = j;
    }
    if (String(cfs[i][j][0]).includes(dep)) {
      // if element matches "Depreciation and Amortization", set j to dep_index
      dep_index = j;
    }
  }

  for (let j = 0; j < is[i].length; j++) {
    if (String(is[i][j][0]).includes(sales)) {
      // if element matches "Revenue", set j to rev_index
      rev_index = j;
    }
    if (String(is[i][j][0]).includes(ebit)) {
      // if element matches "Operating Profit", set j to ebit_index
      ebit_index = j;
    }
    if (String(is[i][j][0]).includes(shares)) {
      // if element includes "Shares (Diluted)", set j to shares_index
      shares_index = j;
    }
  }

  // assign jth index company name
  cfs_metrics[i][0] = cfs[i][0];

  // Add Years and FCF Margin. we loop the length of the year no of times
  for (let k = 0; k < cfs[i][1].length; k++) {
    // assign new row for years
    cfs_metrics[i][1] = [];
    // Add FCF margin years heading
    cfs_metrics[i][1][0] = "Year - FCF margin";

    for (l = 1; l < cfs[i][1].length - 1; l++) {
      cfs_metrics[i][1][l] = cfs[i][1][l];
    }

    // assign new row for FCF margin
    cfs_metrics[i][2] = [];
    // Add FCF margin
    cfs_metrics[i][2][0] = "FCF Margin";

    // we iterate and assign to cfs_metrics.json valid FCF % sales values
    for (let l = 1; l < cfs[i][1].length - 1; l++) {
      // Add FCF Margin = OCF_current_period / Sales_current_period
      // site: https://blog.apruve.com/profitability-metrics-free-cash-flow-margin
      if (
        String(
          parseFloat(cfs[i][ocf_index][l].replace(/[^\d\.\-]/g, "")) /
            parseFloat(is[i][rev_index][l].replace(/[^\d\.\-]/g, ""))
        ) === "NaN"
      ) {
        cfs_metrics[i][2][l] = "0";
      } else {
        cfs_metrics[i][2][l] = (
          parseFloat(cfs[i][ocf_index][l].replace(/[^\d\.\-]/g, "")) /
          parseFloat(is[i][rev_index][l].replace(/[^\d\.\-]/g, ""))
        ).toFixed(2);
      }
    }
    // initialise the rule of 40 values row
    cfs_metrics[i][3] = [];
    cfs_metrics[i][3][0] =
      "Rule of 40 (SaaS metric - value must be greater than 40% or 0.4)";
    // ((EBIT + D&A)/ Sales) + growth rates (provide multiple rates to show whether business is undervalued or overvalued based on different rates)
    // growth rate used is the YoY OCF growth rate: https://www.thesaascfo.com/rule-of-40-saas/
    cfs_metrics[i][3][1] = (
      (parseFloat(
        is[i][ebit_index][is[i][ebit_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][dep_index][cfs[i][dep_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) /
        parseFloat(
          is[i][rev_index][is[i][rev_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        ) +
      parseFloat(
        cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) /
        parseFloat(
          cfs[i][ocf_index][cfs[i][ocf_index].length - 2].replace(
            /[^\d\.\-]/g,
            ""
          )
        )
    ).toFixed(2);
  }

  // Below are the TTM
  // FCF-based EV valuation. FCF * multiple / no of shares = EV
  // Then divide EV by shares (diluted) to get value/share
  evfcf_ratio = 20;
  cfs_metrics[i][4] = [];
  cfs_metrics[i][5] = [];
  cfs_metrics[i][5][0] = `Share Value based on multiple of TTM FCF (SaaS)`;
  cfs_metrics[i][4][0] = `Multiple:`;

  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][4][j] = `${evfcf_ratio}x`;
    cfs_metrics[i][5][j] = (
      ((parseFloat(
        cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) *
        parseFloat(evfcf_ratio)) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    evfcf_ratio += 10;
  }

  // EBIT-based EV valuation. EBIT * multiple / no of shares = EV
  evebit_ratio = 20;
  cfs_metrics[i][6] = [];
  cfs_metrics[i][6][0] = "Share Value based on multiple of TTM EBIT (SaaS)";
  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][6][j] = (
      (parseFloat(
        is[i][ebit_index][is[i][ebit_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) *
        evebit_ratio) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    evebit_ratio += 10;
  }

  // EBITDA-based EV valuation. EBITDA * multiple / no of shares = EV
  evebitda_ratio = 20;
  cfs_metrics[i][7] = [];
  cfs_metrics[i][7][0] = "Share Value based on multiple of TTM EBITDA (SaaS)";
  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][7][j] = (
      ((parseFloat(
        is[i][ebit_index][is[i][ebit_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][dep_index][cfs[i][dep_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) *
        evebitda_ratio) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    evebitda_ratio += 10;
  }

  // Sales-based EV valuation. Sales * multiple / no of shares = EV
  sales_ratio = 20;
  cfs_metrics[i][8] = [];
  cfs_metrics[i][8][0] = "Share Value based on multiple of TTM Sales (SaaS)";
  for (let j = 1; j < 6; j++) {
    cfs_metrics[i][8][j] = (
      (parseFloat(
        is[i][rev_index][is[i][rev_index].length - 1].replace(/[^\d\.\-]/g, "")
      ) *
        sales_ratio) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
    sales_ratio += 10;
  }

  // Discounted FCF 5 years into the future based on growth rates:
  cfs_metrics[i][9] = [];
  cfs_metrics[i][9][0] = "Growth Rates";

  cfs_metrics[i][10] = [];
  cfs_metrics[i][10][0] = "DCF analysis";
  for (let j = 1; j < grow_rates.length + 1; j++) {
    cfs_metrics[i][9][j] = grow_rates[j - 1];
    cfs_metrics[i][10][j] = (
      ((((parseFloat(
        cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      ) +
        parseFloat(
          cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        )) *
        (1 + parseFloat(grow_rates[j - 1]))) /
        (1 + 0.15) +
        ((parseFloat(
          cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        ) +
          parseFloat(
            cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
              /[^\d\.\-]/g,
              ""
            )
          )) *
          (1 + parseFloat(grow_rates[j - 1])) ** 2) /
          (1 + 0.15) ** 2 +
        ((parseFloat(
          cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        ) +
          parseFloat(
            cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
              /[^\d\.\-]/g,
              ""
            )
          )) *
          (1 + parseFloat(grow_rates[j - 1])) ** 3) /
          (1 + 0.15) ** 3 +
        ((parseFloat(
          cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        ) +
          parseFloat(
            cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
              /[^\d\.\-]/g,
              ""
            )
          )) *
          (1 + parseFloat(grow_rates[j - 1])) ** 4) /
          (1 + 0.15) ** 4 +
        ((parseFloat(
          cfs[i][ocf_index][cfs[i][ocf_index].length - 1].replace(
            /[^\d\.\-]/g,
            ""
          )
        ) +
          parseFloat(
            cfs[i][ppe_index][cfs[i][ppe_index].length - 1].replace(
              /[^\d\.\-]/g,
              ""
            )
          )) *
          (1 + parseFloat(grow_rates[j - 1])) ** 5) /
          (1 + 0.15) ** 5) *
        20) /
      parseFloat(
        is[i][shares_index][is[i][shares_index].length - 1].replace(
          /[^\d\.\-]/g,
          ""
        )
      )
    ).toFixed(2);
  }
}

// write to JSON file: https://www.semicolonworld.com/question/47954/node-js-how-to-write-an-array-to-file
fs.writeFile(
  "../json/valuation/cfs_metrics.json",
  JSON.stringify(cfs_metrics),
  function (err) {
    if (err) {
      console.error(err);
    }
  }
);

// Periods year
// if (cfs[i][1].length > 4) {
//   // we iterate and assign to cfs_metrics.json the valid years
//   for (let l = 2; l < cfs[i][1].length - 2; l++) {
//     // // Add periods
//     // cfs_metrics[i][1][l - 1] = cfs[i][1][l - 1] + "-" + cfs[i][1][l];
//     // cfs_metrics[i][1][l] = cfs[i][1][l] + "-" + cfs[i][1][l + 1];
//   }
// } else if (cfs[i][1].length <= 4) {
//   // cfs_metrics[i][1][1] = cfs[i][1][1] + "-" + cfs[i][1][2];
// }
